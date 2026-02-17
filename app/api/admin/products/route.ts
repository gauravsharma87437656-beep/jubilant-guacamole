import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");

    const where = featured === "true" ? { isFeatured: true } : {};

    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: {
            businessName: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      images,
      dailyPrice,
      categoryId,
      brandId,
      status,
      isFeatured,
    } = body;

    if (!name || !dailyPrice || !categoryId) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    // Get the first vendor to assign the product to (since admin creates it)
    let vendor = await prisma.vendor.findFirst({
      where: { status: "APPROVED" },
    });

    // If no vendor exists, create a system vendor
    if (!vendor) {
      const systemUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });

      if (systemUser) {
        vendor = await prisma.vendor.create({
          data: {
            userId: systemUser.id,
            businessName: "RentSquire Official",
            businessSlug: "rentsquire-official",
            status: "APPROVED",
          },
        });
      }
    }

    if (!vendor) {
      return NextResponse.json(
        { error: "No vendor available to assign product" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description,
        images: images || [],
        dailyPrice: dailyPrice,
        categoryId,
        brandId: brandId || null,
        vendorId: vendor.id,
        status: status || "ACTIVE",
        isFeatured: isFeatured ?? true,
      },
      include: {
        vendor: {
          select: {
            businessName: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
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
