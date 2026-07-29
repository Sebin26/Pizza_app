import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminDashboardContainer from "@/components/admin/AdminDashboardContainer";
import AccessDenied from "@/components/shared/AccessDenied";

export const revalidate = 0;

export default async function AdminPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "ADMIN") {
    return <AccessDenied username={user.username} />;
  }

  // Fetch all collections
  const [categories, menuItems, sizes, crusts, sauces, toppings, addons, users, orders] = await Promise.all([
    prisma.category.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.menuItem.findMany({ orderBy: { name: "asc" } }),
    prisma.pizzaSize.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.pizzaCrust.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.pizzaSauce.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.pizzaTopping.findMany({ orderBy: { name: "asc" } }),
    prisma.pizzaAddon.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const initialData = {
    categories: JSON.parse(JSON.stringify(categories)),
    menuItems: JSON.parse(JSON.stringify(menuItems)),
    sizes: JSON.parse(JSON.stringify(sizes)),
    crusts: JSON.parse(JSON.stringify(crusts)),
    sauces: JSON.parse(JSON.stringify(sauces)),
    toppings: JSON.parse(JSON.stringify(toppings)),
    addons: JSON.parse(JSON.stringify(addons)),
    users: JSON.parse(JSON.stringify(users)),
    orders: JSON.parse(JSON.stringify(orders)),
  };

  return (
    <div style={{ minHeight: "100%", width: "100%" }}>
      <AdminDashboardContainer user={user} initialData={initialData} />
    </div>
  );
}
