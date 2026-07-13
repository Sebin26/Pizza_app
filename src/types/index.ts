export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  isPizza: boolean;
  isAvailable: boolean;
  categoryId: string;
}

export interface PizzaSize {
  id: string;
  name: string;
  priceFactor: number;
  priceAdd: number;
  displayOrder: number;
}

export interface PizzaCrust {
  id: string;
  name: string;
  price: number;
  displayOrder: number;
}

export interface PizzaSauce {
  id: string;
  name: string;
  price: number;
  displayOrder: number;
}

export interface PizzaTopping {
  id: string;
  name: string;
  price: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isAvailable: boolean;
}

export interface PizzaAddon {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface PizzaConfig {
  sizes: PizzaSize[];
  crusts: PizzaCrust[];
  sauces: PizzaSauce[];
  toppings: PizzaTopping[];
  addons: PizzaAddon[];
}

export interface CartCustomization {
  size: PizzaSize;
  crust: PizzaCrust;
  sauce: PizzaSauce;
  toppings: PizzaTopping[];
  addons: PizzaAddon[];
}

export interface CartItem {
  id: string; // Unique ID to distinguish cart lines (especially same pizza, different custom toppings)
  menuItem: MenuItem;
  quantity: number;
  customization?: CartCustomization;
  notes?: string;
  price: number; // Single item price including customization additions
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  status: "RECEIVED" | "PREPARING" | "READY" | "COMPLETED";
  estimatedPrepMin: number;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
  customization?: OrderItemCustomization | null;
}

export interface OrderItemCustomization {
  id: string;
  orderItemId: string;
  size?: PizzaSize | null;
  crust?: PizzaCrust | null;
  sauce?: PizzaSauce | null;
  toppings: { topping: PizzaTopping }[];
  addons: { addon: PizzaAddon }[];
}
