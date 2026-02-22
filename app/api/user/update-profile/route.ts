import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Update user name
        await prisma.user.update({
            where: { id: session.user.id },
            data: { name: name.trim() },
        });

        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
