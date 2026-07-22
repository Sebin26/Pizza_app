"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  PieChart,
  Grid,
  Settings,
  Users,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Category,
  MenuItem,
  PizzaSize,
  PizzaCrust,
  PizzaSauce,
  PizzaTopping,
  PizzaAddon,
  Order,
} from "@/types";

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  createdAt?: string;
}

interface AdminDashboardContainerProps {
  user: AdminUser;
  initialData: {
    categories: Category[];
    menuItems: MenuItem[];
    sizes: PizzaSize[];
    crusts: PizzaCrust[];
    sauces: PizzaSauce[];
    toppings: PizzaTopping[];
    addons: PizzaAddon[];
    users: AdminUser[];
    orders: Order[];
  };
}

export default function AdminDashboardContainer({ user, initialData }: AdminDashboardContainerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"analytics" | "menu" | "config" | "users" | "orders">("analytics");

  // Local collections state for real-time reactive edits
  const [categories, setCategories] = useState(initialData.categories);
  const [menuItems, setMenuItems] = useState(initialData.menuItems);
  const [sizes, setSizes] = useState(initialData.sizes);
  const [crusts, setCrusts] = useState(initialData.crusts);
  const [sauces, setSauces] = useState(initialData.sauces);
  const [toppings, setToppings] = useState(initialData.toppings);
  const [addons, setAddons] = useState(initialData.addons);
  const [usersList, setUsersList] = useState(initialData.users);
  const [orders] = useState(initialData.orders);

  // Form states
  // -- Category
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatOrder, setNewCatOrder] = useState("0");
  
  // -- Menu Item
  const [newItemName, setNewItemName] = useState("");
  const [newItemSlug, setNewItemSlug] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCat, setNewItemCat] = useState(categories[0]?.id || "");
  const [newItemIsPizza, setNewItemIsPizza] = useState(false);

  // -- Pizza Options
  const [optType, setOptType] = useState<"size" | "crust" | "sauce" | "topping" | "addon">("size");
  const [optName, setOptName] = useState("");
  const [optPrice, setOptPrice] = useState("");
  const [optFactor, setOptFactor] = useState("1.0");
  const [optIsVeg, setOptIsVeg] = useState(false);
  const [optIsVegan, setOptIsVegan] = useState(false);

  // -- Staff User
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRealName, setNewRealName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"STAFF" | "ADMIN">("STAFF");

  // -- Alerts/Errors
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const clearAlerts = () => {
    setActionError("");
    setActionSuccess("");
  };

  // Analytics helper math
  const analytics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= startOfToday);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    // Compute top-selling items
    const itemSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items || []) {
        if (!itemSales[item.menuItemId]) {
          itemSales[item.menuItemId] = { name: item.menuItem.name, qty: 0, revenue: 0 };
        }
        itemSales[item.menuItemId].qty += item.quantity;
        itemSales[item.menuItemId].revenue += item.totalPrice;
      }
    }

    const popularItems = Object.values(itemSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalRevenue,
      orderCount,
      avgOrderValue,
      todayRevenue,
      todayCount: todayOrders.length,
      popularItems,
    };
  }, [orders]);

  // CRUD Handler API calls
  // -- Categories CRUD
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName,
          slug: newCatSlug,
          description: newCatDesc,
          displayOrder: parseInt(newCatOrder) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCategories((prev) => [...prev, data.category].sort((a, b) => a.displayOrder - b.displayOrder));
      setActionSuccess("Category added successfully!");
      setNewCatName("");
      setNewCatSlug("");
      setNewCatDesc("");
      setNewCatOrder("0");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? All its items will be deleted!")) return;
    clearAlerts();
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setMenuItems((prev) => prev.filter((m) => m.categoryId !== id));
      setActionSuccess("Category deleted successfully.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  // -- Menu Items CRUD
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const catId = newItemCat || categories[0]?.id;
      const res = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItemName,
          slug: newItemSlug,
          description: newItemDesc,
          basePrice: parseFloat(newItemPrice),
          categoryId: catId,
          isPizza: newItemIsPizza,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMenuItems((prev) => [...prev, data.menuItem].sort((a, b) => a.name.localeCompare(b.name)));
      setActionSuccess("Menu item added successfully!");
      setNewItemName("");
      setNewItemSlug("");
      setNewItemDesc("");
      setNewItemPrice("");
      setNewItemIsPizza(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add menu item");
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    clearAlerts();
    try {
      const res = await fetch(`/api/admin/menu-items?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      setActionSuccess("Menu item deleted.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  // -- Pizza Configurations CRUD
  const handleAddPizzaOption = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const payload: {
        name: string;
        priceFactor?: number;
        priceAdd?: number;
        price?: number;
        displayOrder?: number;
        isVegetarian?: boolean;
        isVegan?: boolean;
      } = { name: optName };
      if (optType === "size") {
        payload.priceFactor = parseFloat(optFactor) || 1.0;
        payload.priceAdd = parseFloat(optPrice) || 0.0;
        payload.displayOrder = 0;
      } else if (optType === "crust" || optType === "sauce") {
        payload.price = parseFloat(optPrice) || 0.0;
        payload.displayOrder = 0;
      } else if (optType === "topping") {
        payload.price = parseFloat(optPrice) || 0.0;
        payload.isVegetarian = optIsVeg;
        payload.isVegan = optIsVegan;
      } else if (optType === "addon") {
        payload.price = parseFloat(optPrice) || 0.0;
      }

      const res = await fetch(`/api/admin/pizza-options?type=${optType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Add to respective list
      if (optType === "size") setSizes((p) => [...p, data.item]);
      else if (optType === "crust") setCrusts((p) => [...p, data.item]);
      else if (optType === "sauce") setSauces((p) => [...p, data.item]);
      else if (optType === "topping") setToppings((p) => [...p, data.item]);
      else if (optType === "addon") setAddons((p) => [...p, data.item]);

      setActionSuccess(`Pizza ${optType} added!`);
      setOptName("");
      setOptPrice("");
      setOptFactor("1.0");
      setOptIsVeg(false);
      setOptIsVegan(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add option");
    }
  };

  const handleDeletePizzaOption = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    clearAlerts();
    try {
      const res = await fetch(`/api/admin/pizza-options?type=${type}&id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      if (type === "size") setSizes((p) => p.filter((x) => x.id !== id));
      else if (type === "crust") setCrusts((p) => p.filter((x) => x.id !== id));
      else if (type === "sauce") setSauces((p) => p.filter((x) => x.id !== id));
      else if (type === "topping") setToppings((p) => p.filter((x) => x.id !== id));
      else if (type === "addon") setAddons((p) => p.filter((x) => x.id !== id));

      setActionSuccess(`Option deleted.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete option");
    }
  };

  // -- Staff User CRUD
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newRealName,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsersList((prev) => [data.user, ...prev]);
      setActionSuccess("User account created successfully!");
      setNewUsername("");
      setNewPassword("");
      setNewRealName("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    clearAlerts();
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsersList((prev) => prev.filter((u) => u.id !== id));
      setActionSuccess("User account deleted.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "RECEIVED": return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
      case "PREPARING": return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
      case "READY": return "bg-brand-gold/10 text-brand-gold border-brand-gold/20";
      case "COMPLETED": return "bg-brand-dark/10 text-brand-dark/60 border-brand-dark/15";
      default: return "";
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-white rounded-2xl p-5 shadow-sm border border-brand-dark/5 flex flex-col gap-6 shrink-0">
        <div className="flex items-center gap-2 border-b border-brand-dark/5 pb-4">
          <TrendingUp className="w-5 h-5 text-brand-primary" />
          <h2 className="text-base font-extrabold text-brand-dark">Admin Control</h2>
        </div>

        <nav className="flex flex-col gap-1 w-full">
          {([
            { id: "analytics", label: "Dashboard & Stats", icon: <PieChart className="w-4.5 h-4.5" /> },
            { id: "menu", label: "Menu & Categories", icon: <Grid className="w-4.5 h-4.5" /> },
            { id: "config", label: "Pizza Customizer", icon: <Settings className="w-4.5 h-4.5" /> },
            { id: "users", label: "Staff & Logins", icon: <Users className="w-4.5 h-4.5" /> },
            { id: "orders", label: "Order History", icon: <ShoppingBag className="w-4.5 h-4.5" /> }
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); clearAlerts(); }}
                className={`relative w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-[color] duration-200 ease-out cursor-pointer active:scale-[0.97] overflow-hidden ${
                  isActive
                    ? "text-white font-extrabold"
                    : "bg-brand-light text-brand-dark/70 hover:bg-brand-light/95 hover:text-brand-dark"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeAdminTab"
                    className="absolute inset-0 bg-brand-primary rounded-xl shadow-sm shadow-brand-primary/20 z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 border-t border-brand-dark/5 pt-5">
          <button 
            onClick={() => router.push("/staff")} 
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-dark/10 hover:bg-brand-light text-brand-dark/80 text-xs font-bold transition-[background-color,border-color,transform] duration-200 ease-out cursor-pointer active:scale-[0.97]"
          >
            <Store className="w-4 h-4 text-brand-primary" />
            <span>Kitchen Queue</span>
          </button>
          
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary/5 hover:bg-brand-primary hover:text-white text-brand-primary text-xs font-bold transition-[background-color,color,transform] duration-200 ease-out cursor-pointer active:scale-[0.97]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className="flex-1 w-full flex flex-col gap-6">
        
        {/* Success/Error Alerts */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-sm font-semibold"
            >
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
              <span>{actionSuccess}</span>
            </motion.div>
          )}

          {actionError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-semibold"
            >
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{actionError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. TAB: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-brand-dark/5 pb-4">
              <h1 className="text-xl font-extrabold text-brand-dark">Sales Analytics Overview</h1>
              <p className="text-xs text-brand-dark/50 font-medium">Live metrics for your in-store pizzeria branch.</p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Sales", val: `$${analytics.totalRevenue.toFixed(2)}`, icon: <DollarSign className="w-5 h-5 text-brand-gold" />, bg: "bg-brand-gold/5" },
                { label: "Total Orders", val: analytics.orderCount, icon: <ShoppingBag className="w-5 h-5 text-brand-primary" />, bg: "bg-brand-primary/5" },
                { label: "Avg. Ticket Value", val: `$${analytics.avgOrderValue.toFixed(2)}`, icon: <TrendingUp className="w-5 h-5 text-brand-primary" />, bg: "bg-brand-primary/5" },
                { label: "Today's Sales", val: `$${analytics.todayRevenue.toFixed(2)}`, icon: <Calendar className="w-5 h-5 text-brand-gold" />, bg: "bg-brand-gold/5", sub: `${analytics.todayCount} orders` }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-brand-dark/5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-xs transition-[transform,box-shadow] duration-300 ease-out shadow-xs">
                  <div className={`w-11 h-11 rounded-full ${kpi.bg} flex items-center justify-center shrink-0`}>
                    {kpi.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-brand-dark/40">{kpi.label}</span>
                    <h3 className="text-lg font-extrabold text-brand-dark mt-0.5">{kpi.val}</h3>
                    {kpi.sub && <small className="text-[10px] text-brand-dark/40 font-semibold">{kpi.sub}</small>}
                  </div>
                </div>
              ))}
            </div>

            {/* Popular and Live info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              {/* Popular Items Panel */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-dark/5 flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">Top 5 Gourmet Items</h3>
                <div className="flex flex-col gap-2">
                  {analytics.popularItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3.5 bg-brand-light rounded-xl text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded bg-brand-primary/5 text-brand-primary text-[10px] font-extrabold flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <span className="font-bold text-brand-dark">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-brand-dark/50">{item.qty} sold</span>
                        <strong className="text-brand-primary font-bold">${item.revenue.toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                  {analytics.popularItems.length === 0 && (
                    <p className="text-xs text-brand-dark/40 italic py-4 text-center">No transactions recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Prep logic quick info card */}
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-dark/5 border-l-4 border-l-brand-primary flex flex-col gap-3 justify-center">
                <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">Branch Prep Engine</h3>
                <div className="text-xs text-brand-dark/65 flex flex-col gap-2 leading-relaxed">
                  <p>Prep time is computed dynamically based on cooking orders in queue:</p>
                  <ul className="list-disc pl-4 flex flex-col gap-1 font-bold text-brand-dark/80">
                    <li>Base Prep Time: 15 minutes</li>
                    <li>Increments: +5 minutes per pending order</li>
                  </ul>
                  <p className="mt-2 text-brand-dark/50">
                    Use this center to manage categories, menu listings, customizer parameters, and staff dashboard credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB: MENU & CATEGORIES CRUD */}
        {activeTab === "menu" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-brand-dark/5 pb-4">
              <h1 className="text-xl font-extrabold text-brand-dark">Catalog Management</h1>
              <p className="text-xs text-brand-dark/50 font-medium">Configure categories and gourmet food listings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Category Control Panel */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-5">
                <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">Categories</h3>
                <form onSubmit={handleAddCategory} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      value={newCatName} 
                      onChange={e => setNewCatName(e.target.value)} 
                      required 
                      className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                    />
                    <input 
                      type="text" 
                      placeholder="Slug (lowercase)" 
                      value={newCatSlug} 
                      onChange={e => setNewCatSlug(e.target.value)} 
                      required 
                      className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Short description" 
                    value={newCatDesc} 
                    onChange={e => setNewCatDesc(e.target.value)} 
                    className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                  />
                  <input 
                    type="number" 
                    placeholder="Display Sort Order" 
                    value={newCatOrder} 
                    onChange={e => setNewCatOrder(e.target.value)} 
                    className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                  />
                  <button type="submit" className="w-full flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-xs shadow-sm hover:shadow transition-[background-color,transform,box-shadow] duration-200 ease-out cursor-pointer active:scale-[0.97]">
                    <Plus className="w-4 h-4" />
                    <span>Create Category</span>
                  </button>
                </form>

                {/* List rows */}
                <div className="flex flex-col gap-2 mt-2 max-h-75 overflow-y-auto pr-1">
                  {categories.map((c) => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-brand-light rounded-xl text-xs font-semibold">
                      <div className="flex flex-col gap-0.5">
                        <span>{c.name} <strong className="text-brand-dark/40 font-bold">/{c.slug}</strong></span>
                        {c.description && <p className="text-[10px] text-brand-dark/50 leading-tight mt-0.5">{c.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteCategory(c.id)} className="p-2 rounded-lg bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white transition-[background-color,color,transform] duration-200 ease-out cursor-pointer active:scale-[0.92]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Menu listings controller (7 Columns) */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-5">
                <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">Add Menu Listing</h3>
                <form onSubmit={handleAddMenuItem} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Item Name" 
                      value={newItemName} 
                      onChange={e => setNewItemName(e.target.value)} 
                      required 
                      className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                    />
                    <input 
                      type="text" 
                      placeholder="URL Slug" 
                      value={newItemSlug} 
                      onChange={e => setNewItemSlug(e.target.value)} 
                      required 
                      className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="Base Price ($)" 
                      value={newItemPrice} 
                      onChange={e => setNewItemPrice(e.target.value)} 
                      required 
                      className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                    />
                    <select 
                      value={newItemCat} 
                      onChange={e => setNewItemCat(e.target.value)} 
                      className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-brand-dark/75 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newItemIsPizza} 
                        onChange={e => setNewItemIsPizza(e.target.checked)} 
                        className="rounded text-brand-primary focus:ring-brand-primary/30"
                      />
                      <span>Is Customizable Pizza?</span>
                    </label>
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-xs shadow-sm hover:shadow transition-[background-color,transform,box-shadow] duration-200 ease-out cursor-pointer active:scale-[0.97]">
                    <Plus className="w-4 h-4" />
                    <span>Create Menu Item</span>
                  </button>
                </form>

                {/* List Items */}
                <div className="flex flex-col gap-2 mt-2 max-h-87.5 overflow-y-auto pr-1">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-brand-light rounded-xl text-xs font-semibold">
                      <div className="flex flex-col gap-0.5">
                        <span>{item.name} <strong className="text-brand-primary ml-1">${item.basePrice.toFixed(2)}</strong></span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-brand-dark/45 font-bold uppercase">{categories.find(c => c.id === item.categoryId)?.name || "Uncategorized"}</span>
                          {item.isPizza && <span className="text-brand-primary ml-2">[PIZZA]</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteMenuItem(item.id)} className="p-2 rounded-lg bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white transition-[background-color,color,transform] duration-200 ease-out cursor-pointer active:scale-[0.92]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. TAB: PIZZA OPTIONS CRUD */}
        {activeTab === "config" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-brand-dark/5 pb-4">
              <h1 className="text-xl font-extrabold text-brand-dark">Pizza Customizer Options</h1>
              <p className="text-xs text-brand-dark/50 font-medium">Configure crusts, sizes, sauces, toppings, and dippers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Option Panel */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-5">
                <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">Add customizer parameter</h3>
                <form onSubmit={handleAddPizzaOption} className="flex flex-col gap-3">
                  <select 
                    value={optType} 
                    onChange={e => setOptType(e.target.value as typeof optType)} 
                    className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                  >
                    <option value="size">Pizza Size</option>
                    <option value="crust">Pizza Crust</option>
                    <option value="sauce">Pizza Sauce</option>
                    <option value="topping">Pizza Topping</option>
                    <option value="addon">Add-on Item</option>
                  </select>

                  <input 
                    type="text" 
                    placeholder="Option Name (e.g. Thick Sicilian)" 
                    value={optName} 
                    onChange={e => setOptName(e.target.value)} 
                    required 
                    className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                  />

                  {optType === "size" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="Multiplier Factor (1.3)" 
                        value={optFactor} 
                        onChange={e => setOptFactor(e.target.value)} 
                        required 
                        className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                      />
                      <input 
                        type="number" 
                        step="0.01" 
                        placeholder="Flat price add ($)" 
                        value={optPrice} 
                        onChange={e => setOptPrice(e.target.value)} 
                        required 
                        className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                      />
                    </div>
                  ) : (
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="Flat Price ($)" 
                      value={optPrice} 
                      onChange={e => setOptPrice(e.target.value)} 
                      required 
                      className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                    />
                  )}

                  {optType === "topping" && (
                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-brand-dark/70 py-1">
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" id="isVeg" checked={optIsVeg} onChange={e => setOptIsVeg(e.target.checked)} className="rounded text-brand-primary focus:ring-brand-primary/30" />
                        <label htmlFor="isVeg">Vegetarian</label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="checkbox" id="isVegan" checked={optIsVegan} onChange={e => setOptIsVegan(e.target.checked)} className="rounded text-brand-primary focus:ring-brand-primary/30" />
                        <label htmlFor="isVegan">Vegan</label>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-xs shadow-sm hover:shadow transition-[background-color,transform,box-shadow] duration-200 ease-out cursor-pointer active:scale-[0.97]">
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Option</span>
                  </button>
                </form>
              </div>

              {/* Config list table column */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-extrabold uppercase text-brand-dark/50 tracking-wider">Sizes</span>
                  {sizes.map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-2.5 bg-brand-light rounded-xl text-xs font-semibold">
                      <span>{s.name} <strong className="text-brand-primary ml-1">${s.priceAdd.toFixed(2)}</strong> (x{s.priceFactor})</span>
                      <button onClick={() => handleDeletePizzaOption("size", s.id)} className="p-2 rounded-lg bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white transition-[background-color,color,transform] duration-200 ease-out cursor-pointer active:scale-[0.92]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-extrabold uppercase text-brand-dark/50 tracking-wider">Crusts</span>
                  {crusts.map((c) => (
                    <div key={c.id} className="flex justify-between items-center p-2.5 bg-brand-light rounded-xl text-xs font-semibold">
                      <span>{c.name} <strong className="text-brand-primary ml-1">${c.price.toFixed(2)}</strong></span>
                      <button onClick={() => handleDeletePizzaOption("crust", c.id)} className="p-2 rounded-lg bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white transition-[background-color,color,transform] duration-200 ease-out cursor-pointer active:scale-[0.92]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-extrabold uppercase text-brand-dark/50 tracking-wider">Sauces</span>
                  {sauces.map((s) => (
                    <div key={s.id} className="flex justify-between items-center p-2.5 bg-brand-light rounded-xl text-xs font-semibold">
                      <span>{s.name} <strong className="text-brand-primary ml-1">${s.price.toFixed(2)}</strong></span>
                      <button onClick={() => handleDeletePizzaOption("sauce", s.id)} className="p-2 rounded-lg bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white transition-[background-color,color,transform] duration-200 ease-out cursor-pointer active:scale-[0.92]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-extrabold uppercase text-brand-dark/50 tracking-wider">Toppings</span>
                  {toppings.map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-2.5 bg-brand-light rounded-xl text-xs font-semibold">
                      <div className="flex flex-col gap-0.5">
                        <span>{t.name} <strong className="text-brand-primary ml-1">${t.price.toFixed(2)}</strong></span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-brand-dark/45">
                          {t.isVegetarian && <span className="text-brand-gold">[VEG]</span>}
                          {t.isVegan && <span className="text-brand-gold">[VEGAN]</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDeletePizzaOption("topping", t.id)} className="p-2 rounded-lg bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white transition-[background-color,color,transform] duration-200 ease-out cursor-pointer active:scale-[0.92]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-extrabold uppercase text-brand-dark/50 tracking-wider">Add-ons & Dippers</span>
                  {addons.map((a) => (
                    <div key={a.id} className="flex justify-between items-center p-2.5 bg-brand-light rounded-xl text-xs font-semibold">
                      <span>{a.name} <strong className="text-brand-primary ml-1">${a.price.toFixed(2)}</strong></span>
                      <button onClick={() => handleDeletePizzaOption("addon", a.id)} className="p-2 rounded-lg bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white transition-[background-color,color,transform] duration-200 ease-out cursor-pointer active:scale-[0.92]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. TAB: STAFF & ACCOUNTS CRUD */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-brand-dark/5 pb-4">
              <h1 className="text-xl font-extrabold text-brand-dark">Staff Logins</h1>
              <p className="text-xs text-brand-dark/50 font-medium">Manage credentials access settings for kitchen crew.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Add User Panel */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-5">
                <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">Create Crew Account</h3>
                <form onSubmit={handleAddUser} className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    placeholder="Real Name (e.g. John Doe)" 
                    value={newRealName} 
                    onChange={e => setNewRealName(e.target.value)} 
                    required 
                    className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                  />
                  <input 
                    type="text" 
                    placeholder="Username" 
                    value={newUsername} 
                    onChange={e => setNewUsername(e.target.value)} 
                    required 
                    className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                  />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                  />
                  <select 
                    value={newUserRole} 
                    onChange={e => setNewUserRole(e.target.value as "STAFF" | "ADMIN")} 
                    className="w-full px-3 py-2 rounded-xl bg-brand-light text-brand-dark text-xs border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/10 transition-[box-shadow,border-color,background-color] duration-200 ease-out"
                  >
                    <option value="STAFF">STAFF (Kitchen Monitor)</option>
                    <option value="ADMIN">ADMIN (Full Access)</option>
                  </select>
                  <button type="submit" className="w-full flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white font-extrabold text-xs shadow-sm hover:shadow transition-[background-color,transform,box-shadow] duration-200 ease-out cursor-pointer active:scale-[0.97]">
                    <Plus className="w-4 h-4" />
                    <span>Create User</span>
                  </button>
                </form>
              </div>

              {/* List users column */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl shadow-xs border border-brand-dark/5 flex flex-col gap-4">
                <h3 className="text-sm font-extrabold text-brand-dark uppercase tracking-wider">Registered System Users</h3>
                <div className="flex flex-col gap-2 max-h-105 overflow-y-auto pr-1">
                  {usersList.map((usr) => (
                    <div key={usr.id} className="flex justify-between items-center p-3.5 bg-brand-light rounded-xl text-xs font-semibold">
                      <div className="flex flex-col gap-0.5">
                        <span>{usr.name} <strong className="text-brand-dark/40 font-bold">@{usr.username}</strong></span>
                        <p className="text-[10px] text-brand-dark/50 mt-0.5 leading-normal">
                          Role: <strong>{usr.role}</strong> | Created: {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      {user.id !== usr.id ? (
                        <button onClick={() => handleDeleteUser(usr.id)} className="p-2 rounded-lg bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white transition-[background-color,color,transform] duration-200 ease-out cursor-pointer active:scale-[0.92]">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/5 border border-brand-gold/20 px-2 py-1 rounded">Active</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 5. TAB: ORDER HISTORY */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 border-b border-brand-dark/5 pb-4">
              <h1 className="text-xl font-extrabold text-brand-dark">Order History Logs</h1>
              <p className="text-xs text-brand-dark/50 font-medium">Review and track historical dine-in transactions.</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-xs border border-brand-dark/5 flex flex-col gap-3.5 max-h-150 overflow-y-auto">
              {orders.map((o) => (
                <div key={o.id} className="p-4 bg-brand-light border border-brand-dark/5 rounded-2xl text-xs flex flex-col gap-2.5">
                  <div className="flex justify-between items-center border-b border-brand-dark/5 pb-2">
                    <span className="text-sm font-extrabold text-brand-primary">Token #{o.orderNumber}</span>
                    <span className="text-[10px] text-brand-dark/45 font-semibold">
                      {new Date(o.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-brand-dark">Customer: <strong className="text-brand-dark/80 font-bold">{o.customerName}</strong> {o.customerPhone && <span className="ml-2">({o.customerPhone})</span>}</span>
                    <p className="text-brand-dark/55 leading-relaxed mt-0.5">
                      <strong className="text-brand-dark/70">Items:</strong>{" "}
                      {o.items?.map((item) => `${item.quantity}x ${item.menuItem.name}`).join(", ")}
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-brand-dark/5 pt-2.5 mt-0.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyles(o.status)}`}>
                      {o.status}
                    </span>
                    <strong className="text-sm font-extrabold text-brand-dark">${o.total.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-xs text-brand-dark/45 italic py-6 text-center">No orders recorded in database yet.</p>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
