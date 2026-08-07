"use client";

import React, { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { CartItem, CartCustomization, MenuItem } from "@/types";
import { addOrMergeCartItem } from "@/utils/cart";

interface CartContextType {
  cart: CartItem[];
  addToCart: (menuItem: MenuItem, quantity: number, customization?: CartCustomization, notes?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (id: string, updates: Partial<{
    customization: any;
    notes: string | undefined;
    quantity: number;
  }>) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.10; // 10% tax rate

const STORAGE_KEY = "pizza_app_cart";
const EMPTY_CART_JSON = "[]";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cart_updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cart_updated", callback);
  };
}

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? EMPTY_CART_JSON;
}

function getServerSnapshot(): string {
  return EMPTY_CART_JSON;
}

function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));
  } catch (e) {
    console.error("Error saving cart:", e);
  }
}

/** Look up the price for a specific sizeId in a sizePrices array, falling back to a flat fallback price. */
function getSizePrice(
  sizePrices: { sizeId: string; price: number }[] | undefined,
  sizeId: string,
  fallback: number
): number {
  if (!sizePrices || sizePrices.length === 0) return fallback;
  const row = sizePrices.find((sp) => sp.sizeId === sizeId);
  return row !== undefined ? row.price : fallback;
}

export function calculateItemPrice(menuItem: MenuItem, customization?: CartCustomization): number {
  if (!customization) {
    return menuItem.basePrice;
  }

  const { size, crust, sauce, toppings, addons } = customization;

  // Base price: look up MenuItemSizePrice for the selected size
  const sizeBase = getSizePrice(menuItem.sizePrices, size.id, menuItem.basePrice);

  if (!menuItem.isPizza) {
    return sizeBase;
  }

  // Crust: all crusts are $0 per menu doc, but respect DB value for future flexibility
  const crustPrice = crust?.price ?? 0;

  // Sauce: look up SauceSizePrice for the selected size
  const saucePrice = sauce ? getSizePrice(sauce.sizePrices, size.id, sauce.price) : 0;

  // Toppings: look up ToppingSizePrice for each topping at the selected size
  const toppingsPrice = (toppings || []).reduce(
    (sum, t) => sum + getSizePrice(t.sizePrices, size.id, t.price),
    0
  );

  // Addons: flat price (no per-size table for addons)
  const addonsPrice = (addons || []).reduce((sum, a) => sum + a.price, 0);

  return parseFloat((sizeBase + crustPrice + saucePrice + toppingsPrice + addonsPrice).toFixed(2));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartString = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const cart = useMemo<CartItem[]>(() => {
    try {
      return JSON.parse(cartString);
    } catch (e) {
      console.error("Error loading cart:", e);
      return [];
    }
  }, [cartString]);

  const addToCart = (
    menuItem: MenuItem,
    quantity: number,
    customization?: CartCustomization,
    notes?: string
  ) => {
    const price = calculateItemPrice(menuItem, customization);
    const nextCart = addOrMergeCartItem(cart, menuItem, quantity, customization, notes, price);
    saveCart(nextCart);
  };

  const removeFromCart = (id: string) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    saveCart(
      cart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const updateItem = (id: string, updates: Partial<{ customization: any; notes: string | undefined; quantity: number; }>) => {
    saveCart(
      cart.map((item) => {
        if (item.id !== id) return item;
        const newCustomization = updates.customization ?? item.customization;
        const newQuantity = updates.quantity ?? item.quantity;
        const newNotes = updates.notes ?? item.notes;
        const newPrice = calculateItemPrice(item.menuItem, newCustomization);
        return { ...item, customization: newCustomization, notes: newNotes, quantity: newQuantity, price: newPrice };
      })
    );
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Calculations
  const subtotal = parseFloat(
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
          updateItem,
        clearCart,
        subtotal,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
