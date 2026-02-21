import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get counts
    const [totalUsers, totalVendors, activeRentals, disputes, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count({ where: { status: "APPROVED" } }),
      prisma.rental.count({ where: { status: "ACTIVE" } }),
      prisma.dispute.count({ where: { status: "OPEN" } }),
      prisma.rental.aggregate({
        where: { status: { in: ["RETURNED", "DELIVERED"] } },
        _sum: { totalAmount: true },
      }),
    ]);

    // Get pending vendor count
    const pendingVendors = await prisma.vendor.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
      totalUsers,
      totalVendors,
      activeRentals,
      totalRevenue: revenue._sum.totalAmount?.toNumber() || 0,
      openDisputes: disputes,
      pendingReviews: pendingVendors,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
