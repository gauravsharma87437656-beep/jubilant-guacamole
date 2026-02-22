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
