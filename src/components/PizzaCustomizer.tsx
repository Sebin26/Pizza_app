"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, calculateItemPrice } from "@/context/CartContext";
import { MenuItem, PizzaConfig, PizzaSize, PizzaCrust, PizzaSauce, PizzaTopping, PizzaAddon } from "@/types";
import { ChevronLeft, ShoppingBag, Plus, Minus, Check, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface PizzaCustomizerProps {
  menuItem: MenuItem;
  config: PizzaConfig;
}

export default function PizzaCustomizer({ menuItem, config }: PizzaCustomizerProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  // Initialize selections
  const [selectedSize, setSelectedSize] = useState<PizzaSize>(config.sizes[0]);
  const [selectedCrust, setSelectedCrust] = useState<PizzaCrust>(config.crusts[0]);
  const [selectedSauce, setSelectedSauce] = useState<PizzaSauce>(config.sauces[0]);
  const [selectedToppings, setSelectedToppings] = useState<PizzaTopping[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<PizzaAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  // Pre-populate defaults based on Pizza type (intelligent UX)
  useEffect(() => {
    // Set default sauce
    if (menuItem.name.toLowerCase().includes("bbq")) {
      const bbq = config.sauces.find((s) => s.name.toLowerCase().includes("bbq"));
      if (bbq) setSelectedSauce(bbq);
    } else if (menuItem.name.toLowerCase().includes("buffalo")) {
      const buffalo = config.sauces.find((s) => s.name.toLowerCase().includes("buffalo"));
      if (buffalo) setSelectedSauce(buffalo);
    }

    // Set default toppings
    const defaultToppingNames: string[] = [];
    const name = menuItem.name.toLowerCase();

    if (name.includes("margherita")) {
      defaultToppingNames.push("fresh basil", "extra mozzarella");
    } else if (name.includes("pepperoni")) {
      defaultToppingNames.push("pepperoni", "extra mozzarella");
    } else if (name.includes("veggie") || name.includes("garden")) {
      defaultToppingNames.push("mushrooms", "green peppers", "red onions", "black olives");
    } else if (name.includes("bbq chicken")) {
      defaultToppingNames.push("grilled chicken", "red onions", "extra mozzarella");
    } else if (name.includes("hawaiian")) {
      defaultToppingNames.push("smoked ham", "sweet pineapple");
    }

    const matchedToppings = config.toppings.filter((t) =>
      defaultToppingNames.some((dtName) => t.name.toLowerCase().includes(dtName))
    );
    setSelectedToppings(matchedToppings);
  }, [menuItem, config]);

  // Compute price dynamically
  const customization = useMemo(() => {
    return {
      size: selectedSize,
      crust: selectedCrust,
      sauce: selectedSauce,
      toppings: selectedToppings,
      addons: selectedAddons,
    };
  }, [selectedSize, selectedCrust, selectedSauce, selectedToppings, selectedAddons]);

  const unitPrice = useMemo(() => {
    return calculateItemPrice(menuItem, customization);
  }, [menuItem, customization]);

  const totalPrice = useMemo(() => {
    return parseFloat((unitPrice * quantity).toFixed(2));
  }, [unitPrice, quantity]);

  const handleToppingToggle = (topping: PizzaTopping) => {
    setSelectedToppings((prev) => {
      const exists = prev.find((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleAddonToggle = (addon: PizzaAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAdd = () => {
    addToCart(menuItem, quantity, customization, notes);
    router.push("/");
  };

  // Group toppings by category
  const vegetarianToppings = config.toppings.filter((t) => t.isVegetarian && !t.name.toLowerCase().includes("cheese"));
  const meatToppings = config.toppings.filter((t) => !t.isVegetarian);
  const cheeseToppings = config.toppings.filter((t) => t.name.toLowerCase().includes("cheese") || t.name.toLowerCase().includes("mozzarella") || t.name.toLowerCase().includes("feta"));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Header Back Button */}
      <div className="flex items-center">
        <button 
          onClick={() => router.push("/")} 
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-brand-dark/70 hover:text-brand-red bg-white border border-brand-dark/5 hover:border-brand-dark/10 text-sm font-semibold transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Customization Details: Left 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-dark flex items-center gap-2">
              <Flame className="w-7 h-7 text-brand-red fill-current" />
              Customize {menuItem.name}
            </h1>
            <p className="text-sm sm:text-[15px] text-brand-dark/60 leading-relaxed max-w-2xl">
              {menuItem.description}
            </p>
          </div>

          {/* 1. Size Selection */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-brand-dark border-b border-brand-dark/5 pb-3">
              1. Choose Size
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {config.sizes.map((sz) => {
                const isActive = selectedSize.id === sz.id;
                return (
                  <button
                    key={sz.id}
                    onClick={() => setSelectedSize(sz)}
                    className={`flex flex-col items-center text-center p-5 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                      isActive
                        ? "border-brand-red bg-brand-red/[0.02]"
                        : "border-brand-dark/10 hover:border-brand-dark/20 bg-white"
                    }`}
                  >
                    <span className="text-3xl mb-2">🍕</span>
                    <span className="text-[15px] font-bold text-brand-dark">{sz.name}</span>
                    <span className="text-xs text-brand-dark/50 mt-1 font-semibold">
                      {sz.priceAdd > 0 ? `+$${sz.priceAdd.toFixed(2)}` : "Base Price"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Crust Selection */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-brand-dark border-b border-brand-dark/5 pb-3">
              2. Choose Crust
            </h3>
            <div className="flex flex-col gap-2">
              {config.crusts.map((cr) => {
                const isActive = selectedCrust.id === cr.id;
                return (
                  <div
                    key={cr.id}
                    onClick={() => setSelectedCrust(cr)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "border-brand-red bg-brand-red/[0.02]"
                        : "border-brand-dark/10 hover:border-brand-dark/20 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? "border-brand-red" : "border-brand-dark/30"}`}>
                        {isActive && <div className="w-2.5 h-2.5 rounded-full bg-brand-red"></div>}
                      </div>
                      <span className="text-[15px] font-bold text-brand-dark">{cr.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-brand-dark/60">
                      {cr.price > 0 ? `+$${cr.price.toFixed(2)}` : "+$0.00"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Sauce Selection */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-brand-dark border-b border-brand-dark/5 pb-3">
              3. Choose Sauce
            </h3>
            <div className="flex flex-col gap-2">
              {config.sauces.map((sc) => {
                const isActive = selectedSauce.id === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedSauce(sc)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "border-brand-red bg-brand-red/[0.02]"
                        : "border-brand-dark/10 hover:border-brand-dark/20 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? "border-brand-red" : "border-brand-dark/30"}`}>
                        {isActive && <div className="w-2.5 h-2.5 rounded-full bg-brand-red"></div>}
                      </div>
                      <span className="text-[15px] font-bold text-brand-dark">{sc.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-brand-dark/60">
                      {sc.price > 0 ? `+$${sc.price.toFixed(2)}` : "+$0.00"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Toppings Selection */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-6">
            <h3 className="text-lg font-bold text-brand-dark border-b border-brand-dark/5 pb-3">
              4. Add Toppings
            </h3>
            
            {/* Cheese Group */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-dark/50">Cheeses</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cheeseToppings.map((tp) => {
                  const isSelected = selectedToppings.some((t) => t.id === tp.id);
                  return (
                    <button
                      key={tp.id}
                      onClick={() => handleToppingToggle(tp)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-brand-red bg-brand-red/[0.02]"
                          : "border-brand-dark/10 hover:border-brand-dark/20 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-brand-red border-brand-red text-white" : "border-brand-dark/30 bg-white"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[15px] font-bold text-brand-dark">{tp.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-brand-dark/50">+${tp.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meat Group */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-dark/50">Meats</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {meatToppings.map((tp) => {
                  const isSelected = selectedToppings.some((t) => t.id === tp.id);
                  return (
                    <button
                      key={tp.id}
                      onClick={() => handleToppingToggle(tp)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-brand-red bg-brand-red/[0.02]"
                          : "border-brand-dark/10 hover:border-brand-dark/20 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-brand-red border-brand-red text-white" : "border-brand-dark/30 bg-white"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[15px] font-bold text-brand-dark">{tp.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-brand-dark/50">+${tp.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Veggie Group */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-dark/50">Veggies</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vegetarianToppings.map((tp) => {
                  const isSelected = selectedToppings.some((t) => t.id === tp.id);
                  return (
                    <button
                      key={tp.id}
                      onClick={() => handleToppingToggle(tp)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-brand-red bg-brand-red/[0.02]"
                          : "border-brand-dark/10 hover:border-brand-dark/20 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-brand-red border-brand-red text-white" : "border-brand-dark/30 bg-white"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[15px] font-bold text-brand-dark">{tp.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-brand-dark/50">+${tp.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 5. Add-ons Selection */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-brand-dark border-b border-brand-dark/5 pb-3">
              5. Add-ons & Dippers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.addons.map((ad) => {
                const isSelected = selectedAddons.some((a) => a.id === ad.id);
                return (
                  <button
                    key={ad.id}
                    onClick={() => handleAddonToggle(ad)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-brand-red bg-brand-red/[0.02]"
                        : "border-brand-dark/10 hover:border-brand-dark/20 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected ? "bg-brand-red border-brand-red text-white" : "border-brand-dark/30 bg-white"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[15px] font-bold text-brand-dark">{ad.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-brand-dark/50">
                      {ad.price > 0 ? `+$${ad.price.toFixed(2)}` : "FREE"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 6. Special Instructions */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-3">
            <h3 className="text-lg font-bold text-brand-dark border-b border-brand-dark/5 pb-3">
              6. Special Instructions
            </h3>
            <textarea
              placeholder="E.g., bake it extra crispy, cut in squares..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
              rows={4}
              className="w-full p-4 rounded-xl bg-brand-light text-brand-dark text-sm placeholder-brand-dark/40 border-0 focus:ring-2 focus:ring-brand-red/20 focus:bg-white resize-none transition-all duration-200"
            />
          </section>
        </div>

        {/* Floating Pricing Sidebar: Right 4 Columns */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-brand-dark/5 flex flex-col gap-6">
            
            {/* Header / Graphic */}
            <div className="flex flex-col items-center text-center border-b border-brand-dark/5 pb-5">
              <span className="text-5xl mb-3 animate-bounce">🍕</span>
              <h3 className="text-lg font-extrabold text-brand-dark">Your Custom Pizza</h3>
              <p className="text-xs text-brand-dark/50 mt-1">Fresh & hot, baked to order</p>
            </div>

            {/* Config Specs list */}
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex justify-between items-start gap-4">
                <span className="font-bold text-brand-dark/50">Size:</span>
                <span className="font-extrabold text-brand-dark text-right">{selectedSize.name}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="font-bold text-brand-dark/50">Crust:</span>
                <span className="font-extrabold text-brand-dark text-right">{selectedCrust.name}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="font-bold text-brand-dark/50">Sauce:</span>
                <span className="font-extrabold text-brand-dark text-right">{selectedSauce.name}</span>
              </div>

              {selectedToppings.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-brand-dark/50">Toppings:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedToppings.map((t) => (
                      <span key={t.id} className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-light text-brand-dark/80">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAddons.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-brand-dark/50">Add-ons:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAddons.map((a) => (
                      <span key={a.id} className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-orange/10 text-brand-orange">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity control */}
            <div className="flex items-center justify-between border-t border-b border-brand-dark/5 py-4">
              <span className="text-sm font-bold text-brand-dark">Quantity</span>
              <div className="flex items-center gap-4 bg-brand-light rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-red shadow-xs transition-colors active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-extrabold w-6 text-center text-brand-dark">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-red shadow-xs transition-colors active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-extrabold text-brand-dark">Total Price</span>
              <span className="text-2xl font-extrabold text-brand-red">${totalPrice.toFixed(2)}</span>
            </div>

            {/* Submit Button */}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleAdd} 
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white font-extrabold text-[15px] shadow-md shadow-brand-red/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Add Pizza to Cart</span>
            </motion.button>
          </div>
        </div>
      </div>

    </div>
  );
}
