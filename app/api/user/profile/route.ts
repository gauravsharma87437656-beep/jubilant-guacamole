import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, address1, address2, city, state, postalCode, country } = body;

    // Update user name
    const userData: { name?: string } = {};
    if (name) {
      userData.name = name;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: userData,
    });

    // Update or create address
    const existingAddress = await prisma.address.findFirst({
      where: { userId: session.user.id },
    });

    if (existingAddress) {
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: {
          address1: address1 || existingAddress.address1,
          address2: address2 || existingAddress.address2,
          city: city || existingAddress.city,
          state: state || existingAddress.state,
          postalCode: postalCode || existingAddress.postalCode,
          country: country || existingAddress.country,
        },
      });
    } else if (address1 || city || state) {
      await prisma.address.create({
        data: {
          userId: session.user.id,
          firstName: name || session.user.name || "User",
          lastName: "",
          address1: address1 || "",
          address2: address2 || "",
          city: city || "",
          state: state || "",
          postalCode: postalCode || "",
          country: country || "US",
          type: "shipping",
          isDefault: true,
        },
      });
    }

    // Update customer phone if exists
    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
    });

    if (customer && phone) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { phone },
      });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
