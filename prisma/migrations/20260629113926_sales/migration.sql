-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "on_sale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sale_percentage" INTEGER;
