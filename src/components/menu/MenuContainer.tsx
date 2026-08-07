"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Category, MenuItem, PizzaConfig } from "@/types";
import { Search, ShoppingBag, Plus, Minus, Info, Flame, Wine, Cake, Disc } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { buildDefaultPizzaCustomization } from "@/utils/cart";

interface MenuContainerProps {
  initialCategories: Category[];
}

export default function MenuContainer({ initialCategories }: MenuContainerProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { push } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategories[0]?.slug || "pizzas"
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  // Non-pizza item quantity & size modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [pizzaConfig, setPizzaConfig] = useState<PizzaConfig | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/pizza-config")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setPizzaConfig(data);
      })
      .catch(() => {
        if (active) setPizzaConfig(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOpenQuantity = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setNotes("");
    if (item.sizePrices && item.sizePrices.length > 0) {
      setSelectedSizeId(item.sizePrices[0].sizeId);
    } else {
      setSelectedSizeId("");
    }
  };

  const handleAddPizzaDirect = (item: MenuItem) => {
    const customization = buildDefaultPizzaCustomization(item, pizzaConfig ?? undefined);
    addToCart(item, 1, customization);
    push(`${item.name} added to cart`, "success");
  };

  const handleCloseQuantity = () => {
    setSelectedItem(null);
    setSelectedSizeId("");
  };

  const selectedSizePriceObj = selectedItem?.sizePrices?.find((sp) => sp.sizeId === selectedSizeId);
  const currentUnitPrice = selectedSizePriceObj ? selectedSizePriceObj.price : selectedItem?.basePrice || 0;
  const currentTotalPrice = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    if (selectedItem) {
      const selectedSizeObj = selectedSizePriceObj?.size ?? (selectedSizePriceObj
        ? {
            id: selectedSizePriceObj.sizeId,
            name: "Size",
            priceFactor: 1,
            priceAdd: 0,
            displayOrder: 0,
          }
        : undefined);

      const customization = selectedSizeObj
        ? {
            ...buildDefaultPizzaCustomization(selectedItem, pizzaConfig ?? undefined),
            size: selectedSizeObj,
          }
        : buildDefaultPizzaCustomization(selectedItem, pizzaConfig ?? undefined);

      addToCart(selectedItem, quantity, customization, notes);
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

  // Helper to get category icons
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "pizzas":
        return <Flame className="w-4 h-4" />;
      case "drinks":
        return <Wine className="w-4 h-4" />;
      case "desserts":
        return <Cake className="w-4 h-4" />;
      default:
        return <Disc className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      
      {/* Hero Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="relative overflow-hidden rounded-3xl bg-brand-dark text-white p-8 sm:p-12 md:p-16 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-brand-primary/30 to-brand-gold/30 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-2xl -ml-20 -mb-20"></div>

        <div className="relative max-w-2xl flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-primary text-white text-sm font-extrabold uppercase tracking-wider w-fit">
            <Flame className="w-4 h-4 fill-current animate-pulse" /> In-Store Ordering Portal
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Gourmet Pizzas,<br />Baked for You.
          </h1>
          <p className="text-white/85 text-base sm:text-lg leading-relaxed font-semibold">
            Choose your size, customize toppings, and order directly from your table. Baked fresh in our wood-fired oven and served in minutes.
          </p>
        </div>
      </motion.section>

      {/* Toolbar: Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4.5 rounded-2xl shadow-xs border border-brand-dark/5">
        {/* Search Box */}
        <div className="relative w-full md:w-88">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-dark/40" />
          <input
            type="text"
            placeholder="Search our gourmet menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-brand-light text-brand-dark text-base placeholder-brand-dark/40 border-0 focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-[box-shadow,background-color] duration-200 ease-out"
          />
        </div>

        {/* Categories Tab selector */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {initialCategories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-base font-extrabold whitespace-nowrap transition-[color] duration-200 ease-out active:scale-[0.97] cursor-pointer ${
                  isActive
                    ? "text-white"
                    : "bg-brand-light text-brand-dark/70 hover:bg-brand-light/90 hover:text-brand-dark"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeMenuTab"
                    className="absolute inset-0 bg-brand-primary rounded-xl shadow-md shadow-brand-primary/20 z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {getCategoryIcon(cat.slug)}
                  <span>{cat.name}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid Section */}
      <section className="min-h-75">
        {activeItems.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-brand-dark/5 flex flex-col justify-between hover:-translate-y-1.5 transition-[transform,box-shadow] duration-300 ease-out"
              >
                {/* Visual Header */}
                <div className="h-44 bg-brand-light relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-tr from-brand-gold/5 to-brand-primary/5"></div>
                  
                  {/* Pizza Image / Item circular illustration */}
                  {item.imageUrl && item.isPizza ? (
                    <div className="relative w-36 h-36 transition-transform duration-500 ease-out group-hover:scale-110">
                      <Image
                        src={`/${item.imageUrl}.png`}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain rounded-full drop-shadow-lg"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-28 h-28 rounded-full shadow-lg flex items-center justify-center text-4xl animate-float transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-15"
                      style={{
                        background: item.isPizza 
                          ? "radial-gradient(circle, #D99A2B 10%, #e36316 60%, #be5212 100%)"
                          : "radial-gradient(circle, #E5E7EB 20%, #9CA3AF 80%)"
                      }}
                    >
                      <span>
                        {item.isPizza 
                          ? "🍕" 
                          : item.categoryId === initialCategories.find(c => c.slug === "drinks")?.id 
                          ? "🥤" 
                          : item.categoryId === initialCategories.find(c => c.slug === "desserts")?.id 
                          ? "🍰" 
                          : "🍟"}
                      </span>
                    </div>
                  )}

                  {item.isPizza && (
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-brand-primary text-white text-[10px] font-extrabold uppercase tracking-wide z-10">
                      Chef Special
                    </span>
                  )}
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col flex-1 gap-4 justify-between">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-extrabold text-brand-dark leading-snug hover:text-brand-primary transition-colors duration-200">
                        {item.name}
                      </h3>
                      <span className="text-xl font-black text-brand-primary shrink-0">
                        {item.sizePrices && item.sizePrices.length > 1
                          ? `From $${Math.min(...item.sizePrices.map((sp) => sp.price)).toFixed(2)}`
                          : item.sizePrices && item.sizePrices.length === 1
                          ? `$${item.sizePrices[0].price.toFixed(2)}`
                          : `$${item.basePrice.toFixed(2)}`}
                      </span>
                    </div>
                    <p className="text-base text-brand-dark/75 leading-relaxed font-semibold line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-2">
                    {item.isPizza ? (
                      <button
                        onClick={() => handleAddPizzaDirect(item)}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-base shadow-sm hover:shadow-md transition-[background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] cursor-pointer"
                      >
                        Add
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenQuantity(item)}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-light hover:bg-brand-dark hover:text-white text-brand-dark font-extrabold text-base transition-[background-color,color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] cursor-pointer"
                      >
                        {item.sizePrices && item.sizePrices.length > 1 ? "Select Size" : "Add to Cart"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-brand-dark/5 shadow-xs">
            <Info className="w-12 h-12 text-brand-dark/30 mb-3" />
            <h3 className="text-lg font-bold text-brand-dark">No dishes found</h3>
            <p className="text-sm text-brand-dark/50 max-w-sm">
              We couldn&apos;t find any items matching &ldquo;{searchQuery}&rdquo; in this category.
            </p>
          </div>
        )}
      </section>

      {/* Quantity & Notes Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={handleCloseQuantity}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.96, y: 10 },
                visible: { 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { type: "spring", duration: 0.35, bounce: 0.1 }
                },
                exit: {
                  opacity: 0,
                  scale: 0.97,
                  y: 6,
                  transition: { duration: 0.15, ease: "easeInOut" }
                }
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-brand-dark/5 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex flex-col gap-5">
                {/* Product Detail Preview */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-brand-dark">{selectedItem.name}</h2>
                    <p className="text-sm text-brand-dark/60">{selectedItem.description}</p>
                  </div>
                  <span className="text-xl font-extrabold text-brand-primary shrink-0">
                    ${currentTotalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Size Selector if item has multiple sizes */}
                {selectedItem.sizePrices && selectedItem.sizePrices.length > 1 && (
                  <div className="flex flex-col gap-2.5 border-t border-brand-dark/5 pt-4">
                    <span className="text-sm font-bold text-brand-dark">Choose Size</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {selectedItem.sizePrices.map((sp) => {
                        const isSelected = selectedSizeId === sp.sizeId;
                        const sizeLabel = sp.size?.name || "Size";
                        return (
                          <button
                            key={sp.sizeId}
                            type="button"
                            onClick={() => setSelectedSizeId(sp.sizeId)}
                            className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "bg-brand-primary/10 border-brand-primary text-brand-dark shadow-xs ring-1 ring-brand-primary/30"
                                : "bg-brand-light/60 border-brand-dark/5 text-brand-dark/70 hover:bg-brand-light"
                            }`}
                          >
                            <span className="text-xs font-bold text-brand-dark">{sizeLabel}</span>
                            <span className="text-sm font-extrabold text-brand-primary mt-1">
                              ${sp.price.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Controller */}
                <div className="flex items-center justify-between border-t border-b border-brand-dark/5 py-4">
                  <span className="text-sm font-bold text-brand-dark">Quantity</span>
                  <div className="flex items-center gap-4 bg-brand-light rounded-xl p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-primary shadow-xs transition-colors active:scale-[0.88] cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-extrabold w-6 text-center text-brand-dark">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-primary shadow-xs transition-colors active:scale-[0.88] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="modal-notes" className="text-sm font-bold text-brand-dark">
                    Special Instructions
                  </label>
                  <textarea
                    id="modal-notes"
                    placeholder="E.g., No ice, extra sauce, well done..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={150}
                    rows={3}
                    className="w-full p-3.5 rounded-xl bg-brand-light text-brand-dark text-sm placeholder-brand-dark/40 border-0 focus:ring-2 focus:ring-brand-primary/20 focus:bg-white resize-none transition-[background-color,box-shadow] duration-200 ease-out"
                  />
                  <div className="text-right text-[11px] text-brand-dark/40">
                    {notes.length}/150 characters
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 p-6 bg-brand-light border-t border-brand-dark/5 justify-end">
                <button
                  onClick={handleCloseQuantity}
                  className="px-5 py-2.5 rounded-xl hover:bg-brand-dark/5 text-brand-dark font-bold text-sm transition-[background-color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm shadow-md shadow-brand-primary/20 transition-[background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
