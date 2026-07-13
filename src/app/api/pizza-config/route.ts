import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [sizes, crusts, sauces, toppings, addons] = await Promise.all([
      prisma.pizzaSize.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.pizzaCrust.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.pizzaSauce.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.pizzaTopping.findMany({ where: { isAvailable: true } }),
      prisma.pizzaAddon.findMany({ where: { isAvailable: true } }),
    ]);

    return NextResponse.json({ sizes, crusts, sauces, toppings, addons });
  } catch (error) {
    console.error("Fetch pizza config error:", error);
    return NextResponse.json({ error: "Failed to fetch pizza configurations" }, { status: 500 });
  }
}
