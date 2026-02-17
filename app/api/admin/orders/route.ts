import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * limit;

    const [rentals, totalRentals] = await Promise.all([
      prisma.rental.findMany({
        include: {
          customer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          vendor: {
            select: {
              businessName: true,
            },
          },
          items: {
            select: {
              productName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip,
      }),
      prisma.rental.count(),
    ]);

    const orders = rentals.map((rental: typeof rentals[number]) => ({
      id: rental.id,
      startDate: rental.rentalStartDate,
      endDate: rental.rentalEndDate,
      totalPrice: Number(rental.totalAmount),
      status: rental.status,
      createdAt: rental.createdAt,
      user: {
        name: rental.customer.user.name,
        email: rental.customer.user.email,
      },
      product: {
        name: rental.items[0]?.productName || "N/A",
      },
      vendor: {
        businessName: rental.vendor.businessName,
      },
    }));

    const stats = await prisma.rental.aggregate({
      _sum: {
        totalAmount: true,
      },
      _count: true,
    });

    const completedOrders = await prisma.rental.count({
      where: { status: "RETURNED" },
    });

    const pendingOrders = await prisma.rental.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
      orders,
      stats: {
        totalRevenue: stats._sum.totalAmount || 0,
        totalOrders: stats._count,
        completedOrders,
        pendingOrders,
      },
      pagination: {
        page,
        limit,
        total: totalRentals,
        totalPages: Math.ceil(totalRentals / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
