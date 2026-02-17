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

    // Get rentals with payment info for escrow tracking
    const rentals = await prisma.rental.findMany({
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
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const transactions = rentals.map((rental: typeof rentals[number]) => ({
      id: rental.id,
      amount: Number(rental.totalAmount),
      status: rental.payment?.status || "PENDING",
      type: rental.status === "RETURNED" ? "ESCROW_RELEASE" : "ESCROW_HOLD",
      createdAt: rental.createdAt,
      order: {
        id: rental.id,
        product: {
          name: rental.items[0]?.productName || "N/A",
        },
        user: {
          name: rental.customer.user.name,
          email: rental.customer.user.email,
        },
        vendor: {
          businessName: rental.vendor.businessName,
        },
      },
    }));

    // Calculate escrow stats
    const inEscrow = rentals
      .filter((r: typeof rentals[number]) => r.status !== "RETURNED" && r.payment?.status === "COMPLETED")
      .reduce((sum: number, r: typeof rentals[number]) => sum + Number(r.totalAmount), 0);

    const released = rentals
      .filter((r: typeof rentals[number]) => r.status === "RETURNED" && r.payment?.status === "COMPLETED")
      .reduce((sum: number, r: typeof rentals[number]) => sum + Number(r.totalAmount), 0);

    const pendingRelease = rentals
      .filter((r: typeof rentals[number]) => r.status === "RETURNED" && (!r.payment || r.payment.status !== "COMPLETED"))
      .reduce((sum: number, r: typeof rentals[number]) => sum + Number(r.totalAmount), 0);

    return NextResponse.json({
      transactions,
      stats: {
        totalInEscrow: inEscrow,
        totalReleased: released,
        pendingReleases: pendingRelease,
      },
    });
  } catch (error) {
    console.error("Error fetching finance data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
