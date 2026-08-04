-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "availableFor" "FulfillmentType"[] DEFAULT ARRAY['DINE_IN', 'PICKUP', 'DELIVERY']::"FulfillmentType"[];
