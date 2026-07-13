"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Category, MenuItem } from "@/types";
import { Search, ShoppingBag, Plus, Minus, Info } from "lucide-react";
import styles from "./MenuContainer.module.css";

interface MenuContainerProps {
  initialCategories: Category[];
}

export default function MenuContainer({ initialCategories }: MenuContainerProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategories[0]?.slug || "pizzas"
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  // Non-pizza item quantity modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleOpenQuantity = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setNotes("");
  };

  const handleCloseQuantity = () => {
    setSelectedItem(null);
  };

  const handleAddToCart = () => {
    if (selectedItem) {
      addToCart(selectedItem, quantity, undefined, notes);
      handleCloseQuantity();
    }
  };

  const categoriesFiltered = initialCategories.map((cat) => {
    const items = cat.items || [];
    const filteredItems = items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
    return { ...cat, items: filteredItems };
  });

  const activeCategoryData = categoriesFiltered.find((c) => c.slug === activeCategory);
  const activeItems = activeCategoryData?.items || [];

  return (
    <div className={styles.wrapper}>
      {/* Hero Banner */}
      <section className={`${styles.hero} glass`}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>In-Store Digital Menu</span>
          <h1 className={styles.title}>Fresh, Handcrafted Pizza Awaits</h1>
          <p className={styles.subtitle}>
            Order directly from your table. Custom-built pizzas, cold drinks, sides, and sweet desserts in minutes.
          </p>
        </div>
      </section>

      {/* Toolbar: Search and Filter */}
      <div className={`${styles.toolbar} glass`}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search our delicious menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.categoryTabs}>
          {initialCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`${styles.tabButton} ${
                activeCategory === cat.slug ? styles.activeTab : ""
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className={styles.gridSection}>
        {activeItems.length > 0 ? (
          <div className="grid-responsive">
            {activeItems.map((item) => (
              <div key={item.id} className={`${styles.card} glass`}>
                <div className={styles.cardHeader}>
                  <div className={styles.pizzaGraphic}>
                    {/* Unique gradient colors based on the item title */}
                    <div 
                      className={styles.pizzaInnerCircle}
                      style={{
                        background: item.isPizza 
                          ? "radial-gradient(circle, #f9be23 20%, #e65c00 70%)"
                          : "radial-gradient(circle, #555 10%, #222 80%)"
                      }}
                    >
                      <span className={styles.pizzaEmoji}>
                        {item.isPizza ? "🍕" : item.categoryId === initialCategories.find(c => c.slug === "drinks")?.id ? "🥤" : item.categoryId === initialCategories.find(c => c.slug === "desserts")?.id ? "🍰" : "🍟"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.itemMeta}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <span className={styles.itemPrice}>${item.basePrice.toFixed(2)}</span>
                  </div>
                  <p className={styles.itemDesc}>{item.description}</p>
                  
                  <div className={styles.cardActions}>
                    {item.isPizza ? (
                      <button
                        onClick={() => router.push(`/builder?id=${item.id}`)}
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                      >
                        Customize Pizza
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenQuantity(item)}
                        className="btn btn-secondary"
                        style={{ width: "100%" }}
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${styles.emptyState} glass`}>
            <Info size={36} className={styles.emptyIcon} />
            <p>No delicious items found matching "{searchQuery}" in this category.</p>
          </div>
        )}
      </div>

      {/* Quantity & Notes Modal */}
      {selectedItem && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass-elevated`}>
            <h2 className={styles.modalTitle}>Add to Order</h2>
            <div className={styles.modalBody}>
              <div className={styles.modalItemDetails}>
                <h4>{selectedItem.name}</h4>
                <p>{selectedItem.description}</p>
                <span className={styles.modalItemPrice}>
                  ${(selectedItem.basePrice * quantity).toFixed(2)}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className={styles.quantitySection}>
                <span className={styles.label}>Quantity:</span>
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

              {/* Notes */}
              <div className={styles.notesSection}>
                <label htmlFor="item-notes" className={styles.label}>Special Instructions:</label>
                <textarea
                  id="item-notes"
                  placeholder="E.g., No ice, extra sauce, well done..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.notesTextarea}
                  maxLength={150}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={handleCloseQuantity} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleAddToCart} className="btn btn-primary">
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
