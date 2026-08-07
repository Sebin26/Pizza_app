import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/customerSession";

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingAddress = await prisma.address.findUnique({ where: { id } });
    if (!existingAddress || existingAddress.customerId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const label = normalizeString(body?.label);
    const addressLine1 = normalizeString(body?.addressLine1);
    const addressLine2 = normalizeString(body?.addressLine2);
    const city = normalizeString(body?.city);
    const postcode = normalizeString(body?.postcode);
    const landmark = normalizeString(body?.landmark);
    const makeDefault = body?.isDefault === true;

    if (!addressLine1) {
      return NextResponse.json({ error: "Address line 1 is required" }, { status: 400 });
    }

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const address = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({
          where: { customerId: session.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          label: label || null,
          addressLine1,
          addressLine2: addressLine2 || null,
          city,
          postcode: postcode || null,
          landmark: landmark || null,
          isDefault: makeDefault || existingAddress.isDefault,
        },
      });
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Update customer address error:", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingAddress = await prisma.address.findUnique({ where: { id } });
    if (!existingAddress || existingAddress.customerId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const remainingAddresses = await prisma.address.findMany({
      where: { customerId: session.id },
      orderBy: [{ createdAt: "desc" }],
    });

    const deleted = await prisma.$transaction(async (tx) => {
      const addressToDelete = await tx.address.delete({ where: { id } });

      if (addressToDelete.isDefault && remainingAddresses.length > 1) {
        const nextAddress = remainingAddresses.find((item) => item.id !== id);
        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return addressToDelete;
    });

    return NextResponse.json({ address: deleted });
  } catch (error) {
    console.error("Delete customer address error:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
