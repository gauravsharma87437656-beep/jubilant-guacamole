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

    // Get disputes with related data
    const disputes = await prisma.dispute.findMany({
      where: { status: "OPEN" },
      include: {
        rental: {
          include: {
            customer: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const transformedDisputes = disputes.map((dispute: typeof disputes[number]) => ({
      id: dispute.id,
      type: dispute.type,
      status: dispute.status,
      title: dispute.title,
      description: dispute.description,
      rental: {
        orderNumber: dispute.rental?.orderNumber || "N/A",
        customer: {
          user: {
            name: dispute.rental?.customer?.user?.name || "Unknown",
          },
        },
      },
      createdAt: dispute.createdAt,
    }));

    return NextResponse.json({ disputes: transformedDisputes });
  } catch (error) {
    console.error("Admin disputes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
