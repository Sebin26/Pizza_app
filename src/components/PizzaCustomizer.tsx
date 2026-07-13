"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart, calculateItemPrice } from "@/context/CartContext";
import { MenuItem, PizzaConfig, PizzaSize, PizzaCrust, PizzaSauce, PizzaTopping, PizzaAddon } from "@/types";
import { ChevronLeft, ShoppingBag, Plus, Minus, Check } from "lucide-react";
import styles from "./PizzaCustomizer.module.css";

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
    // Redirect back to menu
    router.push("/");
  };

  // Group toppings by category
  const vegetarianToppings = config.toppings.filter((t) => t.isVegetarian && !t.name.toLowerCase().includes("cheese"));
  const meatToppings = config.toppings.filter((t) => !t.isVegetarian);
  const cheeseToppings = config.toppings.filter((t) => t.name.toLowerCase().includes("cheese") || t.name.toLowerCase().includes("mozzarella") || t.name.toLowerCase().includes("feta"));

  return (
    <div className={styles.wrapper}>
      {/* Header Back Button */}
      <div className={styles.header}>
        <button onClick={() => router.push("/")} className={styles.backBtn}>
          <ChevronLeft size={20} />
          <span>Back to Menu</span>
        </button>
      </div>

      <div className={styles.content}>
        {/* Customization Left Column */}
        <div className={styles.customizerCol}>
          <h1 className={styles.title}>Customize {menuItem.name}</h1>
          <p className={styles.subtitle}>{menuItem.description}</p>

          {/* 1. Size Selection */}
          <section className={`${styles.section} glass`}>
            <h3 className={styles.sectionTitle}>1. Choose Size</h3>
            <div className={styles.sizeGrid}>
              {config.sizes.map((sz) => (
                <button
                  key={sz.id}
                  onClick={() => setSelectedSize(sz)}
                  className={`${styles.sizeCard} ${
                    selectedSize.id === sz.id ? styles.activeCard : ""
                  }`}
                >
                  <span className={styles.sizeIcon}>🍕</span>
                  <span className={styles.sizeName}>{sz.name}</span>
                  <span className={styles.sizePrice}>
                    {sz.priceAdd > 0 ? `+$${sz.priceAdd.toFixed(2)}` : "Base Price"}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 2. Crust Selection */}
          <section className={`${styles.section} glass`}>
            <h3 className={styles.sectionTitle}>2. Choose Crust</h3>
            <div className={styles.crustList}>
              {config.crusts.map((cr) => (
                <div
                  key={cr.id}
                  onClick={() => setSelectedCrust(cr)}
                  className={`${styles.selectRow} ${
                    selectedCrust.id === cr.id ? styles.activeRow : ""
                  }`}
                >
                  <div className={styles.selectInfo}>
                    <span className={styles.rowName}>{cr.name}</span>
                  </div>
                  <span className={styles.rowPrice}>
                    {cr.price > 0 ? `+$${cr.price.toFixed(2)}` : "+$0.00"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Sauce Selection */}
          <section className={`${styles.section} glass`}>
            <h3 className={styles.sectionTitle}>3. Choose Sauce</h3>
            <div className={styles.sauceList}>
              {config.sauces.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setSelectedSauce(sc)}
                  className={`${styles.selectRow} ${
                    selectedSauce.id === sc.id ? styles.activeRow : ""
                  }`}
                >
                  <div className={styles.selectInfo}>
                    <span className={styles.rowName}>{sc.name}</span>
                  </div>
                  <span className={styles.rowPrice}>
                    {sc.price > 0 ? `+$${sc.price.toFixed(2)}` : "+$0.00"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Toppings Selection */}
          <section className={`${styles.section} glass`}>
            <h3 className={styles.sectionTitle}>4. Add Toppings</h3>
            
            {/* Cheese Group */}
            <div className={styles.toppingGroup}>
              <h4 className={styles.groupHeader}>Cheeses</h4>
              <div className={styles.toppingGrid}>
                {cheeseToppings.map((tp) => {
                  const isSelected = selectedToppings.some((t) => t.id === tp.id);
                  return (
                    <button
                      key={tp.id}
                      onClick={() => handleToppingToggle(tp)}
                      className={`${styles.toppingCard} ${isSelected ? styles.activeTopping : ""}`}
                    >
                      <div className={styles.checkbox}>
                        {isSelected && <Check size={14} className={styles.checkIcon} />}
                      </div>
                      <span className={styles.toppingName}>{tp.name}</span>
                      <span className={styles.toppingPrice}>+${tp.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meat Group */}
            <div className={styles.toppingGroup}>
              <h4 className={styles.groupHeader}>Meats</h4>
              <div className={styles.toppingGrid}>
                {meatToppings.map((tp) => {
                  const isSelected = selectedToppings.some((t) => t.id === tp.id);
                  return (
                    <button
                      key={tp.id}
                      onClick={() => handleToppingToggle(tp)}
                      className={`${styles.toppingCard} ${isSelected ? styles.activeTopping : ""}`}
                    >
                      <div className={styles.checkbox}>
                        {isSelected && <Check size={14} className={styles.checkIcon} />}
                      </div>
                      <span className={styles.toppingName}>{tp.name}</span>
                      <span className={styles.toppingPrice}>+${tp.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Veggie Group */}
            <div className={styles.toppingGroup}>
              <h4 className={styles.groupHeader}>Veggies</h4>
              <div className={styles.toppingGrid}>
                {vegetarianToppings.map((tp) => {
                  const isSelected = selectedToppings.some((t) => t.id === tp.id);
                  return (
                    <button
                      key={tp.id}
                      onClick={() => handleToppingToggle(tp)}
                      className={`${styles.toppingCard} ${isSelected ? styles.activeTopping : ""}`}
                    >
                      <div className={styles.checkbox}>
                        {isSelected && <Check size={14} className={styles.checkIcon} />}
                      </div>
                      <span className={styles.toppingName}>{tp.name}</span>
                      <span className={styles.toppingPrice}>+${tp.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 5. Add-ons Selection */}
          <section className={`${styles.section} glass`}>
            <h3 className={styles.sectionTitle}>5. Add-ons & Dippers</h3>
            <div className={styles.toppingGrid}>
              {config.addons.map((ad) => {
                const isSelected = selectedAddons.some((a) => a.id === ad.id);
                return (
                  <button
                    key={ad.id}
                    onClick={() => handleAddonToggle(ad)}
                    className={`${styles.toppingCard} ${isSelected ? styles.activeTopping : ""}`}
                  >
                    <div className={styles.checkbox}>
                      {isSelected && <Check size={14} className={styles.checkIcon} />}
                    </div>
                    <span className={styles.toppingName}>{ad.name}</span>
                    <span className={styles.toppingPrice}>
                      {ad.price > 0 ? `+$${ad.price.toFixed(2)}` : "FREE"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 6. Special Instructions */}
          <section className={`${styles.section} glass`}>
            <h3 className={styles.sectionTitle}>6. Special Instructions</h3>
            <textarea
              placeholder="E.g., bake it extra crispy, cut in squares..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.notesInput}
              maxLength={200}
            />
          </section>
        </div>

        {/* Floating Pricing Sidebar Column */}
        <div className={styles.summaryCol}>
          <div className={`${styles.summaryCard} glass-elevated`}>
            <div className={styles.summaryPizzaPreview}>
              <span className={styles.largePizzaEmoji}>🍕</span>
              <h3>Your Custom Pizza</h3>
              <p>Fresh & hot, baked to order</p>
            </div>

            <div className={styles.summaryList}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Size:</span>
                <span className={styles.summaryVal}>{selectedSize.name}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Crust:</span>
                <span className={styles.summaryVal}>{selectedCrust.name}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Sauce:</span>
                <span className={styles.summaryVal}>{selectedSauce.name}</span>
              </div>
              {selectedToppings.length > 0 && (
                <div className={styles.summaryToppingsList}>
                  <span className={styles.summaryLabel}>Toppings:</span>
                  <div className={styles.summaryPills}>
                    {selectedToppings.map((t) => (
                      <span key={t.id} className={styles.summaryPill}>{t.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedAddons.length > 0 && (
                <div className={styles.summaryToppingsList}>
                  <span className={styles.summaryLabel}>Add-ons:</span>
                  <div className={styles.summaryPills}>
                    {selectedAddons.map((a) => (
                      <span key={a.id} className={`${styles.summaryPill} ${styles.addonPill}`}>{a.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className={styles.quantitySection}>
              <span>Quantity:</span>
              <div className={styles.quantityControls}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={styles.qtyBtn}
                >
                  <Minus size={16} />
                </button>
                <span className={styles.qtyVal}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className={styles.qtyBtn}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className={styles.totalRow}>
              <span>Total Price:</span>
              <span className={styles.priceVal}>${totalPrice.toFixed(2)}</span>
            </div>

            <button onClick={handleAdd} className="btn btn-primary" style={{ width: "100%" }}>
              <ShoppingBag size={18} />
              <span>Add Pizza to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
