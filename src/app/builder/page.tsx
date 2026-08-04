import { prisma } from "@/lib/db";
import PizzaCustomizer from "@/components/pizza/PizzaCustomizer";
import { redirect } from "next/navigation";

export const revalidate = 0;

interface BuilderPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  const { id } = await searchParams;

  let menuItem = null;
  if (id) {
    menuItem = await prisma.menuItem.findFirst({
      where: { id, isPizza: true, isAvailable: true },
      include: {
        sizePrices: { select: { sizeId: true, price: true } },
      },
    });
  }

  // Fallback to first available pizza if none specified or not found
  if (!menuItem) {
    menuItem = await prisma.menuItem.findFirst({
      where: { isPizza: true, isAvailable: true },
      include: {
        sizePrices: { select: { sizeId: true, price: true } },
      },
    });
  }

  if (!menuItem) {
    // If no pizza items exist at all in database, redirect home
    redirect("/");
  }

  const [sizes, crusts, sauces, toppings, addons] = await Promise.all([
    prisma.pizzaSize.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.pizzaCrust.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.pizzaSauce.findMany({
      orderBy: { displayOrder: "asc" },
      include: { sizePrices: { select: { sizeId: true, price: true } } },
    }),
    prisma.pizzaTopping.findMany({
      where: { isAvailable: true },
      include: { sizePrices: { select: { sizeId: true, price: true } } },
    }),
    prisma.pizzaAddon.findMany({ where: { isAvailable: true } }),
  ]);

  const config = {
    sizes: JSON.parse(JSON.stringify(sizes)),
    crusts: JSON.parse(JSON.stringify(crusts)),
    sauces: JSON.parse(JSON.stringify(sauces)),
    toppings: JSON.parse(JSON.stringify(toppings)),
    addons: JSON.parse(JSON.stringify(addons)),
  };

  const serializedMenuItem = JSON.parse(JSON.stringify(menuItem));

  return (
    <div style={{ minHeight: "100%", width: "100%" }}>
      <PizzaCustomizer menuItem={serializedMenuItem} config={config} />
    </div>
  );
}
