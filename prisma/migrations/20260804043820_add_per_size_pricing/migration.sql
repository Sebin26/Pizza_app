-- CreateTable
CREATE TABLE "MenuItemSizePrice" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "sizeId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MenuItemSizePrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToppingSizePrice" (
    "id" TEXT NOT NULL,
    "toppingId" TEXT NOT NULL,
    "sizeId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ToppingSizePrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SauceSizePrice" (
    "id" TEXT NOT NULL,
    "sauceId" TEXT NOT NULL,
    "sizeId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SauceSizePrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemSizePrice_menuItemId_sizeId_key" ON "MenuItemSizePrice"("menuItemId", "sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "ToppingSizePrice_toppingId_sizeId_key" ON "ToppingSizePrice"("toppingId", "sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "SauceSizePrice_sauceId_sizeId_key" ON "SauceSizePrice"("sauceId", "sizeId");

-- AddForeignKey
ALTER TABLE "MenuItemSizePrice" ADD CONSTRAINT "MenuItemSizePrice_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemSizePrice" ADD CONSTRAINT "MenuItemSizePrice_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "PizzaSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToppingSizePrice" ADD CONSTRAINT "ToppingSizePrice_toppingId_fkey" FOREIGN KEY ("toppingId") REFERENCES "PizzaTopping"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToppingSizePrice" ADD CONSTRAINT "ToppingSizePrice_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "PizzaSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SauceSizePrice" ADD CONSTRAINT "SauceSizePrice_sauceId_fkey" FOREIGN KEY ("sauceId") REFERENCES "PizzaSauce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SauceSizePrice" ADD CONSTRAINT "SauceSizePrice_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "PizzaSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
