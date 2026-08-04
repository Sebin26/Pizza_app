export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  items?: MenuItem[];
}

export interface SizePrice {
  sizeId: string;
  price: number;
  size?: PizzaSize;
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
  availableFor: ("DINE_IN" | "PICKUP" | "DELIVERY")[];
  /** Per-size prices from MenuItemSizePrice; present when fetched with sizePrices include */
  sizePrices?: SizePrice[];
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
  /** Per-size prices from SauceSizePrice; present when fetched with sizePrices include */
  sizePrices?: SizePrice[];
}

export interface PizzaTopping {
  id: string;
  name: string;
  price: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isAvailable: boolean;
  /** Per-size prices from ToppingSizePrice; present when fetched with sizePrices include */
  sizePrices?: SizePrice[];
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
  crust?: PizzaCrust;
  sauce?: PizzaSauce;
  toppings?: PizzaTopping[];
  addons?: PizzaAddon[];
}

export interface CartItem {
  id: string; // Unique ID to distinguish cart lines (especially same pizza, different custom toppings)
  menuItem: MenuItem;
  quantity: number;
  customization?: CartCustomization;
  notes?: string;
  price: number; // Single item price including customization additions
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType?: string | null;
  isActive?: boolean;
  isAvailable?: boolean;
}

export interface Delivery {
  id: string;
  orderId: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postcode?: string | null;
  landmark?: string | null;
  instructions?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  assignedDriverId?: string | null;
  driverId?: string | null;
  driver?: Driver | null;
  assignedAt?: string | null;
  departedAt?: string | null;
  deliveredAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  completedAt?: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  fulfillmentType: "DINE_IN" | "PICKUP" | "DELIVERY";
  status:
    | "RECEIVED"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED";
  estimatedPrepMin: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  delivery?: Delivery | null;
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
