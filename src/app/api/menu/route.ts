import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { name: "asc" },
          include: {
            sizePrices: { select: { sizeId: true, price: true } },
          },
        },
      },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Fetch menu error:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}
