import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RentalStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const now = new Date();

    const includeOptions = {
      vendor: {
        select: {
          id: true,
          businessName: true,
          businessSlug: true,
        },
      },
      brand: {
        select: {
          name: true,
          slug: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      variants: {
        select: {
          id: true,
          size: true,
          color: true,
          inventory: true,
          isAvailable: true,
        },
      },
      blockDates: {
        where: {
          endDate: { gte: now },
        },
        select: {
          startDate: true,
          endDate: true,
          reason: true,
        },
      },
      rentals: {
        where: {
          rental: {
            is: {
              rentalEndDate: { gte: now },
              status: {
                in: [
                  RentalStatus.PENDING,
                  RentalStatus.CONFIRMED,
                  RentalStatus.SHIPPED,
                  RentalStatus.DELIVERED,
                  RentalStatus.ACTIVE,
                ],
              },
            },
          },
        },
        select: {
          rental: {
            select: {
              rentalStartDate: true,
              rentalEndDate: true,
              status: true,
            },
          },
        },
      },
    };

    // Try to find by ID first, then by slug
    let product = await prisma.product.findUnique({
      where: { id },
      include: includeOptions,
    });

    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: id },
        include: includeOptions,
      });
    }

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => { });

    // Build booked date ranges from active rentals
    const bookedDates = product.rentals.map((ri: { rental: { rentalStartDate: Date; rentalEndDate: Date } }) => ({
      startDate: ri.rental.rentalStartDate.toISOString(),
      endDate: ri.rental.rentalEndDate.toISOString(),
    }));

    // Build blocked date ranges
    const blockedDates = product.blockDates.map((bd: { startDate: Date; endDate: Date; reason: string | null }) => ({
      startDate: bd.startDate.toISOString(),
      endDate: bd.endDate.toISOString(),
      reason: bd.reason,
    }));

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.images as string[],
      dailyPrice: Number(product.dailyPrice),
      weeklyPrice: product.weeklyPrice ? Number(product.weeklyPrice) : null,
      depositAmount: Number(product.depositAmount),
      rating: Number(product.rating),
      reviewCount: product.reviewCount,
      condition: product.condition,
      vendor: product.vendor,
      brand: product.brand,
      category: product.category,
      variants: product.variants,
      bookedDates,
      blockedDates,
    };

    return NextResponse.json({ product: transformedProduct });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

