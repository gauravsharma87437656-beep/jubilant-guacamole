import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

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

        // Fetch the rental with all details
        const rental = await prisma.rental.findFirst({
            where: {
                id: id,
                customerId: user.customer.id,
            },
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
        });

        if (!rental) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ rental });
    } catch (error) {
        console.error("Error fetching rental:", error);
        return NextResponse.json(
            { error: "Failed to fetch order details" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { action } = body;

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

        // Fetch the rental to verify ownership
        const rental = await prisma.rental.findFirst({
            where: {
                id: id,
                customerId: user.customer.id,
            },
            include: { items: true, payment: true },
        });

        if (!rental) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        if (action === "cancel") {
            // Only allow cancellation for PENDING and CONFIRMED orders
            if (!["PENDING", "CONFIRMED"].includes(rental.status)) {
                return NextResponse.json(
                    { error: "Only pending or confirmed orders can be cancelled" },
                    { status: 400 }
                );
            }

            // Cancel the rental, all items, and update payment status
            await prisma.$transaction(async (tx) => {
                await tx.rental.update({
                    where: { id },
                    data: { status: "CANCELLED" },
                });

                await tx.rentalItem.updateMany({
                    where: { rentalId: id },
                    data: { status: "CANCELLED" },
                });

                // If there's a payment, mark it as refunded/cancelled
                if (rental.payment) {
                    await tx.payment.update({
                        where: { id: rental.payment.id },
                        data: { status: "REFUNDED" },
                    });
                }
            });

            return NextResponse.json({ success: true, message: "Order cancelled successfully" });
        }

        return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error updating rental:", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}
