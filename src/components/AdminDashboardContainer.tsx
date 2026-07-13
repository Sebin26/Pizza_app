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
  Edit2,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";
import styles from "./AdminDashboard.module.css";

interface AdminDashboardContainerProps {
  user: any;
  initialData: {
    categories: any[];
    menuItems: any[];
    sizes: any[];
    crusts: any[];
    sauces: any[];
    toppings: any[];
    addons: any[];
    users: any[];
    orders: any[];
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
  const [orders, setOrders] = useState(initialData.orders);

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
  const [newUserRole, setNewUserRole] = useState("STAFF");

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
    } catch (err: any) {
      setActionError(err.message || "Failed to add category");
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
    } catch (err: any) {
      setActionError(err.message || "Failed to delete category");
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
    } catch (err: any) {
      setActionError(err.message || "Failed to add menu item");
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
    } catch (err: any) {
      setActionError(err.message || "Failed to delete item");
    }
  };

  // -- Pizza Configurations CRUD
  const handleAddPizzaOption = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    try {
      const payload: any = { name: optName };
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
    } catch (err: any) {
      setActionError(err.message || "Failed to add option");
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
    } catch (err: any) {
      setActionError(err.message || "Failed to delete option");
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
    } catch (err: any) {
      setActionError(err.message || "Failed to create user");
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
    } catch (err: any) {
      setActionError(err.message || "Failed to delete user");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className={styles.wrapper}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <TrendingUp className={styles.brandIcon} />
          <h2>Admin Control</h2>
        </div>

        <nav className={styles.nav}>
          <button
            onClick={() => { setActiveTab("analytics"); clearAlerts(); }}
            className={`${styles.navItem} ${activeTab === "analytics" ? styles.navActive : ""}`}
          >
            <PieChart size={18} />
            <span>Dashboard & Stats</span>
          </button>

          <button
            onClick={() => { setActiveTab("menu"); clearAlerts(); }}
            className={`${styles.navItem} ${activeTab === "menu" ? styles.navActive : ""}`}
          >
            <Grid size={18} />
            <span>Menu & Categories</span>
          </button>

          <button
            onClick={() => { setActiveTab("config"); clearAlerts(); }}
            className={`${styles.navItem} ${activeTab === "config" ? styles.navActive : ""}`}
          >
            <Settings size={18} />
            <span>Pizza Builder Config</span>
          </button>

          <button
            onClick={() => { setActiveTab("users"); clearAlerts(); }}
            className={`${styles.navItem} ${activeTab === "users" ? styles.navActive : ""}`}
          >
            <Users size={18} />
            <span>Staff & Accounts</span>
          </button>

          <button
            onClick={() => { setActiveTab("orders"); clearAlerts(); }}
            className={`${styles.navItem} ${activeTab === "orders" ? styles.navActive : ""}`}
          >
            <ShoppingBag size={18} />
            <span>Order History</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={() => router.push("/staff")} className="btn btn-secondary" style={{ width: "100%", justifyContent: "flex-start", marginBottom: "8px" }}>
            <span>Kitchen Dashboard</span>
          </button>
          <button onClick={handleLogout} className={`${styles.logoutBtn} btn btn-secondary`} style={{ width: "100%", justifyContent: "flex-start" }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className={styles.workspace}>
        {actionSuccess && (
          <div className={`${styles.alert} ${styles.alertSuccess} glass`}>
            <CheckCircle2 size={16} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className={`${styles.alert} ${styles.alertError} glass`}>
            <AlertCircle size={16} />
            <span>{actionError}</span>
          </div>
        )}

        {/* 1. TAB: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className={styles.tabContent}>
            <h1 className={styles.tabTitle}>Sales Analytics Overview</h1>
            <p className={styles.tabSubtitle}>Live statistics for your physical branch.</p>

            <div className={styles.kpiGrid}>
              <div className={`${styles.kpiCard} glass`}>
                <DollarSign className={styles.kpiIcon} style={{ color: "var(--success)" }} />
                <div className={styles.kpiInfo}>
                  <span>Total Sales</span>
                  <h3>${analytics.totalRevenue.toFixed(2)}</h3>
                </div>
              </div>

              <div className={`${styles.kpiCard} glass`}>
                <ShoppingBag className={styles.kpiIcon} style={{ color: "var(--primary)" }} />
                <div className={styles.kpiInfo}>
                  <span>Total Orders Placed</span>
                  <h3>{analytics.orderCount}</h3>
                </div>
              </div>

              <div className={`${styles.kpiCard} glass`}>
                <TrendingUp className={styles.kpiIcon} style={{ color: "var(--warning)" }} />
                <div className={styles.kpiInfo}>
                  <span>Average Ticket Value</span>
                  <h3>${analytics.avgOrderValue.toFixed(2)}</h3>
                </div>
              </div>

              <div className={`${styles.kpiCard} glass`}>
                <Calendar className={styles.kpiIcon} style={{ color: "#34c759" }} />
                <div className={styles.kpiInfo}>
                  <span>Today's Sales</span>
                  <h3>${analytics.todayRevenue.toFixed(2)}</h3>
                  <small style={{ color: "var(--foreground-secondary)" }}>{analytics.todayCount} orders</small>
                </div>
              </div>
            </div>

            <div className={styles.analyticsDetailGrid}>
              {/* Popular Items */}
              <div className={`${styles.panel} glass`}>
                <h3 className={styles.panelTitle}>Top 5 Menu Items</h3>
                <div className={styles.popularTable}>
                  {analytics.popularItems.map((item, index) => (
                    <div key={index} className={styles.popularRow}>
                      <span className={styles.rankNum}>#{index + 1}</span>
                      <span className={styles.rankName}>{item.name}</span>
                      <span className={styles.rankQty}>{item.qty} sold</span>
                      <strong className={styles.rankRevenue}>${item.revenue.toFixed(2)}</strong>
                    </div>
                  ))}
                  {analytics.popularItems.length === 0 && <p className={styles.noData}>No orders recorded yet.</p>}
                </div>
              </div>

              {/* Quick Info card */}
              <div className={`${styles.panel} glass-elevated`} style={{ borderLeft: "4px solid var(--primary)" }}>
                <h3 className={styles.panelTitle}>Branch Live Status</h3>
                <div className={styles.liveMeta}>
                  <p>Estimated prep calculation triggers automatically based on pending table orders.</p>
                  <ul>
                    <li>Base Prep: 15 minutes</li>
                    <li>Prep Time Increments: +5 minutes per cooking order in queue</li>
                  </ul>
                  <p style={{ marginTop: "16px" }}>Use this administration panel to edit catalog items, config prices, and manage crew credential access.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB: MENU & CATEGORIES CRUD */}
        {activeTab === "menu" && (
          <div className={styles.tabContent}>
            <h1 className={styles.tabTitle}>Catalog Management</h1>
            <p className={styles.tabSubtitle}>Manage your pizza categories and menu listings.</p>

            <div className={styles.editorSplit}>
              {/* Left Column: Category Control */}
              <div className={`${styles.panel} glass`}>
                <h3 className={styles.panelTitle}>Categories</h3>
                <form onSubmit={handleAddCategory} className={styles.editorForm}>
                  <div className={styles.formRow}>
                    <input type="text" placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} required className={styles.input} />
                    <input type="text" placeholder="Slug (lowercase)" value={newCatSlug} onChange={e => setNewCatSlug(e.target.value)} required className={styles.input} />
                  </div>
                  <input type="text" placeholder="Short description" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} className={styles.input} />
                  <input type="number" placeholder="Sort Order" value={newCatOrder} onChange={e => setNewCatOrder(e.target.value)} className={styles.input} />
                  <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                    <Plus size={16} />
                    <span>Create Category</span>
                  </button>
                </form>

                <div className={styles.listRows} style={{ marginTop: "24px" }}>
                  {categories.map((c) => (
                    <div key={c.id} className={styles.dataRow}>
                      <div>
                        <strong>{c.name}</strong> <span style={{ color: "var(--foreground-secondary)", fontSize: "12px" }}>/{c.slug}</span>
                        {c.description && <p style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}>{c.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteCategory(c.id)} className={styles.dangerIconBtn}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Menu Listing Control */}
              <div className={`${styles.panel} glass`}>
                <h3 className={styles.panelTitle}>Add Menu Listing</h3>
                <form onSubmit={handleAddMenuItem} className={styles.editorForm}>
                  <div className={styles.formRow}>
                    <input type="text" placeholder="Item Name" value={newItemName} onChange={e => setNewItemName(e.target.value)} required className={styles.input} />
                    <input type="text" placeholder="URL Slug" value={newItemSlug} onChange={e => setNewItemSlug(e.target.value)} required className={styles.input} />
                  </div>
                  <div className={styles.formRow}>
                    <input type="number" step="0.01" placeholder="Base Price ($)" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} required className={styles.input} />
                    <select value={newItemCat} onChange={e => setNewItemCat(e.target.value)} className={styles.input}>
                      <option value="">-- Choose Category --</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <input type="text" placeholder="Listing description ingredients" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className={styles.input} />
                  
                  <div className={styles.checkboxLabel}>
                    <input type="checkbox" id="isPizza" checked={newItemIsPizza} onChange={e => setNewItemIsPizza(e.target.checked)} />
                    <label htmlFor="isPizza">This is a custom Pizza (enable customization options)</label>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                    <Plus size={16} />
                    <span>Create Menu Listing</span>
                  </button>
                </form>

                <h3 className={styles.panelTitle} style={{ marginTop: "32px" }}>Active Menu Items</h3>
                <div className={styles.listRows}>
                  {menuItems.map((item) => (
                    <div key={item.id} className={styles.dataRow}>
                      <div>
                        <strong>{item.name}</strong> <span style={{ color: "var(--primary)", fontSize: "14px", marginLeft: "10px" }}>${item.basePrice.toFixed(2)}</span>
                        <p style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}>
                          Category: {categories.find((c) => c.id === item.categoryId)?.name || "Unknown"}
                          {item.isPizza && <strong style={{ color: "var(--warning)", marginLeft: "10px" }}>[PIZZA]</strong>}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteMenuItem(item.id)} className={styles.dangerIconBtn}>
                        <Trash2 size={16} />
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
          <div className={styles.tabContent}>
            <h1 className={styles.tabTitle}>Pizza Customizer Configuration</h1>
            <p className={styles.tabSubtitle}>Manage custom crusts, sizes, sauces, toppings, and add-ons pricing.</p>

            <div className={styles.editorSplit}>
              {/* Left Column: Form Editor */}
              <div className={`${styles.panel} glass`}>
                <h3 className={styles.panelTitle}>Add Pizza Customizer Factor</h3>
                <form onSubmit={handleAddPizzaOption} className={styles.editorForm}>
                  <div className={styles.formRow}>
                    <select value={optType} onChange={e => setOptType(e.target.value as any)} className={styles.input}>
                      <option value="size">Pizza Size</option>
                      <option value="crust">Pizza Crust</option>
                      <option value="sauce">Pizza Sauce</option>
                      <option value="topping">Pizza Topping</option>
                      <option value="addon">Add-on Item</option>
                    </select>
                    <input type="text" placeholder="Option Name (e.g. Garlic White)" value={optName} onChange={e => setOptName(e.target.value)} required className={styles.input} />
                  </div>

                  {optType === "size" ? (
                    <div className={styles.formRow}>
                      <input type="number" step="0.1" placeholder="Base Multiplier (e.g. 1.3)" value={optFactor} onChange={e => setOptFactor(e.target.value)} required className={styles.input} />
                      <input type="number" step="0.01" placeholder="Flat Price Addition ($)" value={optPrice} onChange={e => setOptPrice(e.target.value)} required className={styles.input} />
                    </div>
                  ) : (
                    <input type="number" step="0.01" placeholder="Flat Price ($)" value={optPrice} onChange={e => setOptPrice(e.target.value)} required className={styles.input} />
                  )}

                  {optType === "topping" && (
                    <div className={styles.formRow}>
                      <div className={styles.checkboxLabel}>
                        <input type="checkbox" id="isVeg" checked={optIsVeg} onChange={e => setOptIsVeg(e.target.checked)} />
                        <label htmlFor="isVeg">Vegetarian</label>
                      </div>
                      <div className={styles.checkboxLabel}>
                        <input type="checkbox" id="isVegan" checked={optIsVegan} onChange={e => setOptIsVegan(e.target.checked)} />
                        <label htmlFor="isVegan">Vegan</label>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                    <Plus size={16} />
                    <span>Create Custom Option</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Listing Options */}
              <div className={`${styles.panel} glass`}>
                <h3 className={styles.panelTitle}>Active Configs ({optType.toUpperCase()}S)</h3>
                
                <div className={styles.listRows}>
                  {optType === "size" && sizes.map((s) => (
                    <div key={s.id} className={styles.dataRow}>
                      <div>
                        <strong>{s.name}</strong>
                        <p style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}>
                          Multiplier: {s.priceFactor}x | Flat price add: +${s.priceAdd.toFixed(2)}
                        </p>
                      </div>
                      <button onClick={() => handleDeletePizzaOption("size", s.id)} className={styles.dangerIconBtn}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {optType === "crust" && crusts.map((c) => (
                    <div key={c.id} className={styles.dataRow}>
                      <div>
                        <strong>{c.name}</strong>
                        <p style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}>Price addition: +${c.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => handleDeletePizzaOption("crust", c.id)} className={styles.dangerIconBtn}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {optType === "sauce" && sauces.map((s) => (
                    <div key={s.id} className={styles.dataRow}>
                      <div>
                        <strong>{s.name}</strong>
                        <p style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}>Price addition: +${s.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => handleDeletePizzaOption("sauce", s.id)} className={styles.dangerIconBtn}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {optType === "topping" && toppings.map((t) => (
                    <div key={t.id} className={styles.dataRow}>
                      <div>
                        <strong>{t.name}</strong>
                        <p style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}>
                          Price: +${t.price.toFixed(2)}
                          {t.isVegetarian && <span style={{ color: "var(--success)", marginLeft: "8px" }}>[VEG]</span>}
                          {t.isVegan && <span style={{ color: "var(--success)", marginLeft: "4px" }}>[VEGAN]</span>}
                        </p>
                      </div>
                      <button onClick={() => handleDeletePizzaOption("topping", t.id)} className={styles.dangerIconBtn}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {optType === "addon" && addons.map((a) => (
                    <div key={a.id} className={styles.dataRow}>
                      <div>
                        <strong>{a.name}</strong>
                        <p style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}>Price: +${a.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => handleDeletePizzaOption("addon", a.id)} className={styles.dangerIconBtn}>
                        <Trash2 size={16} />
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
          <div className={styles.tabContent}>
            <h1 className={styles.tabTitle}>Staff & Account Settings</h1>
            <p className={styles.tabSubtitle}>Manage dashboard access user logins and roles.</p>

            <div className={styles.editorSplit}>
              {/* Left Column: Create user */}
              <div className={`${styles.panel} glass`}>
                <h3 className={styles.panelTitle}>Create Crew Account</h3>
                <form onSubmit={handleAddUser} className={styles.editorForm}>
                  <input type="text" placeholder="Real Name (e.g. John Doe)" value={newRealName} onChange={e => setNewRealName(e.target.value)} required className={styles.input} />
                  <input type="text" placeholder="Login Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} required className={styles.input} />
                  <input type="password" placeholder="Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className={styles.input} />
                  
                  <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className={styles.input}>
                    <option value="STAFF">STAFF (Kitchen Queue access)</option>
                    <option value="ADMIN">ADMIN (Full Panel access)</option>
                  </select>

                  <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                    <Plus size={16} />
                    <span>Create User</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Listing users */}
              <div className={`${styles.panel} glass`}>
                <h3 className={styles.panelTitle}>Registered System Users</h3>
                <div className={styles.listRows}>
                  {usersList.map((usr) => (
                    <div key={usr.id} className={styles.dataRow}>
                      <div>
                        <strong>{usr.name}</strong> <span style={{ color: "var(--foreground-secondary)", fontSize: "13px" }}>@{usr.username}</span>
                        <p style={{ fontSize: "12px", color: "var(--foreground-secondary)" }}>Role: <strong>{usr.role}</strong> | Created: {new Date(usr.createdAt).toLocaleDateString()}</p>
                      </div>
                      {user.id !== usr.id ? (
                        <button onClick={() => handleDeleteUser(usr.id)} className={styles.dangerIconBtn}>
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--success)" }}>Active Account</span>
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
          <div className={styles.tabContent}>
            <h1 className={styles.tabTitle}>Order Log History</h1>
            <p className={styles.tabSubtitle}>Review all historical transactions placed in-store.</p>

            <div className={`${styles.panel} glass`}>
              <div className={styles.historyList}>
                {orders.map((o) => (
                  <div key={o.id} className={styles.historyRow}>
                    <div className={styles.historyMeta}>
                      <span className={styles.historyToken}>Token #{o.orderNumber}</span>
                      <span className={styles.historyDate}>
                        {new Date(o.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className={styles.historyCustomer}>
                      <strong>Name:</strong> {o.customerName}
                      {o.customerPhone && <span style={{ marginLeft: "15px" }}><strong>Phone:</strong> {o.customerPhone}</span>}
                    </div>

                    <div className={styles.historySummaryText}>
                      <strong>Items:</strong>{" "}
                      {o.items?.map((item: any) => `${item.quantity}x ${item.menuItem.name}`).join(", ")}
                    </div>

                    <div className={styles.historyFooter}>
                      <span className={`${styles.statusBadge} ${
                        o.status === "COMPLETED" ? styles.badgeCompleted : o.status === "READY" ? styles.badgeReady : o.status === "PREPARING" ? styles.badgePreparing : styles.badgeReceived
                      }`}>
                        {o.status}
                      </span>
                      <strong className={styles.historyTotal}>${o.total.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className={styles.noData}>No orders recorded in database yet.</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
