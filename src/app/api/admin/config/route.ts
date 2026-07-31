import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    console.error("Fetch admin config error:", error);
    return NextResponse.json(
      { error: "Failed to fetch system configurations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { config } = body as { config: Record<string, string> };

    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { error: "Invalid configuration payload" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      Object.entries(config).map(([key, value]) =>
        prisma.systemConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update admin config error:", error);
    return NextResponse.json(
      { error: "Failed to update system configurations" },
      { status: 500 }
    );
  }
}
