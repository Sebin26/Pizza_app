"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, CartCustomization, MenuItem } from "@/types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (menuItem: MenuItem, quantity: number, customization?: CartCustomization, notes?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.10; // 10% tax rate

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
  if (!menuItem.isPizza || !customization) {
    return menuItem.basePrice;
  }

  const { size, crust, sauce, toppings, addons } = customization;

  // Base price: look up MenuItemSizePrice for the selected size
  const sizeBase = getSizePrice(menuItem.sizePrices, size.id, menuItem.basePrice);

  // Crust: all crusts are $0 per menu doc, but respect DB value for future flexibility
  const crustPrice = crust.price;

  // Sauce: look up SauceSizePrice for the selected size
  const saucePrice = getSizePrice(sauce.sizePrices, size.id, sauce.price);

  // Toppings: look up ToppingSizePrice for each topping at the selected size
  const toppingsPrice = toppings.reduce(
    (sum, t) => sum + getSizePrice(t.sizePrices, size.id, t.price),
    0
  );

  // Addons: flat price (no per-size table for addons)
  const addonsPrice = addons.reduce((sum, a) => sum + a.price, 0);

  return parseFloat((sizeBase + crustPrice + saucePrice + toppingsPrice + addonsPrice).toFixed(2));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("pizza_app_cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("pizza_app_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (
    menuItem: MenuItem,
    quantity: number,
    customization?: CartCustomization,
    notes?: string
  ) => {
    const price = calculateItemPrice(menuItem, customization);
    
    setCart((prev) => {
      // Check if item with same customization and notes already exists
      const existingIndex = prev.findIndex((item) => {
        if (item.menuItem.id !== menuItem.id) return false;
        if (item.notes !== notes) return false;
        
        if (menuItem.isPizza) {
          if (!item.customization || !customization) return false;
          
          // Compare size, crust, sauce
          if (item.customization.size.id !== customization.size.id) return false;
          if (item.customization.crust.id !== customization.crust.id) return false;
          if (item.customization.sauce.id !== customization.sauce.id) return false;
          
          // Compare toppings (sort by id first)
          const t1 = item.customization.toppings.map(t => t.id).sort();
          const t2 = customization.toppings.map(t => t.id).sort();
          if (t1.length !== t2.length || !t1.every((val, index) => val === t2[index])) return false;

          // Compare addons
          const a1 = item.customization.addons.map(a => a.id).sort();
          const a2 = customization.addons.map(a => a.id).sort();
          if (a1.length !== a2.length || !a1.every((val, index) => val === a2[index])) return false;
        }
        
        return true;
      });

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      // Generate a unique ID for this cart line
      const uniqueId = `${menuItem.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return [
        ...prev,
        {
          id: uniqueId,
          menuItem,
          quantity,
          customization,
          notes,
          price,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
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
