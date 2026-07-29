import { prisma } from "@/lib/db";
import MenuContainer from "@/components/menu/MenuContainer";
import LandingPage from "@/components/home/LandingPage";

export const revalidate = 0; // Keep dynamic to show admin changes instantly

interface HomeProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const showOrder = params.order === "true";

  if (showOrder) {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { name: "asc" },
        },
      },
    });

    // Serialize to plain JSON objects for Client Component transfer
    const serializedCategories = JSON.parse(JSON.stringify(categories));

    return (
      <div style={{ minHeight: "100%", width: "100%" }}>
        <MenuContainer initialCategories={serializedCategories} />
      </div>
    );
  }

  // Fetch featured pizzas for the landing page
  const featuredPizzas = await prisma.menuItem.findMany({
    where: {
      isPizza: true,
      isAvailable: true,
    },
    take: 3,
    orderBy: {
      name: "asc",
    },
  });

  const serializedPizzas = JSON.parse(JSON.stringify(featuredPizzas));

  return (
    <LandingPage featuredPizzas={serializedPizzas} />
  );
}
