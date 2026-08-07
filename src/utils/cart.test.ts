import test from "node:test";
import assert from "node:assert/strict";
import { isSameCartItem } from "./cart";

const baseMenuItem = {
  id: "pizza-1",
  name: "Margherita",
  slug: "margherita",
  description: null,
  basePrice: 12,
  imageUrl: null,
  isPizza: true,
  isAvailable: true,
  categoryId: "cat-1",
  availableFor: ["DINE_IN", "PICKUP", "DELIVERY"] as const,
};

test("matches pizza items with the same size, crust, and toppings regardless of topping order", () => {
  const existingItem = {
    menuItem: baseMenuItem,
    notes: undefined,
    customization: {
      size: { id: "size-regular", name: "Regular", priceFactor: 1, priceAdd: 0, displayOrder: 1 },
      crust: { id: "crust-thin", name: "Thin", price: 0, displayOrder: 1 },
      sauce: { id: "sauce-tomato", name: "Tomato", price: 0, displayOrder: 1 },
      toppings: [
        { id: "topping-1", name: "Pepperoni", price: 1.5, isVegetarian: false, isVegan: false, isAvailable: true },
        { id: "topping-2", name: "Mushroom", price: 1, isVegetarian: true, isVegan: false, isAvailable: true },
      ],
      addons: [],
    },
  };

  const incomingCustomization = {
    size: { id: "size-regular", name: "Regular", priceFactor: 1, priceAdd: 0, displayOrder: 1 },
    crust: { id: "crust-thin", name: "Thin", price: 0, displayOrder: 1 },
    sauce: { id: "sauce-tomato", name: "Tomato", price: 0, displayOrder: 1 },
    toppings: [
      { id: "topping-2", name: "Mushroom", price: 1, isVegetarian: true, isVegan: false, isAvailable: true },
      { id: "topping-1", name: "Pepperoni", price: 1.5, isVegetarian: false, isVegan: false, isAvailable: true },
    ],
    addons: [],
  };

  assert.equal(isSameCartItem(existingItem as any, baseMenuItem as any, incomingCustomization as any, undefined), true);
});

test("does not match pizza items when the toppings differ", () => {
  const existingItem = {
    menuItem: baseMenuItem,
    notes: undefined,
    customization: {
      size: { id: "size-regular", name: "Regular", priceFactor: 1, priceAdd: 0, displayOrder: 1 },
      crust: { id: "crust-thin", name: "Thin", price: 0, displayOrder: 1 },
      sauce: { id: "sauce-tomato", name: "Tomato", price: 0, displayOrder: 1 },
      toppings: [{ id: "topping-1", name: "Pepperoni", price: 1.5, isVegetarian: false, isVegan: false, isAvailable: true }],
      addons: [],
    },
  };

  const incomingCustomization = {
    size: { id: "size-regular", name: "Regular", priceFactor: 1, priceAdd: 0, displayOrder: 1 },
    crust: { id: "crust-thin", name: "Thin", price: 0, displayOrder: 1 },
    sauce: { id: "sauce-tomato", name: "Tomato", price: 0, displayOrder: 1 },
    toppings: [{ id: "topping-2", name: "Mushroom", price: 1, isVegetarian: true, isVegan: false, isAvailable: true }],
    addons: [],
  };

  assert.equal(isSameCartItem(existingItem as any, baseMenuItem as any, incomingCustomization as any, undefined), false);
});
