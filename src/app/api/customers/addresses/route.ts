import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/customerSession";

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: session.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("List customer addresses error:", error);
    return NextResponse.json({ error: "Failed to load addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const label = normalizeString(body?.label);
    const addressLine1 = normalizeString(body?.addressLine1);
    const addressLine2 = normalizeString(body?.addressLine2);
    const city = normalizeString(body?.city);
    const postcode = normalizeString(body?.postcode);
    const landmark = normalizeString(body?.landmark);
    const isDefaultRequested = body?.isDefault === true;

    if (!addressLine1) {
      return NextResponse.json({ error: "Address line 1 is required" }, { status: 400 });
    }

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const existingAddresses = await prisma.address.findMany({
      where: { customerId: session.id },
      select: { id: true },
    });

    const shouldDefault = existingAddresses.length === 0 || isDefaultRequested;

    const address = await prisma.$transaction(async (tx) => {
      if (shouldDefault) {
        await tx.address.updateMany({
          where: { customerId: session.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          customerId: session.id,
          label: label || null,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          postcode: postcode || null,
          landmark: landmark || null,
          isDefault: shouldDefault,
        },
      });
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Create customer address error:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
