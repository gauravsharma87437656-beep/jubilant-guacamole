import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      orderNumber,
      productId,
      variantId,
      vendorId,
      rentalStart,
      rentalEnd,
      rentalDays,
      dailyPrice,
      depositAmount,
      shippingAddressId,
      paymentMethod,
    } = body;

    // Get user's customer profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { customer: true },
    });

    if (!user?.customer) {
      return NextResponse.json(
        { error: "Customer profile not found" },
        { status: 400 }
      );
    }

    // Verify product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { vendor: true },
    });

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Product is not available for rental" },
        { status: 400 }
      );
    }

    // Check variant availability if specified
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });
      if (!variant || !variant.isAvailable || variant.inventory < 1) {
        return NextResponse.json(
          { error: "Selected variant is out of stock" },
          { status: 400 }
        );
      }
    }

    // Check for overlapping rentals on the same product for the requested dates
    const startDate = new Date(rentalStart);
    const endDate = new Date(rentalEnd);

    const overlappingRentals = await prisma.rentalItem.findMany({
      where: {
        productId,
        variantId: variantId || undefined,
        status: { notIn: ["CANCELLED"] },
        rental: {
          status: { notIn: ["CANCELLED"] },
          rentalStartDate: { lte: endDate },
          rentalEndDate: { gte: startDate },
        },
      },
    });

    if (overlappingRentals.length > 0) {
      return NextResponse.json(
        { error: "Product is not available for the selected dates" },
        { status: 400 }
      );
    }

    // Get shipping address
    const address = await prisma.address.findUnique({
      where: { id: shippingAddressId },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Shipping address not found" },
        { status: 400 }
      );
    }

    // Use vendor's commission rate from DB
    const commissionRate = Number(product.vendor.commissionRate) / 100;

    // Calculate totals
    const subtotal = dailyPrice * rentalDays;
    const platformFee = Math.round(subtotal * commissionRate);
    const totalAmount = subtotal + depositAmount + platformFee;

    // Create rental, rental item, and payment atomically in a transaction
    const rental = await prisma.$transaction(async (tx) => {
      const newRental = await tx.rental.create({
        data: {
          orderNumber,
          customerId: user.customer!.id,
          vendorId,
          status: "PENDING",
          rentalStartDate: startDate,
          rentalEndDate: endDate,
          subtotal,
          depositAmount,
          deliveryFee: 0,
          platformFee,
          taxAmount: 0,
          totalAmount,
          shippingAddress: {
            firstName: address.firstName,
            lastName: address.lastName,
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            phone: address.phone,
          },
        },
      });

      // Parse images from JSON field
      let productImage = "";
      try {
        const imagesArray = typeof product.images === 'string' 
          ? JSON.parse(product.images) 
          : product.images;
        productImage = Array.isArray(imagesArray) ? imagesArray[0] || "" : "";
      } catch (e) {
        console.error("Error parsing product images:", e);
        productImage = "";
      }

      await tx.rentalItem.create({
        data: {
          rentalId: newRental.id,
          productId,
          variantId,
          productName: product.name,
          productImage: productImage,
          variantSize: null,
          variantColor: null,
          dailyPrice,
          weeklyPrice: product.weeklyPrice ? Number(product.weeklyPrice) : null,
          rentalDays,
          subtotal,
          status: "PENDING",
        },
      });

      await tx.payment.create({
        data: {
          rentalId: newRental.id,
          customerId: user.customer!.id,
          amount: totalAmount,
          currency: "INR",
          method: paymentMethod === "cod" ? "CASH_ON_DELIVERY" : "CARD",
          status: "PENDING",
          rentalCost: subtotal,
          deposit: depositAmount,
          deliveryFee: 0,
          tax: 0,
          platformFee,
        },
      });

      return newRental;
    });

    return NextResponse.json({ success: true, rental });
  } catch (error) {
    console.error("Error creating order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create order", details: errorMessage },
      { status: 500 }
    );
  }
}
