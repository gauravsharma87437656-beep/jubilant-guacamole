import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Transform categories to match frontend interface
    const transformedCategories = categories.map((category: typeof categories[number]) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      productCount: category._count.products,
    }));

    return NextResponse.json({
      categories: transformedCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
