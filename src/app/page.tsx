import { prisma } from "@/lib/db";
import MenuContainer from "@/components/MenuContainer";

export const revalidate = 0; // Keep dynamic to show admin changes instantly

export default async function Home() {
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
