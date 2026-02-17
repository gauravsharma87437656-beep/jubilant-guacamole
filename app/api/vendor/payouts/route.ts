import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch vendor's payouts
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

    const payouts = await prisma.payout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

// POST - Request a new payout
export async function POST(request: Request) {
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

    // Check if bank details are added
    if (!vendor.bankName || !vendor.bankAccount || !vendor.bankRouting) {
      return NextResponse.json(
        { error: "Please add your bank account details before requesting a payout" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Minimum withdrawal amount
    if (amount < 100) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is ₹100" },
        { status: 400 }
      );
    }

    // Calculate available balance
    const rentals = await prisma.rental.findMany({
      where: {
        vendorId: vendor.id,
        status: { in: ["DELIVERED", "ACTIVE", "RETURNED"] },
      },
      select: {
        totalAmount: true,
        platformFee: true,
      },
    });

    const totalEarnings = rentals.reduce((sum: number, rental: typeof rentals[number]) => {
      return sum + (Number(rental.totalAmount) - Number(rental.platformFee));
    }, 0);

    // Get total of pending and processing payouts
    const pendingPayouts = await prisma.payout.findMany({
      where: {
        vendorId: vendor.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
      select: { amount: true },
    });

    const pendingAmount = pendingPayouts.reduce((sum: number, p: typeof pendingPayouts[number]) => sum + Number(p.amount), 0);
    const availableBalance = totalEarnings - pendingAmount;

    // Check for insufficient funds
    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ₹${availableBalance.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Use vendor's commission rate from DB
    const commissionRate = Number(vendor.commissionRate) / 100;
    const commission = Math.round(amount * commissionRate);
    const netAmount = amount - commission;

    const payout = await prisma.payout.create({
      data: {
        vendorId: vendor.id,
        amount: amount,
        grossAmount: amount,
        commission: commission,
        netAmount: netAmount,
        status: "PENDING",
        method: "BANK_TRANSFER",
      },
    });

    return NextResponse.json({ payout });
  } catch (error) {
    console.error("Error creating payout:", error);
    return NextResponse.json(
      { error: "Failed to create payout" },
      { status: 500 }
    );
  }
}
