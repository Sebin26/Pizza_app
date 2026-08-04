/**
 * Real menu seed script for D Town Pizza.
 *
 * Run with: npx tsx prisma/seed-real-menu.ts
 *
 * This is a STANDALONE script, separate from prisma/seed.ts, so it never
 * touches Users/SystemConfig. It is idempotent (safe to re-run) - it uses
 * upsert-by-name everywhere, so running it twice won't create duplicates.
 *
 * ============================================================
 * ASSUMPTIONS MADE WHILE TRANSCRIBING THE MENU DOCUMENT
 * (please review these - they affect real prices)
 * ============================================================
 * 1. Sizes: replaced the old 3-size lineup entirely with the real menu's
 *    4 sizes: Small (8"), Medium (12"), Large (14"), X-Large (16").
 *    The old "X-Large (6\")" in the source doc's Crust table was clearly
 *    a typo and is treated as 16", matching every other size table.
 *
 * 2. Base "Pizza Sauce" is treated as INCLUDED FREE in every pizza's base
 *    price (price = $0 at every size), since the doc states "The base
 *    price of the pizza covers Crust, Pizza Sauce, and Mozzarella
 *    Cheese." All other sauces (Ancho, Barbecue, Butter, Donair, Honey
 *    Garlic, Pesto, Ranch, Sour Cream, and the No-Added-Sugar Pizza
 *    Sauce variant) use the listed sauce upcharge table. If "Pizza
 *    Sauce" was actually meant to also cost extra, change PIZZA_SAUCE_IS_FREE
 *    below to false.
 *
 * 3. Crust types (Regular, Traditional, Regular Thin) have NO price
 *    difference between them in the source doc - all seeded at $0 flat
 *    addon. The size-based pricing table under "Crust" in the doc is
 *    actually the base price of the "Build Your Own Pizza" item itself,
 *    not a per-crust-type charge.
 *
 * 4. Items listing two variants on one line (e.g. "Tandoori Paneer/
 *    Tandoori Chicken", "Butter Paneer, Butter Chicken") were split into
 *    two separate menu items, since they have different calorie counts
 *    and are clearly two distinct orderable pizzas.
 *
 * 5. Non-pizza items with size variants that DON'T match the pizza size
 *    lineup (e.g. bread "Regular 8\" / Large 12\"", wings "8pc / 12pc")
 *    are modeled as SEPARATE menu items per variant (not linked via
 *    MenuItemSizePrice, since that table is specifically for pizza-style
 *    sizing). Example: "Bacon Ranch Sticks (Regular)" and "Bacon Ranch
 *    Sticks (Large)" as two distinct catalog items.
 *
 * 6. Nachos' "Add Chicken/Beef" upcharge differs by Regular vs Large
 *    ($2.95 / $3.95) - the current PizzaAddon model doesn't support
 *    per-size addon pricing, so this was NOT modeled precisely. Nachos
 *    are seeded as plain items (Regular/Large) without the chicken/beef
 *    add-on for now - flagging as a manual follow-up if you want that
 *    upcharge implemented correctly (would need an AddonSizePrice table,
 *    same pattern as the other *SizePrice tables).
 *
 * 7. Combo deals (Celebration Combo, Party Combo) use MenuItemSizePrice
 *    against the same PizzaSize records even though they're not pizzas
 *    (isPizza: false) - this is a reuse of the sizing mechanism for
 *    "this combo has different prices at Medium/Large/X-Large" rather
 *    than building a separate concept. They intentionally have no Small
 *    price row, matching the source doc.
 *
 * 8. The document's opening "Pick up Special, 2 Topping Pizza" was
 *    seeded as its own item under a "Specials" category, sized Small/
 *    Medium/Large only (no X-Large listed in the doc for this item).
 * ============================================================
 */

import { PrismaClient, FulfillmentType } from "@prisma/client";

const prisma = new PrismaClient();

const PIZZA_SAUCE_IS_FREE = true;

// ---------- Sizes ----------
const SIZES = [
  { name: 'Small (8")', displayOrder: 0 },
  { name: 'Medium (12")', displayOrder: 1 },
  { name: 'Large (14")', displayOrder: 2 },
  { name: 'X-Large (16")', displayOrder: 3 },
];

// Old size names from the previous 3-tier lineup - attempted cleanup only,
// wrapped safely so it never crashes the script if they don't exist or
// are still referenced by old order data.
const OLD_SIZE_NAMES = ['Personal (8")', "Medium (12\")", 'Large (16")', "Personal", "Large"];
const OLD_MENU_ITEM_SLUGS = [
  "margherita-pizza", "pepperoni-feast", "garden-veggie-pizza",
  "bbq-chicken-supreme", "hawaiian-wave-pizza",
  "garlic-breadsticks", "cheesy-garlic-bread", "chicken-wings-8pcs", "french-fries",
  "coca-cola-can", "diet-coke-can", "sprite-can", "bottled-water",
  "chocolate-lava-cake", "cinnamon-pull-aparts", "ny-style-cheesecake-slice",
];
const OLD_ADDON_NAMES = [
  "Garlic Dipping Sauce", "Ranch Cup", "Marinara Dipping Sauce",
  "Red Pepper Flakes Packet", "Parmesan Cheese Packet",
];

// Only the ones that DIDN'T name-collide with real menu toppings (those got
// auto-updated in place by the real seed's upsert-by-name, no action needed)
const OLD_TOPPING_NAMES = [
  "Extra Mozzarella", "Feta Cheese", "Smoked Ham", "Crispy Bacon",
  "Jalapeños", "Sweet Pineapple", "Fresh Basil",
];

const OLD_SAUCE_NAMES = ["Classic Tomato", "Smoky BBQ", "Creamy White Garlic", "Spicy Buffalo"];
const OLD_CRUST_NAMES = ["Classic Hand-Tossed", "Thin & Crispy", "Deep Dish Pan", "Cheese-Stuffed Crust"];

// "sides" and "desserts" slugs are REUSED by the real menu's categories -
// those get updated in place, not deleted. Only these two are truly orphaned.
const OLD_CATEGORY_SLUGS = ["pizzas", "drinks"];

// ---------- Crusts (no price difference in source doc) ----------
const CRUSTS = ["Regular", "Traditional", "Regular Thin"];

// ---------- Sauces: name -> [Small, Medium, Large, XLarge] ----------
const SAUCE_PRICE_TABLE = [1.25, 1.95, 2.25, 2.45];
const SAUCES = [
  "Ancho",
  "Barbecue",
  "Butter",
  "Donair",
  "Honey Garlic",
  "Pizza Sauce",
  "Pesto",
  "Ranch",
  "Sour Cream",
  "Pizza Sauce (No Added Sugar)",
];

// ---------- Toppings ----------
const MEAT_TOPPING_PRICES = [1.95, 2.65, 3.45, 3.95];
const MEAT_TOPPINGS = [
  "Butter Chicken",
  "BBQ Chicken",
  "Grilled Chicken",
  "Honey Garlic Chicken",
  "Pesto Chicken",
  "Ranch Chicken",
  "Cajun Chicken",
  "Tandoori Chicken",
  "Shawarma Chicken",
  "Beef Steak",
  "Bacon",
  "Ham",
  "Italian Sausage",
  "Pepperoni",
  "Beef",
  "Spicy Italian Sausage",
];

const VEGGIE_TOPPING_PRICES = [1.95, 2.45, 2.95, 3.45];
const VEGGIE_TOPPINGS = [
  "Green Peppers",
  "Hot Banana Peppers",
  "Jalapeno Peppers",
  "Red Peppers",
  "Black Olives",
  "Mushrooms",
  "Pineapple",
  "Red Onions",
  "Dill Pickle",
  "Spinach",
  "Tomatoes",
  "Butter Paneer",
  "Paneer Tikka",
  "Spicy Paneer",
  "Basil Leaf",
];

// ---------- Categories ----------
const CATEGORIES = [
  { name: "Specials", slug: "specials", displayOrder: 0 },
  { name: "Create Your Own", slug: "create-your-own", displayOrder: 1 },
  { name: "Classic Pizzas", slug: "classic-pizzas", displayOrder: 2 },
  { name: "Traditional Pizzas", slug: "traditional-pizzas", displayOrder: 3 },
  { name: "Gourmet Pizzas", slug: "gourmet-pizzas", displayOrder: 4 },
  { name: "Combos & Specials", slug: "combos-specials", displayOrder: 5 },
  { name: "Bucket Fries", slug: "bucket-fries", displayOrder: 6 },
  { name: "Breads", slug: "breads", displayOrder: 7 },
  { name: "Sides", slug: "sides", displayOrder: 8 },
  { name: "Salads", slug: "salads", displayOrder: 9 },
  { name: "Desserts", slug: "desserts", displayOrder: 10 },
  { name: "Beverages", slug: "beverages", displayOrder: 11 },
];

// ---------- Specialty pizzas ----------
// Each category has ONE uniform price table across all its pizzas.
const CLASSIC_PRICES = [12.75, 17.95, 21.25, 24.25];
const TRADITIONAL_PRICES = [13.75, 18.95, 22.95, 25.95];
const GOURMET_PRICES = [14.75, 19.95, 23.95, 26.95];

interface PizzaDef {
  name: string;
  description: string;
  category: string;
  prices: number[];
}

const CLASSIC_PIZZAS: PizzaDef[] = [
  {
    name: "Double Cheese, Three Cheese",
    description:
      "Extra Extra Mozzarella Cheese, Pizza Sauce / Feta, Cheddar, Extra Mozzarella Cheese, Pizza Sauce, Sesame Seeds.",
    category: "classic-pizzas",
    prices: CLASSIC_PRICES,
  },
  {
    name: "Pepperoni Bacon Mushroom",
    description: "Pepperoni, Mushrooms, Bacon, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "classic-pizzas",
    prices: CLASSIC_PRICES,
  },
  {
    name: "Pepperoni",
    description: "Extra Pepperoni, Pizza Sauce & Double Mozzarella Cheese, Sesame Seeds.",
    category: "classic-pizzas",
    prices: CLASSIC_PRICES,
  },
  {
    name: "Hawaiian",
    description: "Ham, Pineapple, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "classic-pizzas",
    prices: CLASSIC_PRICES,
  },
  {
    name: "Beef & Bacon",
    description: "Beef, Red Onions, Bacon, Cheddar Cheese, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "classic-pizzas",
    prices: CLASSIC_PRICES,
  },
  {
    name: "Three Cheese Spinach",
    description: "Spinach, Feta Cheese, Cheddar Cheese, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "classic-pizzas",
    prices: CLASSIC_PRICES,
  },
];

const TRADITIONAL_PIZZAS: PizzaDef[] = [
  {
    name: "Cowboys Special Beef Steak",
    description: "Beef Steak, Red Onions, Green & Red Peppers, Ranch Sauce, Cheddar, Sesame Seeds & Mozzarella Cheese.",
    category: "traditional-pizzas",
    prices: TRADITIONAL_PRICES,
  },
  {
    name: "Honey Garlic Chicken",
    description: "Honey Garlic Sauce, Green Peppers, Pineapple, Honey Garlic Chicken, Sesame Seeds & Mozzarella Cheese.",
    category: "traditional-pizzas",
    prices: TRADITIONAL_PRICES,
  },
  {
    name: "Texas Rangers",
    description: "Pepperoni, Bacon, Mushrooms, Red Onions, Italian Sausage, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "traditional-pizzas",
    prices: TRADITIONAL_PRICES,
  },
  {
    name: "Texas Classic",
    description: "Pepperoni, Ham, Mushroom, Cheddar Cheese, Pizza Sauce and Mozzarella Cheese, Sesame Seeds.",
    category: "traditional-pizzas",
    prices: TRADITIONAL_PRICES,
  },
  {
    name: "Chicken Supreme",
    description: "Chicken, Mushrooms, Red Onions, Green Peppers, Pineapple, Pizza Sauce & Mozzarella Cheese, Sesame Seeds.",
    category: "traditional-pizzas",
    prices: TRADITIONAL_PRICES,
  },
  {
    name: "BBQ Chicken",
    description: "BBQ Sauce, BBQ Chicken, Red Onions, Green Peppers, Pizza Sauce & Mozzarella Cheese, Sesame Seeds.",
    category: "traditional-pizzas",
    prices: TRADITIONAL_PRICES,
  },
  {
    name: "Greek",
    description: "Feta Cheese, Black Olives, Tomatoes, Spinach, Red Onion, Pizza Sauce & Mozzarella Cheese, Sesame Seeds.",
    category: "traditional-pizzas",
    prices: TRADITIONAL_PRICES,
  },
];

const GOURMET_PIZZAS: PizzaDef[] = [
  {
    name: "Tandoori Chicken",
    description: "Tandoori Chicken, Red Onions, Green Peppers, Jalapenos, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Tandoori Paneer",
    description: "Tandoori Paneer, Red Onions, Green Peppers, Jalapenos, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Butter Chicken",
    description: "Butter Chicken, Red Onion, Butter Sauce, Green Peppers, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Butter Paneer",
    description: "Butter Paneer, Red Onion, Butter Sauce, Green Peppers, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Ginger, Garlic & Cilantro",
    description:
      "Ginger, Green Peppers, Red Onions, Tomatoes, Cilantro, Jalapenos, Black Olives, Basil, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "All Meat Loaded",
    description: "Ham, Pepperoni, Italian Sausage, Spicy Italian Sausage, Beef, Bacon, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Chicken Bacon Ranch",
    description: "Ranch Chicken, Bacon, Green Peppers, Tomatoes, Ranch Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Pesto Chicken",
    description:
      "Pesto Chicken, Green Peppers, Red Onions, Tomatoes, Red Peppers, Pesto Sauce, Cheddar Cheese, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Spicy Paneer",
    description:
      "Spicy Cottage Cheese, Red Onion, Cilantro, Green Peppers, Tomatoes, Jalapenos, Ancho Chipotle Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Cilantro Chilli Chicken",
    description: "Cajun Chicken, Cilantro, Red Onion, Green Peppers, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Texas Veggie Fans",
    description:
      "Mushrooms, Onions, Green Peppers, Black Olives, Tomatoes, Banana Peppers, Cheddar Cheese, Pizza Sauce, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
  {
    name: "Shawarma Pizza",
    description: "Shawarma Chicken, Tomato, Red Onion, Jalapeno, Garlic Sauce, Garlic Sauce Drizzle, Sesame Seeds & Mozzarella Cheese.",
    category: "gourmet-pizzas",
    prices: GOURMET_PRICES,
  },
];

async function main() {
  console.log("Seeding real D Town Pizza menu...\n");

if (process.env.ALLOW_ORDER_WIPE === "true") {
  await prisma.orderItemTopping.deleteMany();
  await prisma.orderItemAddon.deleteMany();
  await prisma.orderItemCustomization.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  console.log("Cleared test order data.\n");
} else {
  console.log("Skipped order wipe (set ALLOW_ORDER_WIPE=true to enable locally).\n");
}


  // ---------- Categories ----------
  const categoryMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, displayOrder: c.displayOrder },
      create: { name: c.name, slug: c.slug, displayOrder: c.displayOrder },
    });
    categoryMap.set(c.slug, cat.id);
  }
  console.log(`Categories: ${CATEGORIES.length} upserted.`);

  // ---------- Sizes ----------
  const sizeMap = new Map<string, string>();
  for (const s of SIZES) {
    const size = await prisma.pizzaSize.upsert({
      where: { name: s.name },
      update: { displayOrder: s.displayOrder },
      create: { name: s.name, priceFactor: 1.0, priceAdd: 0.0, displayOrder: s.displayOrder },
    });
    sizeMap.set(s.name, size.id);
  }
  console.log(`Sizes: ${SIZES.length} upserted (Small/Medium/Large/X-Large).`);

  // Best-effort cleanup of the old 3-size lineup. Wrapped safely - if an
  // old size is still referenced by existing order data, deletion will
  // fail and we just warn instead of crashing the whole seed.
  for (const oldName of OLD_SIZE_NAMES) {
    try {
      const existing = await prisma.pizzaSize.findUnique({ where: { name: oldName } });
      if (existing && !Array.from(sizeMap.values()).includes(existing.id)) {
        await prisma.pizzaSize.delete({ where: { id: existing.id } });
        console.log(`  Removed old size: "${oldName}"`);
      }
    } catch {
      console.warn(
        `  Could not remove old size "${oldName}" (likely still referenced by existing orders) - leaving it in place, please review manually.`
      );
    }
  }

  const [smallId, mediumId, largeId, xlargeId] = SIZES.map((s) => sizeMap.get(s.name)!);

  // ---------- Crusts ----------
  for (const name of CRUSTS) {
    await prisma.pizzaCrust.upsert({
      where: { name },
      update: { price: 0 },
      create: { name, price: 0, displayOrder: CRUSTS.indexOf(name) },
    });
  }
  console.log(`Crusts: ${CRUSTS.length} upserted (no price difference).`);

  // ---------- Sauces ----------
  for (const name of SAUCES) {
    const sauce = await prisma.pizzaSauce.upsert({
      where: { name },
      update: {},
      create: { name, price: 0, displayOrder: SAUCES.indexOf(name) },
    });

    const isFreeBase = PIZZA_SAUCE_IS_FREE && name === "Pizza Sauce";
    const prices = isFreeBase ? [0, 0, 0, 0] : SAUCE_PRICE_TABLE;

    for (let i = 0; i < SIZES.length; i++) {
      const sizeId = sizeMap.get(SIZES[i].name)!;
      await prisma.sauceSizePrice.upsert({
        where: { sauceId_sizeId: { sauceId: sauce.id, sizeId } },
        update: { price: prices[i] },
        create: { sauceId: sauce.id, sizeId, price: prices[i] },
      });
    }
  }
  console.log(`Sauces: ${SAUCES.length} upserted with per-size pricing ("Pizza Sauce" seeded as free/included).`);

  // ---------- Toppings ----------
  async function seedToppings(names: string[], prices: number[], isVegetarian: boolean) {
    for (const name of names) {
      const topping = await prisma.pizzaTopping.upsert({
        where: { name },
        update: { isVegetarian },
        create: { name, price: 0, isVegetarian, isVegan: false, isAvailable: true },
      });
      for (let i = 0; i < SIZES.length; i++) {
        const sizeId = sizeMap.get(SIZES[i].name)!;
        await prisma.toppingSizePrice.upsert({
          where: { toppingId_sizeId: { toppingId: topping.id, sizeId } },
          update: { price: prices[i] },
          create: { toppingId: topping.id, sizeId, price: prices[i] },
        });
      }
    }
  }
  await seedToppings(MEAT_TOPPINGS, MEAT_TOPPING_PRICES, false);
  await seedToppings(VEGGIE_TOPPINGS, VEGGIE_TOPPING_PRICES, true);
  console.log(`Toppings: ${MEAT_TOPPINGS.length} meat + ${VEGGIE_TOPPINGS.length} veggie, with per-size pricing.`);

  // ---------- Helper: create/update a pizza-style MenuItem with per-size pricing ----------
  async function upsertSizedItem(opts: {
    name: string;
    description: string;
    categorySlug: string;
    isPizza: boolean;
    slugSuffix?: string;
    sizePrices: { sizeId: string; price: number }[];
    availableFor?: FulfillmentType[]; // defaults to all three if omitted
  }) {
    const slug =
      opts.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + (opts.slugSuffix ? `-${opts.slugSuffix}` : "");
    const basePrice = opts.sizePrices[0]?.price ?? 0;
    const availableFor = opts.availableFor ?? ["DINE_IN", "PICKUP", "DELIVERY"];

    const item = await prisma.menuItem.upsert({
      where: { slug },
      update: {
        name: opts.name,
        description: opts.description,
        basePrice,
        isPizza: opts.isPizza,
        categoryId: categoryMap.get(opts.categorySlug)!,
        availableFor, // <-- add
     },
      create: {
        name: opts.name,
        slug,
        description: opts.description,
        basePrice,
        isPizza: opts.isPizza,
        isAvailable: true,
        categoryId: categoryMap.get(opts.categorySlug)!,
        availableFor, // <-- add
     },
  });

    for (const sp of opts.sizePrices) {
      await prisma.menuItemSizePrice.upsert({
        where: { menuItemId_sizeId: { menuItemId: item.id, sizeId: sp.sizeId } },
        update: { price: sp.price },
        create: { menuItemId: item.id, sizeId: sp.sizeId, price: sp.price },
      });
    }
    return item;
  }

  // ---------- Specialty pizzas ----------
  const allPizzas = [...CLASSIC_PIZZAS, ...TRADITIONAL_PIZZAS, ...GOURMET_PIZZAS];
  for (const p of allPizzas) {
    await upsertSizedItem({
      name: p.name,
      description: p.description,
      categorySlug: p.category,
      isPizza: true,
      sizePrices: [
        { sizeId: smallId, price: p.prices[0] },
        { sizeId: mediumId, price: p.prices[1] },
        { sizeId: largeId, price: p.prices[2] },
        { sizeId: xlargeId, price: p.prices[3] },
      ],
    });
  }
  console.log(`Specialty pizzas: ${allPizzas.length} upserted (Classic/Traditional/Gourmet).`);

  // ---------- Build Your Own Pizza (base = Create Your Own crust pricing) ----------
  await upsertSizedItem({
    name: "Build Your Own Pizza",
    description: "Choose your crust, sauce, and toppings. Base price includes crust, pizza sauce, and mozzarella cheese.",
    categorySlug: "create-your-own",
    isPizza: true,
    sizePrices: [
      { sizeId: smallId, price: 7.95 },
      { sizeId: mediumId, price: 12.95 },
      { sizeId: largeId, price: 15.95 },
      { sizeId: xlargeId, price: 18.95 },
    ],
  });

  // ---------- Pick Up Special (2-topping pizza, no X-Large per source doc) ----------
  await upsertSizedItem({
    name: "Pick Up Special - 2 Topping Pizza",
    description: "Any two toppings from our toppings list. Extra charge for additional toppings.",
    categorySlug: "specials",
    isPizza: true,
    sizePrices: [
      { sizeId: smallId, price: 8.95 },
      { sizeId: mediumId, price: 12.95 },
      { sizeId: largeId, price: 15.95 },
    ],
    availableFor: ["PICKUP"],
  });

  // ---------- Combos ----------
  await upsertSizedItem({
    name: "D-Town Everyday Special",
    description:
      "One Medium Gourmet, Traditional, or Classic pizza, 10 Wings, one regular Cheese Stick, and 2L drinks. Upgrade to Large pizza for an extra $5.",
    categorySlug: "combos-specials",
    isPizza: false,
    sizePrices: [
      { sizeId: mediumId, price: 35.95 },
      { sizeId: largeId, price: 40.95 },
    ],
  });

  await upsertSizedItem({
    name: "Celebration Combo",
    description: "Three any Classic, Traditional, or Gourmet Pizza, 4 Dipping Sauces, 2L Drink.",
    categorySlug: "combos-specials",
    isPizza: false,
    sizePrices: [
      { sizeId: mediumId, price: 49.95 },
      { sizeId: largeId, price: 59.95 },
      { sizeId: xlargeId, price: 69.95 },
    ],
  });

  await upsertSizedItem({
    name: "Party Combo",
    description:
      "2 Pizzas (4 Toppings Each), 2 lbs of Wings, 1 Regular Garlic Bread, Regular Bucket Fries, 2 Dipping Sauces, and 4 Cans of Pop.",
    categorySlug: "combos-specials",
    isPizza: false,
    sizePrices: [
      { sizeId: mediumId, price: 52.95 },
      { sizeId: largeId, price: 59.95 },
      { sizeId: xlargeId, price: 65.95 },
    ],
  });
  console.log("Combos: 3 upserted.");

  // ---------- Bucket Fries (Medium/Large only) ----------
  const bucketFries: { name: string; description: string; medium: number; large: number }[] = [
    {
      name: "Regular Bucket Fries",
      description: "Our classic crispy seasoned fries.",
      medium: 5.95,
      large: 8.95,
    },
    {
      name: "Loaded Veggie Fries",
      description: "Crispy fries, cheese, parmesan cheese, red onion, green onion, jalapeno, minced garlic & cilantro.",
      medium: 9.95,
      large: 15.95,
    },
    {
      name: "Loaded Bacon Cheese Fries",
      description: "Crispy fries, cheese, red onion, bacon, green onion.",
      medium: 9.95,
      large: 15.95,
    },
    {
      name: "Garlic Parmesan Fries",
      description: "Crispy fries, cheese, parmesan cheese, minced garlic, green onion.",
      medium: 9.95,
      large: 14.95,
    },
    {
      name: "Loaded Butter Chicken Fries",
      description: "Crispy fries, cheese, butter chicken, red onion, green onion, cilantro.",
      medium: 9.95,
      large: 14.95,
    },
  ];
  for (const f of bucketFries) {
    await upsertSizedItem({
      name: f.name,
      description: f.description,
      categorySlug: "bucket-fries",
      isPizza: false,
      sizePrices: [
        { sizeId: mediumId, price: f.medium },
        { sizeId: largeId, price: f.large },
      ],
    });
  }
  console.log(`Bucket Fries: ${bucketFries.length} upserted.`);

  // ---------- Breads (non-pizza sizing: Regular/Large as separate items) ----------
  const breads = [
    { name: "Bacon Ranch Sticks", regular: 7.95, large: 10.95, desc: "670 cals." },
    { name: "Garlic Bread Sticks", regular: 5.95, large: 8.95, desc: "510 cals." },
    { name: "Garlic Cheese Sticks", regular: 6.95, large: 9.95, desc: "570 cals." },
  ];
  for (const b of breads) {
    await upsertSizedItem({
      name: `${b.name} (Regular 8")`,
      description: b.desc,
      categorySlug: "breads",
      isPizza: false,
      slugSuffix: "regular",
      sizePrices: [{ sizeId: smallId, price: b.regular }],
    });
    await upsertSizedItem({
      name: `${b.name} (Large 12")`,
      description: b.desc,
      categorySlug: "breads",
      isPizza: false,
      slugSuffix: "large",
      sizePrices: [{ sizeId: largeId, price: b.large }],
    });
  }
  console.log(`Breads: ${breads.length * 2} items upserted (Regular + Large variants).`);

  // ---------- Sides ----------
  await upsertSizedItem({
    name: "Boneless Chicken Bites (8 pcs)",
    description: "230-330 cals per 3 pcs.",
    categorySlug: "sides",
    isPizza: false,
    slugSuffix: "8pc",
    sizePrices: [{ sizeId: smallId, price: 11.95 }],
  });
  await upsertSizedItem({
    name: "Boneless Chicken Bites (12 pcs)",
    description: "230-330 cals per 3 pcs.",
    categorySlug: "sides",
    isPizza: false,
    slugSuffix: "12pc",
    sizePrices: [{ sizeId: mediumId, price: 15.95 }],
  });
  await upsertSizedItem({
    name: "Chicken Wings (8 pcs)",
    description: "270-370 cals per 3 pcs. Classic or Breaded style.",
    categorySlug: "sides",
    isPizza: false,
    slugSuffix: "8pc",
    sizePrices: [{ sizeId: smallId, price: 11.95 }],
  });
  await upsertSizedItem({
    name: "Chicken Wings (12 pcs)",
    description: "270-370 cals per 3 pcs. Classic or Breaded style.",
    categorySlug: "sides",
    isPizza: false,
    slugSuffix: "12pc",
    sizePrices: [{ sizeId: mediumId, price: 16.95 }],
  });
  await upsertSizedItem({
    name: "Nachos",
    description: "400 cals per 1/5 package. (Add Chicken/Beef upcharge not yet modeled - see script notes.)",
    categorySlug: "sides",
    isPizza: false,
    slugSuffix: "regular",
    sizePrices: [{ sizeId: smallId, price: 12.95 }],
  });
  await upsertSizedItem({
    name: "Nachos (Large)",
    description: "400 cals per 1/5 package. (Add Chicken/Beef upcharge not yet modeled - see script notes.)",
    categorySlug: "sides",
    isPizza: false,
    slugSuffix: "large",
    sizePrices: [{ sizeId: largeId, price: 15.95 }],
  });
  console.log("Sides: 6 items upserted.");

  // ---------- Salads ----------
  await upsertSizedItem({
    name: "Caesar Salad (Regular)",
    description: "Classic Caesar salad.",
    categorySlug: "salads",
    isPizza: false,
    slugSuffix: "regular",
    sizePrices: [{ sizeId: smallId, price: 7.95 }],
  });
  await upsertSizedItem({
    name: "Caesar Salad (Large)",
    description: "Classic Caesar salad.",
    categorySlug: "salads",
    isPizza: false,
    slugSuffix: "large",
    sizePrices: [{ sizeId: largeId, price: 10.95 }],
  });
  await upsertSizedItem({
    name: "Greek Salad (Regular)",
    description: "Classic Greek salad.",
    categorySlug: "salads",
    isPizza: false,
    slugSuffix: "regular",
    sizePrices: [{ sizeId: smallId, price: 7.95 }],
  });
  await upsertSizedItem({
    name: "Greek Salad (Large)",
    description: "Classic Greek salad.",
    categorySlug: "salads",
    isPizza: false,
    slugSuffix: "large",
    sizePrices: [{ sizeId: largeId, price: 10.95 }],
  });
  console.log("Salads: 4 items upserted.");

  // ---------- Desserts (flat $5.95 each, no size) ----------
  const desserts = [
    { name: "Chocolate Lava", desc: "530 cals." },
    { name: "Cookies N' Cream", desc: "730 cals." },
    { name: "So Good Chocolate", desc: "860 cals." },
    { name: "Tiramisu Cheesecake", desc: "570 cals." },
  ];
  for (const d of desserts) {
    const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.menuItem.upsert({
      where: { slug },
      update: {
        name: d.name,
        description: d.desc,
        basePrice: 5.95,
        isPizza: false,
        categoryId: categoryMap.get("desserts")!,
      },
      create: {
        name: d.name,
        slug,
        description: d.desc,
        basePrice: 5.95,
        isPizza: false,
        isAvailable: true,
        categoryId: categoryMap.get("desserts")!,
      },
    });
  }
  console.log(`Desserts: ${desserts.length} upserted (flat $5.95 each).`);

  // ---------- Beverages ----------
  const beverages = [
    { name: "Pop - Can", desc: "Coke, Diet Coke, Zero Coke, Sprite, Fanta, A&W Root Beer. 0-180 cals.", price: 1.75 },
    { name: "Pop - 2L Bottle", desc: "Coke, Diet Coke, Zero Coke, Sprite, Fanta, A&W Root Beer.", price: 4.45 },
    { name: "Dasani Water (591ml)", desc: "", price: 2.45 },
  ];
  for (const b of beverages) {
    const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.menuItem.upsert({
      where: { slug },
      update: {
        name: b.name,
        description: b.desc,
        basePrice: b.price,
        isPizza: false,
        categoryId: categoryMap.get("beverages")!,
      },
      create: {
        name: b.name,
        slug,
        description: b.desc,
        basePrice: b.price,
        isPizza: false,
        isAvailable: true,
        categoryId: categoryMap.get("beverages")!,
      },
    });
  }
  console.log(`Beverages: ${beverages.length} upserted.`);



  // ---------- Cleanup: remove old placeholder data by name ----------
  console.log("\nCleaning up old placeholder data...");

  for (const slug of OLD_MENU_ITEM_SLUGS) {
    const existing = await prisma.menuItem.findUnique({ where: { slug } });
    if (existing) {
      await prisma.menuItem.delete({ where: { id: existing.id } });
      console.log(`  Removed old menu item: "${existing.name}"`);
    }
  }

  for (const name of OLD_TOPPING_NAMES) {
    const existing = await prisma.pizzaTopping.findUnique({ where: { name } });
    if (existing) {
      await prisma.pizzaTopping.delete({ where: { id: existing.id } });
      console.log(`  Removed old topping: "${name}"`);
    }
  }

  for (const name of OLD_ADDON_NAMES) {
    const existing = await prisma.pizzaAddon.findUnique({ where: { name } });
    if (existing) {
      await prisma.pizzaAddon.delete({ where: { id: existing.id } });
      console.log(`  Removed old addon: "${name}"`);
    }
  }

  for (const name of OLD_SAUCE_NAMES) {
    try {
      const existing = await prisma.pizzaSauce.findUnique({ where: { name } });
      if (existing) {
        await prisma.pizzaSauce.delete({ where: { id: existing.id } });
        console.log(`  Removed old sauce: "${name}"`);
      }
    } catch {
      console.warn(`  Could not remove old sauce "${name}" (referenced by existing orders) - leaving in place, please review manually.`);
    }
  }

  for (const name of OLD_CRUST_NAMES) {
    try {
      const existing = await prisma.pizzaCrust.findUnique({ where: { name } });
      if (existing) {
        await prisma.pizzaCrust.delete({ where: { id: existing.id } });
        console.log(`  Removed old crust: "${name}"`);
      }
    } catch {
      console.warn(`  Could not remove old crust "${name}" (referenced by existing orders) - leaving in place, please review manually.`);
    }
  }

  // Categories: only delete if now empty (their items were just cleaned up above)
  for (const slug of OLD_CATEGORY_SLUGS) {
    try {
      const cat = await prisma.category.findUnique({ where: { slug }, include: { items: true } });
      if (cat && cat.items.length === 0) {
        await prisma.category.delete({ where: { id: cat.id } });
        console.log(`  Removed old category: "${cat.name}"`);
      } else if (cat) {
        console.warn(`  Category "${cat.name}" still has ${cat.items.length} item(s) - not removed.`);
      }
    } catch (e) {
      console.warn(`  Skipped cleanup for category slug "${slug}":`, e);
    }
  }
  console.log("\n✅ Real menu seed complete.");
  console.log("⚠️  Please review the ASSUMPTIONS block at the top of this file -");
  console.log("   several ambiguous pricing decisions were made and flagged there.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
