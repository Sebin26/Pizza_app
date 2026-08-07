import { CartCustomization, CartItem, MenuItem } from "@/types";

export function getCartItemSignature(
  menuItem: MenuItem,
  customization?: CartCustomization,
  notes?: string
): string {
  const base = `${menuItem.id}|${notes ?? ""}`;

  if (!menuItem.isPizza || !customization) {
    return `${base}|size:${customization?.size?.id ?? ""}`;
  }

  const toppings = [...(customization.toppings ?? [])]
    .map((t) => t.id)
    .sort()
    .join(",");
  const addons = [...(customization.addons ?? [])]
    .map((a) => a.id)
    .sort()
    .join(",");

  return [
    base,
    `size:${customization.size?.id ?? ""}`,
    `crust:${customization.crust?.id ?? ""}`,
    `sauce:${customization.sauce?.id ?? ""}`,
    `toppings:${toppings}`,
    `addons:${addons}`,
  ].join("|");
}

export function isSameCartItem(
  existingItem: Pick<CartItem, "menuItem" | "customization" | "notes">,
  menuItem: MenuItem,
  customization?: CartCustomization,
  notes?: string
): boolean {
  if (existingItem.menuItem.id !== menuItem.id) {
    return false;
  }

  if (existingItem.notes !== notes) {
    return false;
  }

  if (customization?.size || existingItem.customization?.size) {
    if (existingItem.customization?.size?.id !== customization?.size?.id) {
      return false;
    }
  }

  if (!menuItem.isPizza) {
    return true;
  }

  if (!existingItem.customization || !customization) {
    return false;
  }

  if (existingItem.customization.crust?.id !== customization.crust?.id) {
    return false;
  }

  if (existingItem.customization.sauce?.id !== customization.sauce?.id) {
    return false;
  }

  const existingToppings = [...(existingItem.customization.toppings ?? [])]
    .map((t) => t.id)
    .sort();
  const incomingToppings = [...(customization.toppings ?? [])]
    .map((t) => t.id)
    .sort();

  if (existingToppings.length !== incomingToppings.length || !existingToppings.every((id, index) => id === incomingToppings[index])) {
    return false;
  }

  const existingAddons = [...(existingItem.customization.addons ?? [])]
    .map((a) => a.id)
    .sort();
  const incomingAddons = [...(customization.addons ?? [])]
    .map((a) => a.id)
    .sort();

  if (existingAddons.length !== incomingAddons.length || !existingAddons.every((id, index) => id === incomingAddons[index])) {
    return false;
  }

  return true;
}
