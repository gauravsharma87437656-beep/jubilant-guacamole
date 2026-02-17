import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch vendor's own products
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      include: {
        category: {
          select: { name: true },
        },
        brand: {
          select: { name: true },
        },
        variants: true,
        _count: {
          select: { rentals: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create a new product for vendor
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get vendor profile
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      images,
      dailyPrice,
      weeklyPrice,
      depositAmount,
      categoryId,
      brandId,
      occasionId,
      gender,
      status,
      isFeatured,
      variants,
    } = body;

    if (!name || !dailyPrice || !categoryId) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description,
        images: images || [],
        dailyPrice,
        weeklyPrice,
        depositAmount: depositAmount || 50,
        categoryId,
        brandId: brandId || null,
        occasionId: occasionId || null,
        gender: gender || "NONE",
        vendorId: vendor.id,
        status: status || "DRAFT",
        isFeatured: isFeatured ?? false,
        variants: variants
          ? {
            create: variants.map((v: { size: string; color?: string; inventory: number }) => ({
              size: v.size,
              color: v.color,
              inventory: v.inventory || 1,
            })),
          }
          : undefined,
      },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
