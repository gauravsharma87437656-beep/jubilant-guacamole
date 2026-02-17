import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, slug, description, image, isActive } = body;

        // Build update data dynamically — only update provided fields
        const data: Record<string, unknown> = {};
        if (typeof name === "string") data.name = name;
        if (typeof slug === "string") data.slug = slug;
        if (typeof description === "string") data.description = description;
        if (typeof image === "string") data.image = image;
        if (typeof isActive === "boolean") data.isActive = isActive;

        const category = await prisma.category.update({
            where: { id },
            data,
        });

        return NextResponse.json({ category });
    } catch (error) {
        console.error("Error updating category:", error);
        if ((error as any).code === "P2002") {
            return NextResponse.json(
                { error: "A category with this slug already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Failed to update category" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { error: "Failed to delete category" },
            { status: 500 }
        );
    }
}
