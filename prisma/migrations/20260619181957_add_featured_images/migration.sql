-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "featured1" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featured2" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ProductImage_product_id_featured1_idx" ON "ProductImage"("product_id", "featured1");

-- CreateIndex
CREATE INDEX "ProductImage_product_id_featured2_idx" ON "ProductImage"("product_id", "featured2");
