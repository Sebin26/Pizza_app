import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data
  await prisma.orderItemTopping.deleteMany();
  await prisma.orderItemAddon.deleteMany();
  await prisma.orderItemCustomization.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.pizzaSize.deleteMany();
  await prisma.pizzaCrust.deleteMany();
  await prisma.pizzaSauce.deleteMany();
  await prisma.pizzaTopping.deleteMany();
  await prisma.pizzaAddon.deleteMany();
  await prisma.systemConfig.deleteMany();

  // 2. Seed Users (Staff & Admin)
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const staffPasswordHash = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: adminPasswordHash,
      name: "Admin Manager",
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.create({
    data: {
      username: "staff",
      passwordHash: staffPasswordHash,
      name: "Kitchen Cook",
      role: "STAFF",
    },
  });

  console.log("Users seeded:", { admin: admin.username, staff: staff.username });

  // 3. Seed Pizza Sizes
  const sizePersonal = await prisma.pizzaSize.create({
    data: { name: "Personal (8\")", priceFactor: 1.0, priceAdd: 0.0, displayOrder: 1 },
  });
  const sizeMedium = await prisma.pizzaSize.create({
    data: { name: "Medium (12\")", priceFactor: 1.3, priceAdd: 2.0, displayOrder: 2 },
  });
  const sizeLarge = await prisma.pizzaSize.create({
    data: { name: "Large (16\")", priceFactor: 1.6, priceAdd: 4.0, displayOrder: 3 },
  });

  console.log("Pizza sizes seeded.");

  // 4. Seed Pizza Crusts
  const crustHand = await prisma.pizzaCrust.create({
    data: { name: "Classic Hand-Tossed", price: 0.0, displayOrder: 1 },
  });
  const crustThin = await prisma.pizzaCrust.create({
    data: { name: "Thin & Crispy", price: 0.0, displayOrder: 2 },
  });
  const crustPan = await prisma.pizzaCrust.create({
    data: { name: "Deep Dish Pan", price: 1.50, displayOrder: 3 },
  });
  const crustStuffed = await prisma.pizzaCrust.create({
    data: { name: "Cheese-Stuffed Crust", price: 3.00, displayOrder: 4 },
  });

  console.log("Pizza crusts seeded.");

  // 5. Seed Pizza Sauces
  const sauceTomato = await prisma.pizzaSauce.create({
    data: { name: "Classic Tomato", price: 0.0, displayOrder: 1 },
  });
  const sauceBBQ = await prisma.pizzaSauce.create({
    data: { name: "Smoky BBQ", price: 0.50, displayOrder: 2 },
  });
  const sauceWhite = await prisma.pizzaSauce.create({
    data: { name: "Creamy White Garlic", price: 0.50, displayOrder: 3 },
  });
  const sauceBuffalo = await prisma.pizzaSauce.create({
    data: { name: "Spicy Buffalo", price: 0.50, displayOrder: 4 },
  });

  console.log("Pizza sauces seeded.");

  // 6. Seed Toppings
  const toppingsData = [
    { name: "Extra Mozzarella", price: 1.50, isVegetarian: true, isVegan: false },
    { name: "Feta Cheese", price: 1.25, isVegetarian: true, isVegan: false },
    { name: "Pepperoni", price: 1.25, isVegetarian: false, isVegan: false },
    { name: "Italian Sausage", price: 1.50, isVegetarian: false, isVegan: false },
    { name: "Grilled Chicken", price: 1.50, isVegetarian: false, isVegan: false },
    { name: "Smoked Ham", price: 1.25, isVegetarian: false, isVegan: false },
    { name: "Crispy Bacon", price: 1.50, isVegetarian: false, isVegan: false },
    { name: "Mushrooms", price: 0.75, isVegetarian: true, isVegan: true },
    { name: "Green Peppers", price: 0.75, isVegetarian: true, isVegan: true },
    { name: "Red Onions", price: 0.75, isVegetarian: true, isVegan: true },
    { name: "Black Olives", price: 0.75, isVegetarian: true, isVegan: true },
    { name: "Jalapeños", price: 0.75, isVegetarian: true, isVegan: true },
    { name: "Sweet Pineapple", price: 1.00, isVegetarian: true, isVegan: true },
    { name: "Fresh Basil", price: 0.50, isVegetarian: true, isVegan: true },
  ];

  for (const t of toppingsData) {
    await prisma.pizzaTopping.create({ data: t });
  }

  console.log("Pizza toppings seeded.");

  // 7. Seed Add-ons
  const addonsData = [
    { name: "Garlic Dipping Sauce", price: 0.75 },
    { name: "Ranch Cup", price: 0.75 },
    { name: "Marinara Dipping Sauce", price: 0.75 },
    { name: "Red Pepper Flakes Packet", price: 0.00 },
    { name: "Parmesan Cheese Packet", price: 0.00 },
  ];

  for (const a of addonsData) {
    await prisma.pizzaAddon.create({ data: a });
  }

  console.log("Pizza add-ons seeded.");

  // 8. Seed Categories
  const catPizzas = await prisma.category.create({
    data: { name: "Pizzas", slug: "pizzas", description: "Our gourmet freshly-baked pizzas.", displayOrder: 1 },
  });
  const catSides = await prisma.category.create({
    data: { name: "Sides", slug: "sides", description: "Appetizers, sides, and snacks.", displayOrder: 2 },
  });
  const catDrinks = await prisma.category.create({
    data: { name: "Drinks", slug: "drinks", description: "Cold beverages and soft drinks.", displayOrder: 3 },
  });
  const catDesserts = await prisma.category.create({
    data: { name: "Desserts", slug: "desserts", description: "Sweet treats to finish your meal.", displayOrder: 4 },
  });

  console.log("Categories seeded.");

  // 9. Seed Menu Items
  // -- Pizzas
  await prisma.menuItem.create({
    data: {
      name: "Margherita Pizza",
      slug: "margherita-pizza",
      description: "Classic tomato sauce, fresh mozzarella, fresh basil, and extra virgin olive oil.",
      basePrice: 9.99,
      isPizza: true,
      categoryId: catPizzas.id,
      imageUrl: "margherita_pizza",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Pepperoni Feast",
      slug: "pepperoni-feast",
      description: "Loaded with double pepperoni, classic tomato sauce, and mozzarella cheese.",
      basePrice: 11.99,
      isPizza: true,
      categoryId: catPizzas.id,
      imageUrl: "pepperoni_feast",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Garden Veggie Pizza",
      slug: "garden-veggie-pizza",
      description: "Mushrooms, green peppers, red onions, black olives, and sweet corn on tomato sauce.",
      basePrice: 10.99,
      isPizza: true,
      categoryId: catPizzas.id,
      imageUrl: "garden_veggie",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "BBQ Chicken Supreme",
      slug: "bbq-chicken-supreme",
      description: "Smoky BBQ sauce, grilled chicken, red onions, and mozzarella cheese.",
      basePrice: 12.99,
      isPizza: true,
      categoryId: catPizzas.id,
      imageUrl: "bbq_chicken_supreme",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Hawaiian Wave Pizza",
      slug: "hawaiian-wave-pizza",
      description: "Classic tomato sauce, smoked ham, sweet pineapple, and mozzarella cheese.",
      basePrice: 11.99,
      isPizza: true,
      categoryId: catPizzas.id,
      imageUrl: "hawaiian_wave",
    },
  });

  // -- Sides
  await prisma.menuItem.create({
    data: {
      name: "Garlic Breadsticks",
      slug: "garlic-breadsticks",
      description: "Baked fresh with garlic butter and herbs, served with marinara dipping sauce.",
      basePrice: 4.99,
      isPizza: false,
      categoryId: catSides.id,
      imageUrl: "garlic_breadsticks",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Cheesy Garlic Bread",
      slug: "cheesy-garlic-bread",
      description: "Freshly baked bread topped with garlic butter and melted mozzarella cheese.",
      basePrice: 5.99,
      isPizza: false,
      categoryId: catSides.id,
      imageUrl: "cheesy_garlic_bread",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Chicken Wings (8pcs)",
      slug: "chicken-wings-8pcs",
      description: "Oven-baked chicken wings tossed in BBQ or Buffalo sauce.",
      basePrice: 8.99,
      isPizza: false,
      categoryId: catSides.id,
      imageUrl: "chicken_wings",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "French Fries",
      slug: "french-fries",
      description: "Crispy, golden potato fries lightly salted.",
      basePrice: 3.49,
      isPizza: false,
      categoryId: catSides.id,
      imageUrl: "french_fries",
    },
  });

  // -- Drinks
  await prisma.menuItem.create({
    data: {
      name: "Coca-Cola (Can)",
      slug: "coca-cola-can",
      description: "Refreshing 330ml can of Coca-Cola Original.",
      basePrice: 1.99,
      isPizza: false,
      categoryId: catDrinks.id,
      imageUrl: "coca_cola_can",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Diet Coke (Can)",
      slug: "diet-coke-can",
      description: "Refreshing 330ml can of sugar-free Diet Coke.",
      basePrice: 1.99,
      isPizza: false,
      categoryId: catDrinks.id,
      imageUrl: "diet_coke_can",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Sprite (Can)",
      slug: "sprite-can",
      description: "Refreshing 330ml can of lemon-lime Sprite.",
      basePrice: 1.99,
      isPizza: false,
      categoryId: catDrinks.id,
      imageUrl: "sprite_can",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Bottled Water",
      slug: "bottled-water",
      description: "Chilled pure spring water (500ml).",
      basePrice: 1.49,
      isPizza: false,
      categoryId: catDrinks.id,
      imageUrl: "bottled_water",
    },
  });

  // -- Desserts
  await prisma.menuItem.create({
    data: {
      name: "Chocolate Lava Cake",
      slug: "chocolate-lava-cake",
      description: "Warm chocolate cake with a delicious molten chocolate center.",
      basePrice: 4.99,
      isPizza: false,
      categoryId: catDesserts.id,
      imageUrl: "chocolate_lava_cake",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Cinnamon Pull-Aparts",
      slug: "cinnamon-pull-aparts",
      description: "Warm bite-sized dough baked with cinnamon sugar and drizzled with sweet icing.",
      basePrice: 5.49,
      isPizza: false,
      categoryId: catDesserts.id,
      imageUrl: "cinnamon_pull_aparts",
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "NY Style Cheesecake Slice",
      slug: "ny-style-cheesecake-slice",
      description: "Classic rich and creamy New York style cheesecake slice.",
      basePrice: 4.49,
      isPizza: false,
      categoryId: catDesserts.id,
      imageUrl: "ny_cheesecake_slice",
    },
  });

  console.log("Menu items seeded.");

  // 10. Seed System Config
  await prisma.systemConfig.create({
    data: { key: "taxRate", value: "0.10" }, // 10% tax rate
  });
  await prisma.systemConfig.create({
    data: { key: "basePrepTime", value: "15" }, // 15 mins base prep time
  });
  await prisma.systemConfig.create({
    data: { key: "prepTimePerActiveOrder", value: "5" }, // 5 mins per active order in queue
  });

  console.log("System configs seeded.");
  console.log("Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
