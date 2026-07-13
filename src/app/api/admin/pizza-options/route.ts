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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const body = await request.json();

    if (type === "size") {
      const item = await prisma.pizzaSize.create({
        data: {
          name: body.name,
          priceFactor: parseFloat(body.priceFactor) || 1.0,
          priceAdd: parseFloat(body.priceAdd) || 0.0,
          displayOrder: Number(body.displayOrder) || 0,
        },
      });
      return NextResponse.json({ success: true, item });
    }

    if (type === "crust") {
      const item = await prisma.pizzaCrust.create({
        data: {
          name: body.name,
          price: parseFloat(body.price) || 0.0,
          displayOrder: Number(body.displayOrder) || 0,
        },
      });
      return NextResponse.json({ success: true, item });
    }

    if (type === "sauce") {
      const item = await prisma.pizzaSauce.create({
        data: {
          name: body.name,
          price: parseFloat(body.price) || 0.0,
          displayOrder: Number(body.displayOrder) || 0,
        },
      });
      return NextResponse.json({ success: true, item });
    }

    if (type === "topping") {
      const item = await prisma.pizzaTopping.create({
        data: {
          name: body.name,
          price: parseFloat(body.price) || 0.0,
          isVegetarian: Boolean(body.isVegetarian),
          isVegan: Boolean(body.isVegan),
          isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : true,
        },
      });
      return NextResponse.json({ success: true, item });
    }

    if (type === "addon") {
      const item = await prisma.pizzaAddon.create({
        data: {
          name: body.name,
          price: parseFloat(body.price) || 0.0,
          isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : true,
        },
      });
      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Create option error:", error);
    return NextResponse.json({ error: error.message || "Failed to create option" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (type === "size") {
      const item = await prisma.pizzaSize.update({
        where: { id: body.id },
        data: {
          name: body.name,
          priceFactor: parseFloat(body.priceFactor),
          priceAdd: parseFloat(body.priceAdd),
          displayOrder: Number(body.displayOrder),
        },
      });
      return NextResponse.json({ success: true, item });
    }

    if (type === "crust") {
      const item = await prisma.pizzaCrust.update({
        where: { id: body.id },
        data: {
          name: body.name,
          price: parseFloat(body.price),
          displayOrder: Number(body.displayOrder),
        },
      });
      return NextResponse.json({ success: true, item });
    }

    if (type === "sauce") {
      const item = await prisma.pizzaSauce.update({
        where: { id: body.id },
        data: {
          name: body.name,
          price: parseFloat(body.price),
          displayOrder: Number(body.displayOrder),
        },
      });
      return NextResponse.json({ success: true, item });
    }

    if (type === "topping") {
      const item = await prisma.pizzaTopping.update({
        where: { id: body.id },
        data: {
          name: body.name,
          price: parseFloat(body.price),
          isVegetarian: Boolean(body.isVegetarian),
          isVegan: Boolean(body.isVegan),
          isAvailable: Boolean(body.isAvailable),
        },
      });
      return NextResponse.json({ success: true, item });
    }

    if (type === "addon") {
      const item = await prisma.pizzaAddon.update({
        where: { id: body.id },
        data: {
          name: body.name,
          price: parseFloat(body.price),
          isAvailable: Boolean(body.isAvailable),
        },
      });
      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Update option error:", error);
    return NextResponse.json({ error: error.message || "Failed to update option" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Option ID is required" }, { status: 400 });
    }

    if (type === "size") {
      await prisma.pizzaSize.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "crust") {
      await prisma.pizzaCrust.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "sauce") {
      await prisma.pizzaSauce.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "topping") {
      await prisma.pizzaTopping.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "addon") {
      await prisma.pizzaAddon.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Delete option error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete option" }, { status: 500 });
  }
}
