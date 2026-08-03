"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Send,
  AlertTriangle,
  Truck,
  MapPin,
  UtensilsCrossed,
  X,
  Edit2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, tax } = useCart();

  // Guest checkout form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<"DINE_IN" | "PICKUP" | "DELIVERY">("DINE_IN");

  // Delivery form state
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Delivery address pop-up modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState("");

  // Config state
  const [config, setConfig] = useState<{
    deliveryEnabled: boolean;
    deliveryFee: number;
    freeDeliveryThreshold: number;
  }>({
    deliveryEnabled: true,
    deliveryFee: 3.99,
    freeDeliveryThreshold: 35.0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig({
              deliveryEnabled: data.config.deliveryEnabled === "true",
              deliveryFee: parseFloat(data.config.deliveryFee || "3.99"),
              freeDeliveryThreshold: parseFloat(data.config.freeDeliveryThreshold || "35.00"),
            });
          }
        }
      } catch (err) {
        console.error("Failed to load config:", err);
      }
    }
    fetchConfig();
  }, []);

  const computedDeliveryFee =
    fulfillmentType === "DELIVERY"
      ? subtotal >= config.freeDeliveryThreshold
        ? 0
        : config.deliveryFee
      : 0;

  const grandTotal = subtotal + tax + computedDeliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setErrorMsg("Please enter your name to place the order.");
      return;
    }

    if (fulfillmentType === "DELIVERY") {
      if (!customerPhone.trim()) {
        setErrorMsg("Phone number is required for delivery orders.");
        return;
      }
      if (!addressLine1.trim()) {
        setErrorMsg("Address Line 1 is required for delivery.");
        return;
      }
      if (!city.trim()) {
        setErrorMsg("City is required for delivery.");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Map cart items to API requirements
      const apiItems = cart.map((item) => {
        const payload: {
          menuItemId: string;
          quantity: number;
          notes: string;
          customization?: {
            sizeId: string;
            crustId: string;
            sauceId: string;
            toppingIds: string[];
            addonIds: string[];
          };
        } = {
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes || "",
        };

        if (item.menuItem.isPizza && item.customization) {
          payload.customization = {
            sizeId: item.customization.size.id,
            crustId: item.customization.crust.id,
            sauceId: item.customization.sauce.id,
            toppingIds: item.customization.toppings.map((t) => t.id),
            addonIds: item.customization.addons.map((a) => a.id),
          };
        }

        return payload;
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerPhone: customerPhone ? customerPhone : null,
          fulfillmentType,
          delivery:
            fulfillmentType === "DELIVERY"
              ? {
                  addressLine1,
                  addressLine2: addressLine2 || undefined,
                  city,
                  postcode: postcode || undefined,
                  landmark: landmark || undefined,
                  deliveryInstructions: deliveryInstructions || undefined,
                }
              : undefined,
          items: apiItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while submitting the order.");
      }

      // Success
      clearCart();
      router.push(`/confirmation/${data.order.id}`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to submit order. Please try again.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-brand-dark/5 flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center text-brand-dark/30">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-brand-dark">Your Cart is Empty</h2>
            <p className="text-sm sm:text-base text-brand-dark/50 leading-relaxed max-w-sm">
              Head back to our gourmet menu and select some delicious food to order.
            </p>
          </div>
          <Link
            href="/?order=true"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm shadow-md shadow-brand-primary/20 transition-all active:scale-95 hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Menu</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 border-b border-brand-dark/5 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-dark">
          Review Your Order
        </h1>
        <p className="text-sm sm:text-[15px] text-brand-dark/50">
          Verify your details and checkout instantly. No registration required.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/25 text-brand-primary">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cart.map((item) => (
            <motion.div
              layout
              key={item.id}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              <div className="flex gap-4 items-start sm:items-center flex-1">
                <span className="text-4xl shrink-0 p-2.5 rounded-xl bg-brand-light">
                  {item.menuItem.isPizza ? "🍕" : "🍽️"}
                </span>

                <div className="flex flex-col gap-1">
                  <h3 className="text-base sm:text-lg font-bold text-brand-dark">
                    {item.menuItem.name}
                  </h3>

                  {item.menuItem.isPizza && item.customization && (
                    <div className="text-xs sm:text-sm text-brand-dark/50 flex flex-col gap-0.5">
                      <p>
                        <strong className="text-brand-dark/70 font-semibold">Size:</strong>{" "}
                        {item.customization.size.name} |{" "}
                        <strong className="text-brand-dark/70 font-semibold">Crust:</strong>{" "}
                        {item.customization.crust.name}
                      </p>
                      <p>
                        <strong className="text-brand-dark/70 font-semibold">Sauce:</strong>{" "}
                        {item.customization.sauce.name}
                      </p>
                      {item.customization.toppings.length > 0 && (
                        <p>
                          <strong className="text-brand-dark/70 font-semibold">Toppings:</strong>{" "}
                          {item.customization.toppings.map((t) => t.name).join(", ")}
                        </p>
                      )}
                      {item.customization.addons.length > 0 && (
                        <p>
                          <strong className="text-brand-dark/70 font-semibold">Add-ons:</strong>{" "}
                          {item.customization.addons.map((a) => a.name).join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-xs sm:text-sm italic text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg border border-brand-primary/10 w-fit mt-1">
                      Note: {item.notes}
                    </p>
                  )}

                  <span className="text-base font-extrabold text-brand-primary mt-1.5 flex items-baseline gap-1.5">
                    ${(item.price * item.quantity).toFixed(2)}
                    {item.quantity > 1 && (
                      <span className="text-xs font-semibold text-brand-dark/40">
                        (${item.price.toFixed(2)} each)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Quantity controls and delete action */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-brand-dark/5 pt-4 sm:pt-0">
                <div className="flex items-center gap-3.5 bg-brand-light rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-primary shadow-xs transition-colors active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-extrabold w-5 text-center text-brand-dark">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-brand-dark hover:text-brand-primary shadow-xs transition-colors active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-9 h-9 rounded-xl bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white flex items-center justify-center transition-colors duration-200 active:scale-95 shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </motion.div>
          ))}

          <Link
            href="/?order=true"
            className="flex items-center gap-1.5 text-sm font-bold text-brand-dark/60 hover:text-brand-primary transition-colors w-fit px-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Adding Food</span>
          </Link>
        </div>

        {/* Right Column: Checkout Summary & Guest Form (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-brand-dark/5 flex flex-col gap-6">
            <h3 className="text-lg font-extrabold text-brand-dark border-b border-brand-dark/5 pb-3">
              Order Summary
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center text-brand-dark/60">
                <span className="font-semibold">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-brand-dark/60">
                <span className="font-semibold">Taxes (10%)</span>
                <span className="font-bold">${tax.toFixed(2)}</span>
              </div>

              {fulfillmentType === "DELIVERY" && (
                <div className="flex justify-between items-center text-brand-dark/60">
                  <span className="font-semibold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-brand-primary" /> Delivery Fee
                  </span>
                  <span className="font-bold">
                    {computedDeliveryFee === 0 ? (
                      <span className="text-emerald-600 font-extrabold">FREE</span>
                    ) : (
                      `$${computedDeliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
              )}

              {fulfillmentType === "DELIVERY" && subtotal < config.freeDeliveryThreshold && (
                <p className="text-[11px] text-brand-gold bg-brand-gold/10 p-2 rounded-lg font-bold border border-brand-gold/20">
                  Add ${(config.freeDeliveryThreshold - subtotal).toFixed(2)} more to unlock FREE Delivery!
                </p>
              )}

              <div className="flex justify-between items-center border-t border-brand-dark/5 pt-4 text-brand-dark">
                <span className="text-base font-extrabold">Total Amount</span>
                <span className="text-2xl font-extrabold text-brand-primary">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Guest Details & Fulfillment Form */}
            <form onSubmit={handleSubmitOrder} className="flex flex-col gap-4 border-t border-brand-dark/5 pt-5">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-extrabold text-brand-dark">Order & Fulfillment</h4>
                <p className="text-[11px] text-brand-dark/40">
                  Choose how you would like to receive your food.
                </p>
              </div>

              {/* 3-way Fulfillment Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-dark/70">Fulfillment Option</label>
                <div className="grid grid-cols-3 gap-1.5 bg-brand-light p-1 rounded-xl text-center">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType("DINE_IN")}
                    className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 ${
                      fulfillmentType === "DINE_IN"
                        ? "bg-brand-primary text-white shadow-xs"
                        : "text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5"
                    }`}
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Dine In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentType("PICKUP")}
                    className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 ${
                      fulfillmentType === "PICKUP"
                        ? "bg-brand-primary text-white shadow-xs"
                        : "text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Pickup</span>
                  </button>

                  <button
                    type="button"
                    disabled={!config.deliveryEnabled}
                    onClick={() => {
                      if (config.deliveryEnabled) {
                        setFulfillmentType("DELIVERY");
                        setIsAddressModalOpen(true);
                      }
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 ${
                      !config.deliveryEnabled
                        ? "opacity-50 cursor-not-allowed text-brand-dark/30"
                        : fulfillmentType === "DELIVERY"
                        ? "bg-brand-primary text-white shadow-xs"
                        : "text-brand-dark/70 hover:text-brand-dark hover:bg-brand-dark/5"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Delivery</span>
                  </button>
                </div>
                {!config.deliveryEnabled && (
                  <span className="text-[10px] text-brand-primary font-bold">
                    Delivery is currently disabled by restaurant staff.
                  </span>
                )}
              </div>

              {/* Basic Details */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer-name" className="text-xs font-bold text-brand-dark/70">
                  Your Name <span className="text-brand-primary font-bold">*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  placeholder="E.g., Mario Rossi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-light text-brand-dark text-sm placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all duration-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer-phone" className="text-xs font-bold text-brand-dark/70">
                  Phone Number{" "}
                  {fulfillmentType === "DELIVERY" ? (
                    <span className="text-brand-primary font-bold">*</span>
                  ) : (
                    <span className="text-brand-dark/40 font-semibold">(Optional)</span>
                  )}
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  required={fulfillmentType === "DELIVERY"}
                  placeholder="E.g., 555-0199"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-light text-brand-dark text-sm placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Compact Delivery Address Summary & Trigger Button */}
              {fulfillmentType === "DELIVERY" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-2 border-t border-brand-dark/5 pt-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-brand-dark flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                      <span>Delivery Destination</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-[11px] font-bold text-brand-primary hover:text-brand-primary-dark flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{addressLine1.trim() && city.trim() ? "Edit Address" : "Add Address"}</span>
                    </button>
                  </div>

                  {addressLine1.trim() && city.trim() ? (
                    <div
                      onClick={() => setIsAddressModalOpen(true)}
                      className="p-3 rounded-xl bg-brand-light border border-brand-dark/5 hover:border-brand-primary/30 transition-all cursor-pointer flex flex-col gap-1 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-brand-dark group-hover:text-brand-primary transition-colors leading-snug">
                          {addressLine1}
                          {addressLine2 ? `, ${addressLine2}` : ""}
                        </p>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                          Address Set
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-dark/60 font-medium">
                        {city}
                        {postcode ? `, ${postcode}` : ""}
                      </p>
                      {(landmark || deliveryInstructions) && (
                        <p className="text-[10px] text-brand-dark/45 truncate mt-0.5">
                          {landmark ? `Near: ${landmark}` : deliveryInstructions}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="p-3 rounded-xl bg-brand-primary/5 hover:bg-brand-primary/10 border border-dashed border-brand-primary/30 text-brand-primary text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Enter Delivery Address Details</span>
                    </button>
                  )}
                </motion.div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center gap-2 border border-brand-primary/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-[15px] shadow-md shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-99"
              >
                {isSubmitting ? (
                  <span>Placing Order...</span>
                ) : fulfillmentType === "DINE_IN" ? (
                  <>
                    <UtensilsCrossed className="w-4.5 h-4.5" />
                    <span>Place Dine-In Order</span>
                  </>
                ) : fulfillmentType === "PICKUP" ? (
                  <>
                    <ShoppingBag className="w-4.5 h-4.5" />
                    <span>Place Pickup Order</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4.5 h-4.5" />
                    <span>Place Delivery Order</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Delivery Address Details Pop-up Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-brand-dark/10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-brand-dark/5 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-brand-dark">Delivery Address</h3>
                    <p className="text-[11px] text-brand-dark/50 font-medium">Enter location for fast delivery</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-brand-light hover:bg-brand-dark/10 flex items-center justify-center text-brand-dark/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-dark/70">
                    Address Line 1 <span className="text-brand-primary font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street address, P.O. box"
                    value={addressLine1}
                    onChange={(e) => {
                      setAddressLine1(e.target.value);
                      if (modalErrorMsg) setModalErrorMsg("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-light text-brand-dark text-xs placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-dark/70">Address Line 2</label>
                  <input
                    type="text"
                    placeholder="Apt, Suite, Unit, Building (Optional)"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-light text-brand-dark text-xs placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-brand-dark/70">
                      City <span className="text-brand-primary font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City name"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (modalErrorMsg) setModalErrorMsg("");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-light text-brand-dark text-xs placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-brand-dark/70">Postcode</label>
                    <input
                      type="text"
                      placeholder="ZIP / Postcode"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-light text-brand-dark text-xs placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-dark/70">Landmark</label>
                  <input
                    type="text"
                    placeholder="E.g., Near City Park Main Gate"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-light text-brand-dark text-xs placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-brand-dark/70">Delivery Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="Gate code, drop off preference..."
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-light text-brand-dark text-xs placeholder-brand-dark/30 border border-transparent focus:border-brand-primary/30 focus:bg-white resize-none transition-all"
                  />
                </div>

                {modalErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center gap-2 border border-brand-primary/20">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{modalErrorMsg}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 border-t border-brand-dark/5 pt-3.5">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-brand-dark/10 text-brand-dark/70 text-xs font-bold hover:bg-brand-light transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!addressLine1.trim() || !city.trim()) {
                      setModalErrorMsg("Please fill in required fields (Address Line 1 & City).");
                      return;
                    }
                    setModalErrorMsg("");
                    setIsAddressModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Address</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
