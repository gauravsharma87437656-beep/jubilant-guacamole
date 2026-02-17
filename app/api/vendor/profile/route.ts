import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ vendor: null });
    }

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        businessName: vendor.businessName,
        businessSlug: vendor.businessSlug,
        description: vendor.description,
        logo: vendor.logo,
        banner: vendor.banner,
        phone: vendor.phone,
        status: vendor.status,
        rating: Number(vendor.rating),
        totalSales: vendor.totalSales,
        isVerified: vendor.isVerified,
        createdAt: vendor.createdAt,
      },
    });
  } catch (error) {
    console.error("Vendor profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessName, description, phone, logo, banner } = body;

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        businessName: businessName || vendor.businessName,
        description: description || vendor.description,
        phone: phone || vendor.phone,
        logo: logo || vendor.logo,
        banner: banner || vendor.banner,
      },
    });

    return NextResponse.json({ vendor: updatedVendor });
  } catch (error) {
    console.error("Vendor profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
