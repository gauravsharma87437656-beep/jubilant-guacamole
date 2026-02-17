import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      businessName,
      businessSlug,
      description,
      phone,
      bankName,
      bankAccount,
      bankRouting,
      paypalEmail,
    } = await request.json();

    // Validate input
    if (!businessName || !businessSlug) {
      return NextResponse.json(
        { error: "Business name and slug are required" },
        { status: 400 }
      );
    }

    // Check if user already has a vendor profile
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: "You already have a vendor application" },
        { status: 400 }
      );
    }

    // Check if slug is taken
    const slugExists = await prisma.vendor.findUnique({
      where: { businessSlug },
    });

    if (slugExists) {
      return NextResponse.json(
        { error: "Store URL slug is already taken" },
        { status: 400 }
      );
    }

    // Create vendor with PENDING status
    const vendor = await prisma.vendor.create({
      data: {
        userId: session.user.id,
        businessName,
        businessSlug,
        description,
        phone,
        bankName,
        bankAccount,
        bankRouting,
        paypalEmail,
        status: "PENDING", // Admin needs to approve
      },
    });

    // NOTE: User role stays as USER until admin approves the vendor application.
    // The role will be updated to VENDOR in the admin approve route.

    return NextResponse.json(
      { message: "Vendor application submitted", vendorId: vendor.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
