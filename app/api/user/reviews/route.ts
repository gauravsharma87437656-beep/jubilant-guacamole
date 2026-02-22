import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch user's reviews + reviewable items
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { customer: true },
        });

        if (!user?.customer) {
            return NextResponse.json({ reviews: [], reviewableItems: [] });
        }

        // Fetch existing reviews
        const reviews = await prisma.review.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: true,
                        slug: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Fetch delivered rentals that haven't been reviewed yet
        const deliveredRentals = await prisma.rental.findMany({
            where: {
                customerId: user.customer.id,
                status: { in: ["DELIVERED", "ACTIVE", "RETURNED", "RETURN_REQUESTED"] },
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get product IDs that have already been reviewed
        const reviewedProductIds = new Set(reviews.map((r) => r.productId));

        // Build list of reviewable items (not yet reviewed)
        const reviewableItems: Array<{
            rentalItemId: string;
            rentalId: string;
            productId: string;
            productName: string;
            productImage: string;
            orderNumber: string;
        }> = [];

        for (const rental of deliveredRentals) {
            for (const item of rental.items) {
                if (!reviewedProductIds.has(item.productId)) {
                    const images = item.product.images as string[];
                    reviewableItems.push({
                        rentalItemId: item.id,
                        rentalId: rental.id,
                        productId: item.productId,
                        productName: item.product.name,
                        productImage: images?.[0] || "",
                        orderNumber: rental.orderNumber,
                    });
                }
            }
        }

        return NextResponse.json({ reviews, reviewableItems });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}

// POST: Submit a new review
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { customer: true },
        });

        if (!user?.customer) {
            return NextResponse.json(
                { error: "Customer profile not found" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { productId, rating, title, content } = body;

        if (!productId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Product and rating (1-5) are required" },
                { status: 400 }
            );
        }

        // Check if already reviewed
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: session.user.id,
                productId: productId,
            },
        });

        if (existingReview) {
            return NextResponse.json(
                { error: "You have already reviewed this product" },
                { status: 400 }
            );
        }

        // Create review
        const review = await prisma.review.create({
            data: {
                productId,
                customerId: user.customer.id,
                userId: session.user.id,
                rating,
                title: title || null,
                content: content || null,
                status: "APPROVED",
            },
        });

        // Update product rating
        const productReviews = await prisma.review.findMany({
            where: { productId, status: "APPROVED" },
            select: { rating: true },
        });

        const avgRating =
            productReviews.reduce((sum, r) => sum + r.rating, 0) /
            productReviews.length;

        await prisma.product.update({
            where: { id: productId },
            data: {
                rating: avgRating,
                reviewCount: productReviews.length,
            },
        });

        return NextResponse.json({ review });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json(
            { error: "Failed to submit review" },
            { status: 500 }
        );
    }
}
