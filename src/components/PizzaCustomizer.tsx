"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart, calculateItemPrice } from "@/context/CartContext";
import { MenuItem, PizzaConfig, PizzaSize, PizzaCrust, PizzaSauce, PizzaTopping, PizzaAddon } from "@/types";
import { ChevronLeft, ShoppingBag, Plus, Minus, Check, Flame, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PizzaCustomizerProps {
  menuItem: MenuItem;
  config: PizzaConfig;
}

export default function PizzaCustomizer({ menuItem, config }: PizzaCustomizerProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  // Initialize selections with intelligent defaults
  const [selectedSize, setSelectedSize] = useState<PizzaSize>(config.sizes[0]);
  const [selectedCrust, setSelectedCrust] = useState<PizzaCrust>(config.crusts[0]);
  
  const [selectedSauce, setSelectedSauce] = useState<PizzaSauce>(() => {
    if (menuItem.name.toLowerCase().includes("bbq")) {
      const bbq = config.sauces.find((s) => s.name.toLowerCase().includes("bbq"));
      if (bbq) return bbq;
    } else if (menuItem.name.toLowerCase().includes("buffalo")) {
      const buffalo = config.sauces.find((s) => s.name.toLowerCase().includes("buffalo"));
      if (buffalo) return buffalo;
    }
    return config.sauces[0];
  });
  
  const [selectedToppings, setSelectedToppings] = useState<PizzaTopping[]>(() => {
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

    return config.toppings.filter((t) =>
      defaultToppingNames.some((dtName) => t.name.toLowerCase().includes(dtName))
    );
  });

  const [selectedAddons, setSelectedAddons] = useState<PizzaAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0); // 1 = forward, -1 = backward
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isEditingFromReview, setIsEditingFromReview] = useState(false);


  const steps = [
    { id: 1, name: "Size" },
    { id: 2, name: "Crust" },
    { id: 3, name: "Sauce" },
    { id: 4, name: "Toppings" },
    { id: 5, name: "Extras" },
    { id: 6, name: "Review" },
  ];

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return !!selectedSize;
      case 2:
        return !!selectedCrust;
      case 3:
        return !!selectedSauce;
      default:
        return true;
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setDirection(-1);
      setCurrentStep(stepId);
    }
  };

  const handleNext = () => {
    if (isEditingFromReview) {
      setDirection(1);
      setCurrentStep(6);
      setIsEditingFromReview(false);
      return;
    }
    if (currentStep < 6 && isStepValid(currentStep)) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : dir < 0 ? -50 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : dir < 0 ? 50 : 0,
      opacity: 0,
    }),
  };

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

  // Dynamic layered pizza preview SVG
  const renderPizzaPreview = () => {
    // Get crust color
    let crustColor = "#E2B27B";
    let crustStroke = "none";
    const crustName = selectedCrust.name.toLowerCase();
    if (crustName.includes("thin")) {
      crustColor = "#DCA365";
    } else if (crustName.includes("pan")) {
      crustColor = "#B0793D";
    } else if (crustName.includes("stuffed")) {
      crustColor = "#E6BE8A";
      crustStroke = "#C59356";
    }

    // Get sauce color
    let sauceColor = "#D32F2F"; // classic tomato
    const sauceName = selectedSauce.name.toLowerCase();
    if (sauceName.includes("garlic") || sauceName.includes("white")) {
      sauceColor = "#F9F5EB";
    } else if (sauceName.includes("bbq")) {
      sauceColor = "#5C1D11";
    } else if (sauceName.includes("buffalo")) {
      sauceColor = "#E65100";
    }

    // Get size scale style
    let sizeScale = 1.0;
    const sizeName = selectedSize.name.toLowerCase();
    if (sizeName.includes("personal") || sizeName.includes("small")) {
      sizeScale = 0.8;
    } else if (sizeName.includes("medium")) {
      sizeScale = 0.95;
    } else if (sizeName.includes("large")) {
      sizeScale = 1.1;
    }

    // Fixed coordinates for toppings distributed on a 100x100 circle
    const toppingCoords = [
      { x: 50, y: 30 },
      { x: 32, y: 40 },
      { x: 68, y: 40 },
      { x: 38, y: 64 },
      { x: 62, y: 64 },
      { x: 50, y: 72 },
      { x: 50, y: 50 }, // center
      { x: 34, y: 52 },
      { x: 66, y: 52 },
      { x: 44, y: 38 },
      { x: 56, y: 38 },
      { x: 42, y: 60 },
      { x: 58, y: 60 },
    ];

    return (
      <div 
        className="flex items-center justify-center py-4"
        style={{ transform: `scale(${sizeScale})`, transition: "transform 0.3s ease" }}
      >
        <svg width="140" height="140" viewBox="0 0 100 100" className="drop-shadow-md">
          {/* Crust (outer circle) */}
          <circle cx="50" cy="50" r="46" fill={crustColor} stroke={crustStroke} strokeWidth={crustStroke !== "none" ? "2" : "0"} />
          
          {/* Stuffed Crust details */}
          {crustName.includes("stuffed") && (
            <circle cx="50" cy="50" r="42" fill="none" stroke="#A77A47" strokeWidth="1" strokeDasharray="3,3" />
          )}
          
          {/* Sauce (middle circle) */}
          <circle cx="50" cy="50" r="39" fill={sauceColor} />
          
          {/* Cheese layer */}
          <circle cx="50" cy="50" r="37" fill="#FCD15B" fillOpacity="0.85" />
          <path d="M 30,50 Q 50,45 70,50 Q 50,55 30,50" fill="#F4B41A" fillOpacity="0.5" />
          <path d="M 50,30 Q 45,50 50,70 Q 55,50 50,30" fill="#F4B41A" fillOpacity="0.5" />

          {/* Render individual toppings */}
          {selectedToppings.map((topping, tIdx) => {
            const name = topping.name.toLowerCase();
            const activeCoords = toppingCoords.slice((tIdx * 3) % 8, ((tIdx * 3) % 8) + 5);

            return activeCoords.map((coord, cIdx) => {
              const key = `${topping.id}-${cIdx}`;
              if (name.includes("pepperoni")) {
                return (
                  <circle 
                    key={key} 
                    cx={coord.x} 
                    cy={coord.y} 
                    r="4.5" 
                    fill="#B1221C" 
                    stroke="#7F130E" 
                    strokeWidth="0.5" 
                  />
                );
              }
              if (name.includes("basil")) {
                return (
                  <path 
                    key={key} 
                    d={`M ${coord.x} ${coord.y} c -2 -3, -4 -1, -3 2 c 1 3, 4 1, 3 -2 Z`} 
                    fill="#4F9B3E" 
                    stroke="#39732B" 
                    strokeWidth="0.3" 
                    transform={`rotate(${cIdx * 45}, ${coord.x}, ${coord.y})`}
                  />
                );
              }
              if (name.includes("mushroom")) {
                return (
                  <g key={key} transform={`translate(${coord.x - 3}, ${coord.y - 3}) scale(0.8)`}>
                    <path d="M 1,4 A 3,3 0 0,1 7,4 Z" fill="#D2C7BC" stroke="#9A8E82" strokeWidth="0.5" />
                    <rect x="3.2" y="3.5" width="1.6" height="2.5" rx="0.5" fill="#E6DED6" stroke="#9A8E82" strokeWidth="0.5" />
                  </g>
                );
              }
              if (name.includes("ham")) {
                return (
                  <rect 
                    key={key} 
                    x={coord.x - 3.5} 
                    y={coord.y - 3.5} 
                    width="7" 
                    height="6" 
                    rx="0.5" 
                    fill="#E38D9A" 
                    stroke="#C86776" 
                    strokeWidth="0.5" 
                    transform={`rotate(${cIdx * 30}, ${coord.x}, ${coord.y})`}
                  />
                );
              }
              if (name.includes("pineapple")) {
                return (
                  <rect 
                    key={key} 
                    x={coord.x - 3} 
                    y={coord.y - 3} 
                    width="6" 
                    height="6" 
                    rx="0.5" 
                    fill="#EBD03F" 
                    stroke="#C1A720" 
                    strokeWidth="0.5" 
                    transform={`rotate(${cIdx * 60}, ${coord.x}, ${coord.y})`}
                  />
                );
              }
              if (name.includes("onion")) {
                return (
                  <path 
                    key={key} 
                    d={`M ${coord.x - 4} ${coord.y} A 4,4 0 0,1 ${coord.x + 4} ${coord.y}`} 
                    fill="none" 
                    stroke="#933D7C" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                    transform={`rotate(${cIdx * 90}, ${coord.x}, ${coord.y})`}
                  />
                );
              }
              if (name.includes("peppers")) {
                return (
                  <rect 
                    key={key} 
                    x={coord.x - 4} 
                    y={coord.y - 1.5} 
                    width="8" 
                    height="3" 
                    rx="0.5" 
                    fill="#328042" 
                    stroke="#225D2E" 
                    strokeWidth="0.5" 
                    transform={`rotate(${cIdx * 120}, ${coord.x}, ${coord.y})`}
                  />
                );
              }
              if (name.includes("olives")) {
                return (
                  <circle 
                    key={key} 
                    cx={coord.x} 
                    cy={coord.y} 
                    r="2.5" 
                    fill="none" 
                    stroke="#2C2C2C" 
                    strokeWidth="2" 
                  />
                );
              }
              if (name.includes("chicken")) {
                return (
                  <path 
                    key={key} 
                    d={`M ${coord.x - 3.5} ${coord.y - 2.5} q 3.5 -2, 7 0 q -3.5 5, -7 0`} 
                    fill="#CFB997" 
                    stroke="#A59071" 
                    strokeWidth="0.5" 
                    transform={`rotate(${cIdx * 75}, ${coord.x}, ${coord.y})`}
                  />
                );
              }
              if (name.includes("cheese") || name.includes("mozzarella") || name.includes("feta")) {
                return (
                  <circle 
                    key={key} 
                    cx={coord.x} 
                    cy={coord.y} 
                    r="3.5" 
                    fill="#FFFFFF" 
                    stroke="#EBE5DF" 
                    strokeWidth="0.5" 
                  />
                );
              }
              return (
                <circle 
                  key={key} 
                  cx={coord.x} 
                  cy={coord.y} 
                  r="2.5" 
                  fill="#FF9800" 
                />
              );
            });
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 lg:pb-8 flex flex-col gap-6">
      
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push("/")} 
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-brand-dark/70 hover:text-brand-red bg-white border border-brand-dark/5 hover:border-brand-dark/10 text-sm font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>
      </div>

      {/* Progress Indicator / Stepper */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-brand-dark/5 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto relative">
          {/* Background progress track */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-brand-dark/10 -translate-y-1/2 z-0" />
          
          {/* Animated active progress bar */}
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-brand-red -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          />

          {steps.map((s) => {
            const isActive = s.id === currentStep;
            const isCompleted = s.id < currentStep;
            return (
              <button
                key={s.id}
                type="button"
                disabled={!isCompleted}
                onClick={() => handleStepClick(s.id)}
                className={`relative z-10 flex flex-col items-center gap-1.5 focus:outline-none group ${isCompleted ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-[background-color,border-color,color,transform] duration-200 ease-out ${
                  isActive
                    ? "bg-white border-brand-red text-brand-red scale-110 shadow-sm"
                    : isCompleted
                    ? "bg-brand-red border-brand-red text-white"
                    : "bg-white border-brand-dark/20 text-brand-dark/40"
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-xs font-bold transition-colors duration-200 ease-out hidden sm:block ${
                  isActive
                    ? "text-brand-red font-extrabold"
                    : isCompleted
                    ? "text-brand-dark/70 group-hover:text-brand-red"
                    : "text-brand-dark/40"
                }`}>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
        {/* Mobile active step title */}
        <div className="text-center mt-3 sm:hidden text-sm font-extrabold text-brand-red">
          Step {currentStep} of 6: {steps[currentStep - 1].name}
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Customizer main content area */}
        <div className="w-full flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-dark flex items-center gap-2">
              <Flame className="w-7 h-7 text-brand-red fill-current" />
              Customize {menuItem.name}
            </h1>
            <p className="text-sm sm:text-[15px] text-brand-dark/60 leading-relaxed max-w-2xl">
              {menuItem.description}
            </p>
          </div>

          {/* Sliding wizard content container */}
          <div className="relative overflow-hidden min-h-[380px]">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="w-full flex flex-col gap-6"
              >
                {/* 1. Choose Size */}
                {currentStep === 1 && (
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
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`flex flex-col items-center text-center p-5 rounded-xl border-2 transition-[border-color,background-color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer ${
                              isActive
                                ? "border-brand-red bg-brand-red/2"
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
                )}

                {/* 2. Choose Crust */}
                {currentStep === 2 && (
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
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-[border-color,background-color,transform] duration-200 ease-out active:scale-[0.98] ${
                              isActive
                                ? "border-brand-red bg-brand-red/2"
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
                )}

                {/* 3. Choose Sauce */}
                {currentStep === 3 && (
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
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-[border-color,background-color,transform] duration-200 ease-out active:scale-[0.98] ${
                              isActive
                                ? "border-brand-red bg-brand-red/2"
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
                )}

                {/* 4. Add Toppings */}
                {currentStep === 4 && (
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
                              type="button"
                              onClick={() => handleToppingToggle(tp)}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-[border-color,background-color,transform] duration-200 ease-out text-left cursor-pointer active:scale-[0.98] ${
                                isSelected
                                  ? "border-brand-red bg-brand-red/2"
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
                              type="button"
                              onClick={() => handleToppingToggle(tp)}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-[border-color,background-color,transform] duration-200 ease-out text-left cursor-pointer active:scale-[0.98] ${
                                isSelected
                                  ? "border-brand-red bg-brand-red/2"
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
                              type="button"
                              onClick={() => handleToppingToggle(tp)}
                              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-[border-color,background-color,transform] duration-200 ease-out text-left cursor-pointer active:scale-[0.98] ${
                                isSelected
                                  ? "border-brand-red bg-brand-red/2"
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
                )}

                {/* 5. Add-ons Selection */}
                {currentStep === 5 && (
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
                            type="button"
                            onClick={() => handleAddonToggle(ad)}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-[border-color,background-color,transform] duration-200 ease-out text-left cursor-pointer active:scale-[0.98] ${
                              isSelected
                                ? "border-brand-red bg-brand-red/2"
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
                )}

                {/* 6. Integrated Review & Order summary step card */}
                {currentStep === 6 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-brand-dark/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Review selections checklist, Order Type, Special Instructions */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      
                      <div className="flex flex-col gap-3">
                        <h3 className="text-lg font-bold text-brand-dark border-b border-brand-dark/5 pb-2">
                          6. Review Your Selections
                        </h3>
                        
                        <div className="flex flex-col gap-1.5 text-sm mt-1">
                          {/* Size Selection */}
                          <div className="flex justify-between items-center py-2.5 border-b border-brand-dark/5">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-dark/40">Size</span>
                              <span className="font-bold text-brand-dark text-[15px]">{selectedSize.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingFromReview(true);
                                setDirection(-1);
                                setCurrentStep(1);
                              }}
                              className="text-xs font-extrabold text-brand-red hover:underline px-3 py-1.5 rounded-lg hover:bg-brand-red/5 transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                          
                          {/* Crust Selection */}
                          <div className="flex justify-between items-center py-2.5 border-b border-brand-dark/5">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-dark/40">Crust</span>
                              <span className="font-bold text-brand-dark text-[15px]">{selectedCrust.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingFromReview(true);
                                setDirection(-1);
                                setCurrentStep(2);
                              }}
                              className="text-xs font-extrabold text-brand-red hover:underline px-3 py-1.5 rounded-lg hover:bg-brand-red/5 transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>

                          {/* Sauce Selection */}
                          <div className="flex justify-between items-center py-2.5 border-b border-brand-dark/5">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-dark/40">Sauce</span>
                              <span className="font-bold text-brand-dark text-[15px]">{selectedSauce.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingFromReview(true);
                                setDirection(-1);
                                setCurrentStep(3);
                              }}
                              className="text-xs font-extrabold text-brand-red hover:underline px-3 py-1.5 rounded-lg hover:bg-brand-red/5 transition-all cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>

                          {/* Toppings Selection */}
                          <div className="flex justify-between items-center py-2.5 border-b border-brand-dark/5">
                            <div className="flex flex-col pr-4">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-dark/40">Toppings</span>
                              <span className="font-bold text-brand-dark text-[14px] leading-relaxed">
                                {selectedToppings.length > 0
                                  ? selectedToppings.map((t) => t.name).join(", ")
                                  : "None selected"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingFromReview(true);
                                setDirection(-1);
                                setCurrentStep(4);
                              }}
                              className="text-xs font-extrabold text-brand-red hover:underline px-3 py-1.5 rounded-lg hover:bg-brand-red/5 transition-all cursor-pointer shrink-0"
                            >
                              Edit
                            </button>
                          </div>

                          {/* Extras / Add-ons Selection */}
                          <div className="flex justify-between items-center py-2.5 border-b border-brand-dark/5">
                            <div className="flex flex-col pr-4">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-dark/40">Extras / Add-ons</span>
                              <span className="font-bold text-brand-dark text-[14px] leading-relaxed">
                                {selectedAddons.length > 0
                                  ? selectedAddons.map((a) => a.name).join(", ")
                                  : "None selected"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingFromReview(true);
                                setDirection(-1);
                                setCurrentStep(5);
                              }}
                              className="text-xs font-extrabold text-brand-red hover:underline px-3 py-1.5 rounded-lg hover:bg-brand-red/5 transition-all cursor-pointer shrink-0"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions card */}
                      <div className="flex flex-col gap-2.5 border-t border-brand-dark/5 pt-4">
                        <h3 className="text-base font-bold text-brand-dark">
                          7. Special Instructions
                        </h3>
                        <textarea
                          placeholder="E.g., bake it extra crispy, cut in squares..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          maxLength={200}
                          rows={3}
                          className="w-full p-3.5 rounded-xl bg-brand-light text-brand-dark text-sm placeholder-brand-dark/70 border-0 focus:ring-2 focus:ring-brand-red/20 focus:bg-white resize-none transition-[background-color,box-shadow] duration-200 ease-out"
                        />
                      </div>

                    </div>

                    {/* Right Column: Pizza Preview & Itemized Breakdown */}
                    <div className="lg:col-span-5 bg-brand-light/50 p-6 rounded-xl border border-brand-dark/5 flex flex-col gap-5 w-full">
                      
                      {/* Dynamic Layered Visual Preview */}
                      <div className="flex flex-col items-center text-center">
                        {renderPizzaPreview()}
                        <h3 className="text-base font-extrabold text-brand-dark mt-1">Your Custom Pizza</h3>
                        <p className="text-xs text-brand-dark/50">Fresh & hot, baked to order</p>
                      </div>

                      {/* Full Itemized Price Breakdown */}
                      <div className="flex flex-col gap-2 text-sm border-t border-brand-dark/5 pt-4">
                        <div className="flex justify-between items-center text-xs text-brand-dark/50 font-extrabold uppercase tracking-wider">
                          <span>Item</span>
                          <span>Price</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs font-bold text-brand-dark border-t border-brand-dark/5 pt-2">
                          <span>Base Pizza ({menuItem.name})</span>
                          <span>${menuItem.basePrice.toFixed(2)}</span>
                        </div>

                        {selectedSize.priceAdd > 0 && (
                          <div className="flex justify-between items-center text-xs text-brand-dark/80 font-semibold">
                            <span>Size upcharge ({selectedSize.name})</span>
                            <span>+${selectedSize.priceAdd.toFixed(2)}</span>
                          </div>
                        )}

                        {selectedCrust.price > 0 && (
                          <div className="flex justify-between items-center text-xs text-brand-dark/80 font-semibold">
                            <span>Crust upcharge ({selectedCrust.name})</span>
                            <span>+${selectedCrust.price.toFixed(2)}</span>
                          </div>
                        )}

                        {selectedSauce.price > 0 && (
                          <div className="flex justify-between items-center text-xs text-brand-dark/80 font-semibold">
                            <span>Sauce upcharge ({selectedSauce.name})</span>
                            <span>+${selectedSauce.price.toFixed(2)}</span>
                          </div>
                        )}

                        {selectedToppings.map((t) => {
                          if (t.price === 0) return null;
                          return (
                            <div key={t.id} className="flex justify-between items-center text-xs text-brand-dark/80 font-semibold">
                              <span>{t.name}</span>
                              <span>+${t.price.toFixed(2)}</span>
                            </div>
                          );
                        })}

                        {selectedAddons.map((a) => {
                          if (a.price === 0) return null;
                          return (
                            <div key={a.id} className="flex justify-between items-center text-xs text-brand-dark/80 font-semibold">
                              <span>{a.name}</span>
                              <span>+${a.price.toFixed(2)}</span>
                            </div>
                          );
                        })}

                        {/* Special Instructions Note reflected */}
                        {notes.trim() && (
                          <div className="text-[11px] text-brand-dark/60 mt-1 italic border-t border-brand-dark/5 pt-1.5 leading-relaxed max-w-full overflow-hidden">
                            <span className="font-extrabold not-italic text-brand-dark/50">NOTE:</span> &ldquo;{notes.length > 50 ? `${notes.slice(0, 50)}...` : notes}&rdquo;
                          </div>
                        )}

                      </div>

                      {/* Quantity control */}
                      <div className="flex items-center justify-between border-t border-brand-dark/5 pt-3">
                        <span className="text-sm font-bold text-brand-dark">Quantity</span>
                        <div className="flex items-center gap-3 bg-brand-light rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-red shadow-xs transition-colors active:scale-[0.88] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-extrabold w-5 text-center text-brand-dark">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => q + 1)}
                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-red shadow-xs transition-colors active:scale-[0.88] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Price Row */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-extrabold text-brand-dark">Total Price</span>
                        <span className="text-2xl font-black text-brand-red">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Submit Action Button */}
                      <button 
                        type="button"
                        onClick={handleAdd} 
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white font-extrabold text-[15px] shadow-md shadow-brand-red/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-[background-color,transform,box-shadow] duration-200 ease-out cursor-pointer"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span>Add Pizza to Cart</span>
                      </button>

                    </div>

                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop inline navigation controls */}
          <div className="hidden lg:flex justify-between items-center mt-6 p-4 bg-brand-light/50 rounded-2xl border border-brand-dark/5">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-brand-dark/70 hover:text-brand-red bg-white border border-brand-dark/10 hover:border-brand-dark/20 text-sm font-extrabold transition-[border-color,color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div className="w-[80px]" />
            )}

            {/* Running Total price visible near the bottom action buttons for steps 1-5 */}
            {currentStep < 6 && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-brand-dark/5 shadow-2xs">
                <span className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Total:</span>
                <span className="text-base font-black text-brand-red">${totalPrice.toFixed(2)}</span>
              </div>
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-[background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] cursor-pointer ${
                  isStepValid(currentStep)
                    ? "bg-brand-red text-white hover:bg-brand-red/90 shadow-md shadow-brand-red/10"
                    : "bg-brand-dark/10 text-brand-dark/40 cursor-not-allowed"
                }`}
              >
                <span>{isEditingFromReview ? "Save & Return" : "Continue"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              // Empty spacer on Step 6 for desktop since the only CTA is the sidebar button
              <div className="w-[180px]" />
            )}
          </div>

        </div>
      </div>

      {/* Collapsible Mobile Bottom Bar (visible only on mobile/tablet) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brand-dark/10 shadow-lg z-40 flex flex-col transition-all duration-300">
        
        {/* Toggleable summary header */}
        <button
          type="button"
          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
          className="flex items-center justify-between px-6 py-3 border-b border-brand-dark/5 bg-brand-light/50 w-full text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-brand-dark">Your Pizza Summary</span>
            <span className="text-xs text-brand-dark/50 font-semibold">({quantity}x)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-extrabold text-brand-red">${totalPrice.toFixed(2)}</span>
            {isSummaryExpanded ? (
              <ChevronDown className="w-4 h-4 text-brand-dark/60" />
            ) : (
              <ChevronUp className="w-4 h-4 text-brand-dark/60" />
            )}
          </div>
        </button>

        {/* Collapsible content area */}
        <AnimatePresence>
          {isSummaryExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden bg-white px-6 py-4 flex flex-col gap-4 text-sm max-h-[300px] overflow-y-auto"
            >
              {/* Receipt styling: label/value pairs with light bottom border */}
              <div className="flex justify-between items-center py-1.5 border-b border-brand-dark/5">
                <span className="font-extrabold text-brand-dark/50 text-xs">Size</span>
                <span className="font-bold text-brand-dark">{selectedSize.name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-brand-dark/5">
                <span className="font-extrabold text-brand-dark/50 text-xs">Crust</span>
                <span className="font-bold text-brand-dark">{selectedCrust.name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-brand-dark/5">
                <span className="font-extrabold text-brand-dark/50 text-xs">Sauce</span>
                <span className="font-bold text-brand-dark">{selectedSauce.name}</span>
              </div>

              {selectedToppings.length > 0 && (
                <div className="flex justify-between items-start py-1.5 border-b border-brand-dark/5">
                  <span className="font-extrabold text-brand-dark/50 text-xs">Toppings</span>
                  <span className="font-bold text-brand-dark text-right max-w-[70%] leading-tight">
                    {selectedToppings.map((t) => t.name).join(", ")}
                  </span>
                </div>
              )}

              {selectedAddons.length > 0 && (
                <div className="flex justify-between items-start py-1.5 border-b border-brand-dark/5">
                  <span className="font-extrabold text-brand-dark/50 text-xs">Add-ons</span>
                  <span className="font-bold text-brand-dark text-right max-w-[70%] leading-tight">
                    {selectedAddons.map((a) => a.name).join(", ")}
                  </span>
                </div>
              )}



              {/* Mobile display of Special instructions note */}
              {notes.trim() && (
                <div className="flex flex-col gap-1 py-1.5">
                  <span className="font-extrabold text-brand-dark/50 text-xs">Special Instructions</span>
                  <span className="font-semibold text-brand-dark/70 italic leading-tight">&ldquo;{notes}&rdquo;</span>
                </div>
              )}

              {/* Quantity Adjustment inside collapsible menu on mobile */}
              <div className="flex items-center justify-between border-t border-brand-dark/5 pt-4">
                <span className="text-sm font-bold text-brand-dark">Quantity</span>
                <div className="flex items-center gap-3 bg-brand-light rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-red shadow-xs transition-[color,transform] duration-150 ease-out active:scale-[0.88] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-extrabold w-5 text-center text-brand-dark">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-red shadow-xs transition-[color,transform] duration-150 ease-out active:scale-[0.88] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pinned action buttons */}
        <div className="flex items-center gap-3 p-4 border-t border-brand-dark/5 bg-white">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-brand-dark/10 hover:border-brand-dark/20 text-brand-dark/75 font-extrabold text-sm transition-[border-color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-brand-dark/10 hover:border-brand-dark/20 text-brand-dark/75 font-extrabold text-sm transition-[border-color,transform] duration-200 ease-out active:scale-[0.97] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Menu</span>
            </button>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className={`flex-2 flex items-center justify-center gap-1.5 py-3 rounded-xl font-extrabold text-sm transition-[background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] cursor-pointer ${
                isStepValid(currentStep)
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/10"
                  : "bg-brand-dark/10 text-brand-dark/45 cursor-not-allowed"
              }`}
            >
              <span>{isEditingFromReview ? "Save & Return" : "Continue"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="flex-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white font-extrabold text-sm transition-[background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.97] cursor-pointer shadow-md shadow-brand-red/20"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
