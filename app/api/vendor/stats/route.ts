import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get vendor info
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({
        totalListings: 0,
        activeRentals: 0,
        totalEarnings: 0,
        pendingReturns: 0,
      });
    }

    // Get total products
    const productsCount = await prisma.product.count({
      where: { vendorId: vendor.id },
    });

    // Get active rentals count
    const activeRentals = await prisma.rental.count({
      where: {
        vendorId: vendor.id,
        status: "ACTIVE",
      },
    });

    // Get pending returns
    const pendingReturns = await prisma.rental.count({
      where: {
        vendorId: vendor.id,
        status: "RETURN_REQUESTED",
      },
    });

    // Get total earnings from completed rentals
    const earnings = await prisma.rental.aggregate({
      where: {
        vendorId: vendor.id,
        status: { in: ["RETURNED", "DELIVERED"] },
      },
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      totalListings: productsCount,
      activeRentals,
      totalEarnings: earnings._sum.totalAmount?.toNumber() || 0,
      pendingReturns,
    });
  } catch (error) {
    console.error("Vendor stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
