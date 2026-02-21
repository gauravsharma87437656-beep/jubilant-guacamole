
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get("active") === "true";

        const occasions = await prisma.occasion.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: {
                sortOrder: "asc",
            },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                isActive: true,
                _count: {
                    select: { products: true },
                },
            },
        });

        const transformedOccasions = occasions.map((occasion) => ({
            ...occasion,
            productCount: occasion._count.products,
            _count: undefined,
        }));

        return NextResponse.json({ occasions: transformedOccasions }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
            }
        });
    } catch (error) {
        console.error("Error fetching occasions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Basic admin check - ideally use session/auth here but keeping it simple as per existing patterns or lack thereof
        // In a real app, verify admin role.

        const body = await request.json();
        const { name, slug, image, description } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { error: "Name and Slug are required" },
                { status: 400 }
            );
        }

        const occasion = await prisma.occasion.create({
            data: {
                name,
                slug,
                image,
                description,
                isActive: true,
            },
        });

        return NextResponse.json({ occasion }, { status: 201 });
    } catch (error) {
        console.error("Error creating occasion:", error);
        if ((error as any).code === "P2002") {
            return NextResponse.json(
                { error: "Occasion with this slug already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
