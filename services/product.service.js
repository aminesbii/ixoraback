import Product from "../models/product.model.js";
import ProductImage from "../models/product_image.model.js";
import ProductVariant from "../models/product_variant.model.js";

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
  const filter = {};
  if (status) filter.status = status;
  if (category_id) filter.category_id = category_id;
  if (is_featured !== undefined) filter.is_featured = is_featured;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .populate("category_id", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: docs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// ─── GET BY ID (with images & variants) ──────────────────────────────────────
export const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("category_id", "name slug")
    .lean();
  if (!product) return null;

  const [images, variants] = await Promise.all([
    ProductImage.find({ product_id: id }).sort({ sort_order: 1 }).lean(),
    ProductVariant.find({ product_id: id, is_active: true }).lean(),
  ]);

  return { ...product, images, variants };
};

// ─── GET BY SLUG ─────────────────────────────────────────────────────────────
export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug })
    .populate("category_id", "name slug")
    .lean();
  if (!product) return null;

  const [images, variants] = await Promise.all([
    ProductImage.find({ product_id: product._id }).sort({ sort_order: 1 }).lean(),
    ProductVariant.find({ product_id: product._id, is_active: true }).lean(),
  ]);

  return { ...product, images, variants };
};

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createProduct = (data) => Product.create(data);

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateProduct = (id, data) =>
  Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });

// ─── DELETE (cascade images & variants) ──────────────────────────────────────
export const deleteProduct = async (id) => {
  await Promise.all([
    ProductImage.deleteMany({ product_id: id }),
    ProductVariant.deleteMany({ product_id: id }),
  ]);
  return Product.findByIdAndDelete(id);
};

// ═══════════════════════════════════════════════════════════════════════════════
// Product Images
// ═══════════════════════════════════════════════════════════════════════════════

export const addProductImage = (data) => ProductImage.create(data);

export const getProductImages = (productId) =>
  ProductImage.find({ product_id: productId }).sort({ sort_order: 1 }).lean();

export const updateProductImage = (id, data) =>
  ProductImage.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteProductImage = (id) => ProductImage.findByIdAndDelete(id);

export const setMainImage = async (productId, imageId) => {
  await ProductImage.updateMany({ product_id: productId }, { is_main: false });
  return ProductImage.findByIdAndUpdate(imageId, { is_main: true }, { new: true });
};

// ═══════════════════════════════════════════════════════════════════════════════
// Product Variants
// ═══════════════════════════════════════════════════════════════════════════════

export const addProductVariant = (data) => ProductVariant.create(data);

export const getProductVariants = (productId) =>
  ProductVariant.find({ product_id: productId }).lean();

export const updateProductVariant = (id, data) =>
  ProductVariant.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteProductVariant = (id) => ProductVariant.findByIdAndDelete(id);

export const adjustStock = async (variantId, delta) => {
  const variant = await ProductVariant.findById(variantId);
  if (!variant) throw new Error("Variant not found");
  const newQty = variant.stock_qty + delta;
  if (newQty < 0) throw new Error("Insufficient stock");
  variant.stock_qty = newQty;
  return variant.save();
};
