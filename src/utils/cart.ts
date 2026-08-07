import { CartCustomization, CartItem, MenuItem, PizzaConfig } from "@/types";

function createFallbackPizzaSize(menuItem: MenuItem) {
  if (menuItem.sizePrices?.length) {
    const firstSize = menuItem.sizePrices[0];
    if (firstSize.size) {
      return firstSize.size;
    }
    return {
      id: firstSize.sizeId,
      name: "Regular",
      priceFactor: 1,
      priceAdd: 0,
      displayOrder: 0,
    };
  }

  return {
    id: "default-size",
    name: "Regular",
    priceFactor: 1,
    priceAdd: 0,
    displayOrder: 0,
  };
}

function createFallbackPizzaCrust() {
  return {
    id: "default-crust",
    name: "Classic",
    price: 0,
    displayOrder: 0,
  };
}

function createFallbackPizzaSauce() {
  return {
    id: "default-sauce",
    name: "Tomato",
    price: 0,
    displayOrder: 0,
  };
}

export function buildDefaultPizzaCustomization(menuItem: MenuItem, config?: PizzaConfig): CartCustomization | undefined {
  if (!menuItem.isPizza) return undefined;

  const size = config?.sizes?.[0] ?? createFallbackPizzaSize(menuItem);
  const crust = config?.crusts?.[0] ?? createFallbackPizzaCrust();
  const sauce = config?.sauces?.[0] ?? createFallbackPizzaSauce();

  return {
    size,
    crust,
    sauce,
    toppings: [],
    addons: [],
  };
}

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

export function addOrMergeCartItem(
  cart: CartItem[],
  menuItem: MenuItem,
  quantity: number,
  customization: CartCustomization | undefined,
  notes: string | undefined,
  price: number
): CartItem[] {
  const existingIndex = cart.findIndex((item) =>
    isSameCartItem(item, menuItem, customization, notes)
  );

  if (existingIndex > -1) {
    return cart.map((item, index) =>
      index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
    );
  }

  const uniqueId = `${menuItem.id}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return [
    ...cart,
    {
      id: uniqueId,
      menuItem,
      quantity,
      customization,
      notes,
      price,
    },
  ];
}
