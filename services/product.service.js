import prisma from "../config/prisma.js";
import fs from "fs";
import path from "path";

function deleteImageFile(imageUrl) {
  if (!imageUrl) return;
  const filename = path.basename(imageUrl);
  const filePath = path.join(process.cwd(), "uploads", filename);
  if (fs.existsSync(filePath)) {
    fs.promises.unlink(filePath).catch(() => {});
  }
}

// ─── LIST PRODUCTS (paginated, filterable) ───────────────────────────────────
export const getProducts = async ({
  page = 1,
  limit = 20,
  status,
  category_id,
  is_featured,
  search,
  sort = "-createdAt",
} = {}) => {
  const where = {};
  if (status) where.status = status.toUpperCase();
  if (category_id) where.category_id = category_id;
  if (is_featured !== undefined) where.is_featured = String(is_featured) === 'true';

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand_name: { contains: search, mode: 'insensitive' } },
      { short_description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;
  let orderBy = { createdAt: 'desc' };

  if (sort === "createdAt") orderBy = { createdAt: 'asc' };
  else if (sort === "-createdAt") orderBy = { createdAt: 'desc' };

  const [docs, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: Number(limit),
      include: {
        category: {
          select: { name: true, slug: true }
        },
        images: {
          orderBy: { sort_order: 'asc' }
        },
        variants: {
          where: { is_active: true }
        }
      }
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: docs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// ─── GET BY ID (with images & variants) ──────────────────────────────────────
export const getProductById = async (id) => {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sort_order: 'asc' } },
        variants: { where: { is_active: true } }
      }
    });
  } catch (e) { return null; }
};

// ─── GET BY SLUG ─────────────────────────────────────────────────────────────
export const getProductBySlug = async (slug) => {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sort_order: 'asc' } },
        variants: { where: { is_active: true } }
      }
    });
  } catch (e) { return null; }
};

// ─── GET CLICKS ──────────────────────────────────────────────────────────────
export const getProductClicks = async (id) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, clicks: true }
    });
    return product;
  } catch (e) { return null; }
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createProduct = (data) => {
  if (data.status) data.status = data.status.toUpperCase();
  return prisma.product.create({ data });
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateProduct = async (id, data) => {
  try {
    if (data.status) data.status = data.status.toUpperCase();
    return await prisma.product.update({ where: { id }, data });
  } catch (e) { return null; }
}

// ─── DELETE (cascade images & variants) ──────────────────────────────────────
export const deleteProduct = async (id) => {
  try {
    const images = await prisma.productImage.findMany({ where: { product_id: id } });
    await prisma.productImage.deleteMany({ where: { product_id: id } });
    await prisma.productVariant.deleteMany({ where: { product_id: id } });
    const result = await prisma.product.delete({ where: { id } });
    images.forEach(img => deleteImageFile(img.image_url));
    return result;
  } catch (e) { return null; }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Product Images
// ═══════════════════════════════════════════════════════════════════════════════

export const addProductImage = (data) => prisma.productImage.create({ data });

export const getProductImages = (productId) =>
  prisma.productImage.findMany({ where: { product_id: productId }, orderBy: { sort_order: 'asc' } });

export const updateProductImage = async (id, data) => {
  try { return await prisma.productImage.update({ where: { id }, data }); } catch (e) { return null; }
};

export const deleteProductImage = async (id) => {
  try {
    const image = await prisma.productImage.findUnique({ where: { id } });
    if (!image) return null;
    await prisma.productImage.delete({ where: { id } });
    deleteImageFile(image.image_url);
    return image;
  } catch (e) { return null; }
};

export const setMainImage = async (productId, imageId) => {
  await prisma.productImage.updateMany({ where: { product_id: productId }, data: { is_main: false } });
  return prisma.productImage.update({ where: { id: imageId }, data: { is_main: true } });
};

export const setFeatured1Image = async (productId, data) => {
  await prisma.productImage.updateMany({ where: { product_id: productId }, data: { featured1: false } });
  return prisma.productImage.create({ data: { ...data, featured1: true } });
};

export const setFeatured2Image = async (productId, data) => {
  await prisma.productImage.updateMany({ where: { product_id: productId }, data: { featured2: false } });
  return prisma.productImage.create({ data: { ...data, featured2: true } });
};

// ═══════════════════════════════════════════════════════════════════════════════
// Product Variants
// ═══════════════════════════════════════════════════════════════════════════════

export const addProductVariant = (data) => prisma.productVariant.create({ data });

export const getProductVariants = (productId) =>
  prisma.productVariant.findMany({ where: { product_id: productId } });

export const updateProductVariant = async (id, data) => {
  try { return await prisma.productVariant.update({ where: { id }, data }); } catch (e) { return null; }
};

export const deleteProductVariant = async (id) => {
  try { return await prisma.productVariant.delete({ where: { id } }); } catch (e) { return null; }
};

export const adjustStock = async (variantId, delta) => {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw new Error("Variant not found");
  const newQty = variant.stock_qty + delta;
  if (newQty < 0) throw new Error("Insufficient stock");
  return prisma.productVariant.update({ where: { id: variantId }, data: { stock_qty: newQty } });
};
