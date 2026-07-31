import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const where = includeInactive ? {} : { isActive: true };

    const drivers = await prisma.driver.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("Fetch drivers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}

const createDriverSchema = z.object({
  name: z.string().min(1, "Driver name is required"),
  phone: z.string().min(1, "Phone number is required"),
  vehicleType: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createDriverSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, vehicleType } = result.data;

    const newDriver = await prisma.driver.create({
      data: {
        name,
        phone,
        vehicleType: vehicleType || null,
      },
    });

    return NextResponse.json({ success: true, driver: newDriver });
  } catch (error) {
    console.error("Create driver error:", error);
    return NextResponse.json(
      { error: "Failed to create driver" },
      { status: 500 }
    );
  }
}
