import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch vendor's orders
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { vendorId: vendor.id };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.rental.findMany({
      where,
      include: {
        customer: {
          include: {
            user: {
              select: { name: true, email: true, image: true },
            },
          },
        },
        items: {
          include: {
            product: {
              select: { name: true, images: true },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match the expected format
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      depositAmount: order.depositAmount,
      deliveryFee: order.deliveryFee,
      platformFee: order.platformFee,
      taxAmount: order.taxAmount,
      createdAt: order.createdAt.toISOString(),
      startDate: order.rentalStartDate.toISOString(),
      endDate: order.rentalEndDate.toISOString(),
      shippingAddress: order.shippingAddress,
      customerNote: order.customerNote,
      customer: {
        name: order.customer.user.name || "Unknown",
        email: order.customer.user.email,
        image: order.customer.user.image,
        phone: order.customer.phone,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: 1,
        price: item.subtotal,
        rentalDays: item.rentalDays,
      })),
      payment: order.payment
        ? {
          status: order.payment.status,
          method: order.payment.method,
        }
        : null,
    }));

    return NextResponse.json({ orders: transformedOrders });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
