import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import OrderTracker from "@/components/cart/OrderTracker";

export const revalidate = 0;

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          menuItem: true,
          customization: {
            include: {
              size: true,
              crust: true,
              sauce: true,
              toppings: {
                include: { topping: true },
              },
              addons: {
                include: { addon: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Serialize to plain JSON objects
  const serializedOrder = JSON.parse(JSON.stringify(order));

  return (
    <div style={{ minHeight: "100%", width: "100%" }}>
      <OrderTracker initialOrder={serializedOrder} />
    </div>
  );
}
