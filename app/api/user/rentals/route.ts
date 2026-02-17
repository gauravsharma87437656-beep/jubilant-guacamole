import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Fetch all rentals for the customer with items and product details
    const rentals = await prisma.rental.findMany({
      where: { customerId: user.customer.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  select: {
                    businessName: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats
    const activeRentals = rentals.filter(
      (r) => r.status === "ACTIVE" || r.status === "DELIVERED"
    ).length;

    const upcomingRentals = rentals.filter(
      (r) => r.status === "CONFIRMED" || r.status === "SHIPPED"
    ).length;

    const pendingRentals = rentals.filter(
      (r) => r.status === "PENDING"
    ).length;

    return NextResponse.json({
      rentals,
      stats: {
        active: activeRentals,
        upcoming: upcomingRentals,
        pending: pendingRentals,
        total: rentals.length,
      },
    });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return NextResponse.json(
      { error: "Failed to fetch rentals" },
      { status: 500 }
    );
  }
}
