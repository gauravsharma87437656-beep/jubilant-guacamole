import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch vendor's dashboard data
export async function GET() {
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

    // Get total products
    const totalProducts = await prisma.product.count({
      where: { vendorId: vendor.id },
    });

    // Get active rentals
    const activeRentals = await prisma.rental.count({
      where: {
        vendorId: vendor.id,
        status: { in: ["ACTIVE", "DELIVERED"] },
      },
    });

    // Get total earnings
    const rentals = await prisma.rental.findMany({
      where: {
        vendorId: vendor.id,
        status: { in: ["RETURNED", "DELIVERED", "ACTIVE"] },
      },
      select: {
        totalAmount: true,
        platformFee: true,
      },
    });

    const totalEarnings = rentals.reduce((sum: number, rental: typeof rentals[number]) => {
      return sum + (Number(rental.totalAmount) - Number(rental.platformFee));
    }, 0);

    // Get recent orders
    const recentOrders = await prisma.rental.findMany({
      where: { vendorId: vendor.id },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        items: {
          take: 1,
          select: {
            productName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const formattedOrders = recentOrders.map((order: typeof recentOrders[number]) => ({
      id: order.id,
      productName: order.items[0]?.productName || "Unknown Product",
      customerName: order.customer.user.name || "Unknown Customer",
      startDate: order.rentalStartDate,
      endDate: order.rentalEndDate,
      status: order.status,
      totalAmount: Number(order.totalAmount),
    }));

    return NextResponse.json({
      totalProducts,
      activeRentals,
      totalEarnings,
      averageRating: Number(vendor.rating),
      recentOrders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching vendor dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
