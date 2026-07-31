import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const configs = await prisma.systemConfig.findMany();
    const configMap: Record<string, string> = {
      deliveryEnabled: "true",
      deliveryFee: "3.99",
      freeDeliveryThreshold: "35.00",
      estimatedDeliveryMin: "25",
      deliveryRadiusKm: "8.0",
      basePrepTime: "15",
      prepTimePerActiveOrder: "5",
      taxRate: "0.10",
    };

    configs.forEach((item) => {
      configMap[item.key] = item.value;
    });

    return NextResponse.json({ config: configMap });
  } catch (error) {
    console.error("Fetch system config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch system configurations" },
      { status: 500 }
    );
  }
}
