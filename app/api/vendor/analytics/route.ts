import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch vendor's analytics
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total views from products
    const products = await prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: {
        id: true,
        name: true,
        viewCount: true,
        rentalCount: true,
        rating: true,
        reviews: true,
      },
    });

    const totalViews = products.reduce((sum: number, p: typeof products[number]) => sum + p.viewCount, 0);
    const totalRentals = products.reduce((sum: number, p: typeof products[number]) => sum + p.rentalCount, 0);
    const averageRating =
      products.length > 0
        ? products.reduce((sum: number, p: typeof products[number]) => sum + Number(p.rating), 0) / products.length
        : 0;

    // Get revenue from completed rentals
    const rentals = await prisma.rental.findMany({
      where: {
        vendorId: vendor.id,
        status: { in: ["RETURNED", "DELIVERED", "ACTIVE"] },
        createdAt: { gte: startDate },
      },
      include: {
        items: true,
      },
    });

    const totalRevenue = rentals.reduce((sum: number, rental: typeof rentals[number]) => {
      return sum + Number(rental.totalAmount);
    }, 0);

    // Top products by revenue
    const productRevenue: Record<string, { name: string; revenue: number; views: number; rentals: number; rating: number }> = {};
    
    rentals.forEach((rental: typeof rentals[number]) => {
      rental.items.forEach((item: typeof rental.items[number]) => {
        if (!productRevenue[item.productId]) {
          const product = products.find((p: typeof products[number]) => p.id === item.productId);
          productRevenue[item.productId] = {
            name: item.productName,
            revenue: 0,
            views: product?.viewCount || 0,
            rentals: product?.rentalCount || 0,
            rating: product ? Number(product.rating) : 0,
          };
        }
        productRevenue[item.productId].revenue += Number(item.subtotal);
      });
    });

    const topProducts = Object.entries(productRevenue)
      .map(([id, data]) => ({
        id,
        name: data.name,
        views: data.views,
        rentals: data.rentals,
        revenue: data.revenue,
        rating: data.rating,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      totalViews,
      totalRentals,
      totalRevenue,
      averageRating,
      topProducts,
    });
  } catch (error) {
    console.error("Error fetching vendor analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
