import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Update vendor status and user role atomically
    const vendor = await prisma.$transaction(async (tx) => {
      const updatedVendor = await tx.vendor.update({
        where: { id },
        data: {
          status: "APPROVED",
          verifiedAt: new Date(),
          isVerified: true,
        },
      });

      // Now assign the VENDOR role to the user
      await tx.user.update({
        where: { id: updatedVendor.userId },
        data: { role: "VENDOR" },
      });

      return updatedVendor;
    });

    return NextResponse.json({
      message: "Vendor approved successfully",
      vendor
    });
  } catch (error) {
    console.error("Error approving vendor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
