import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, description, basePrice, categoryId, isPizza, isAvailable } = body;

    if (!name || !slug || basePrice === undefined || !categoryId) {
      return NextResponse.json({ error: "Name, Slug, Base Price, and Category are required" }, { status: 400 });
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        slug,
        description,
        basePrice: parseFloat(basePrice),
        categoryId,
        isPizza: Boolean(isPizza),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
    });

    return NextResponse.json({ success: true, menuItem });
  } catch (error: any) {
    console.error("Create menu item error:", error);
    return NextResponse.json({ error: error.message || "Failed to create menu item" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, slug, description, basePrice, categoryId, isPizza, isAvailable } = body;

    if (!id || !name || !slug || basePrice === undefined || !categoryId) {
      return NextResponse.json({ error: "ID, Name, Slug, Base Price, and Category are required" }, { status: 400 });
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        basePrice: parseFloat(basePrice),
        categoryId,
        isPizza: Boolean(isPizza),
        isAvailable: Boolean(isAvailable),
      },
    });

    return NextResponse.json({ success: true, menuItem });
  } catch (error: any) {
    console.error("Update menu item error:", error);
    return NextResponse.json({ error: error.message || "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Menu Item ID is required" }, { status: 400 });
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete menu item error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete menu item" }, { status: 500 });
  }
}
