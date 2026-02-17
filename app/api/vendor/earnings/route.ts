import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch vendor's earnings and analytics
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

    // Get all completed rentals for this vendor (that have been delivered/returned)
    const rentals = await prisma.rental.findMany({
      where: {
        vendorId: vendor.id,
        status: { in: ["DELIVERED", "ACTIVE", "RETURNED"] as any },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    // Calculate total earnings (before platform fee)
    const totalEarnings = rentals.reduce((sum: number, rental) => {
      const rentalTotal = Number(rental.totalAmount);
      const platformFee = Number(rental.platformFee);
      // Vendor gets totalAmount - platformFee
      return sum + (rentalTotal - platformFee);
    }, 0);

    // Get all completed payouts
    const completedPayouts = await prisma.payout.findMany({
      where: {
        vendorId: vendor.id,
        status: "COMPLETED",
      },
    });

    // Calculate total paid out
    const totalPaidOut = completedPayouts.reduce((sum: number, payout) => {
      return sum + Number(payout.amount);
    }, 0);

    // Calculate pending balance (earnings - paid out)
    const pendingBalance = totalEarnings - totalPaidOut;

    // Get pending payouts (not yet paid)
    const pendingPayoutsList = await prisma.payout.findMany({
      where: {
        vendorId: vendor.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
      orderBy: { createdAt: "desc" },
    });

    const pendingPayoutAmount = pendingPayoutsList.reduce((sum: number, payout) => {
      return sum + Number(payout.amount);
    }, 0);

    // Get all payouts for history
    const allPayouts = await prisma.payout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Get rental stats
    const activeRentals = await prisma.rental.count({
      where: {
        vendorId: vendor.id,
        status: "ACTIVE",
      },
    });

    const totalSales = await prisma.rental.count({
      where: {
        vendorId: vendor.id,
        status: { in: ["DELIVERED", "ACTIVE", "RETURNED"] as any },
      },
    });

    return NextResponse.json({
      totalEarnings,
      totalPaidOut,
      pendingBalance,
      pendingPayoutAmount,
      activeRentals,
      totalSales,
      rating: Number(vendor.rating),
      payouts: allPayouts,
      bankDetails: {
        bankName: vendor.bankName,
        bankAccount: vendor.bankAccount,
        bankRouting: vendor.bankRouting,
        paypalEmail: vendor.paypalEmail,
      },
    });
  } catch (error) {
    console.error("Error fetching vendor earnings:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
