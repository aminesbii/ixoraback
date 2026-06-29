-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "base_price" DOUBLE PRECISION,
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'MAD';
