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

    // Update vendor status to REJECTED
    const vendor = await prisma.vendor.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    // Revert user role back to USER
    await prisma.user.update({
      where: { id: vendor.userId },
      data: { role: "USER" },
    });

    return NextResponse.json({ 
      message: "Vendor rejected",
      vendor 
    });
  } catch (error) {
    console.error("Error rejecting vendor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
