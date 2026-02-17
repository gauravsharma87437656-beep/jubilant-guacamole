import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH - Approve or Reject a payout
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const payout = await prisma.payout.findUnique({
      where: { id },
      include: {
        vendor: true,
      },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    if (payout.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending payouts can be processed" },
        { status: 400 }
      );
    }

    const newStatus = action === "approve" ? "COMPLETED" : "REJECTED";
    const now = new Date();

    const updatedPayout = await prisma.payout.update({
      where: { id },
      data: {
        status: newStatus,
        processedAt: now,
        completedAt: action === "approve" ? now : null,
      },
    });

    // Create notification for vendor
    await prisma.notification.create({
      data: {
        userId: payout.vendor.userId,
        type: action === "approve" ? "PAYOUT_COMPLETED" : "PAYOUT_REJECTED",
        title: action === "approve" ? "Payout Completed" : "Payout Rejected",
        message:
          action === "approve"
            ? `Your payout request of ₹${Number(payout.amount).toLocaleString()} has been processed and transferred to your bank account.`
            : `Your payout request of ₹${Number(payout.amount).toLocaleString()} has been rejected. Please contact support for more information.`,
      },
    });

    return NextResponse.json({ payout: updatedPayout });
  } catch (error) {
    console.error("Error updating payout:", error);
    return NextResponse.json(
      { error: "Failed to update payout" },
      { status: 500 }
    );
  }
}
