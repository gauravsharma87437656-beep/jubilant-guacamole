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

export async function POST(request: Request) {
  try {
    // Basic admin check - ideally use server-side session check if authOptions available
    // For now assuming the page doing the calling is protected or we implement simple check

    const body = await request.json();
    const { name, slug, image, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and Slug are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image,
        description,
        isActive: true,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
