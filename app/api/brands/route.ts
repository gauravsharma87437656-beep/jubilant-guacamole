import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const active = searchParams.get("active") !== "false";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (featured) {
      where.isFeatured = true;
    }

    if (active) {
      where.isActive = true;
    }

    const brands = await prisma.brand.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
      ],
    });

    // Transform brands to match frontend interface
    const transformedBrands = brands.map((brand: typeof brands[number]) => ({
      id: brand.id,
      name: brand.name,
      logo: brand.logo || "",
    }));

    return NextResponse.json({
      brands: transformedBrands,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch brands", details: process.env.NODE_ENV === "development" ? errorMessage : undefined },
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
    const { name, logo, description, website, isActive, isFeatured, sortOrder } = body;

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        logo,
        description,
        website,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
