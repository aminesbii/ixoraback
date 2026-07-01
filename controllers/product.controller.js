import * as productService from "../services/product.service.js";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════════
// Products
// ═══════════════════════════════════════════════════════════════════════════════

export const list = async (req, res) => {
  try {
    const { page, limit, status, category_id, is_featured, on_sale, search, sort, priceMin, priceMax } = req.query;
    const result = await productService.getProducts({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
      category_id,
      is_featured: is_featured !== undefined ? is_featured === "true" : undefined,
      on_sale: on_sale !== undefined ? on_sale === "true" : undefined,
      search,
      sort,
      priceMin,
      priceMax,
    });
    res.json(result);
  } catch (err) {
    console.error("[Product] List error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    console.error("[Product] GetById error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getBySlug = async (req, res) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    console.error("[Product] GetBySlug error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const create = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Product slug already exists." });
    }
    console.error("[Product] Create error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const update = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Product slug already exists." });
    }
    console.error("[Product] Update error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const remove = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product and associated images/variants deleted." });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "Product not found." });
    }
    console.error("[Product] Delete error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Product Images
// ═══════════════════════════════════════════════════════════════════════════════

export const listImages = async (req, res) => {
  try {
    const images = await productService.getProductImages(req.params.productId);
    res.json(images);
  } catch (err) {
    console.error("[ProductImage] List error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addImage = async (req, res) => {
  try {
    // If multer uploaded a file, build the URL from it
    let imageUrl = req.body.image_url;
    if (req.file) {
      imageUrl = `/api/uploads/${req.file.filename}`;
    }
    if (!imageUrl) {
      return res.status(400).json({ message: "image_url or file upload is required." });
    }

    const image = await productService.addProductImage({
      product_id: req.params.productId,
      image_url: imageUrl,
      alt_text: req.body.alt_text || null,
      sort_order: Number(req.body.sort_order) || 0,
      is_main: req.body.is_main === "true" || req.body.is_main === true,
    });
    res.status(201).json(image);
  } catch (err) {
    console.error("[ProductImage] Add error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateImage = async (req, res) => {
  try {
    const image = await productService.updateProductImage(req.params.imageId, req.body);
    if (!image) return res.status(404).json({ message: "Image not found." });
    res.json(image);
  } catch (err) {
    console.error("[ProductImage] Update error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const image = await productService.deleteProductImage(req.params.imageId);
    if (!image) return res.status(404).json({ message: "Image not found." });
    res.json({ message: "Image deleted." });
  } catch (err) {
    console.error("[ProductImage] Delete error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const setMainImage = async (req, res) => {
  try {
    const image = await productService.setMainImage(req.params.productId, req.params.imageId);
    if (!image) return res.status(404).json({ message: "Image not found." });
    res.json(image);
  } catch (err) {
    console.error("[ProductImage] SetMain error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addFeatured1Image = async (req, res) => {
  try {
    let imageUrl = req.body.image_url;
    if (req.file) {
      imageUrl = `/api/uploads/${req.file.filename}`;
    }
    if (!imageUrl) {
      return res.status(400).json({ message: "image_url or file upload is required." });
    }

    const image = await productService.setFeatured1Image(req.params.productId, {
      product_id: req.params.productId,
      image_url: imageUrl,
      alt_text: req.body.alt_text || null,
      sort_order: 0,
      is_main: true,
    });
    res.status(201).json(image);
  } catch (err) {
    console.error("[ProductImage] AddFeatured1 error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addFeatured2Image = async (req, res) => {
  try {
    let imageUrl = req.body.image_url;
    if (req.file) {
      imageUrl = `/api/uploads/${req.file.filename}`;
    }
    if (!imageUrl) {
      return res.status(400).json({ message: "image_url or file upload is required." });
    }

    const image = await productService.setFeatured2Image(req.params.productId, {
      product_id: req.params.productId,
      image_url: imageUrl,
      alt_text: req.body.alt_text || null,
      sort_order: 1,
    });
    res.status(201).json(image);
  } catch (err) {
    console.error("[ProductImage] AddFeatured2 error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Product Variants
// ═══════════════════════════════════════════════════════════════════════════════

export const listVariants = async (req, res) => {
  try {
    const variants = await productService.getProductVariants(req.params.productId);
    res.json(variants);
  } catch (err) {
    console.error("[ProductVariant] List error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addVariant = async (req, res) => {
  try {
    const variant = await productService.addProductVariant({
      ...req.body,
      product_id: req.params.productId,
    });
    res.status(201).json(variant);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "SKU already exists." });
    }
    console.error("[ProductVariant] Add error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const variant = await productService.updateProductVariant(req.params.variantId, req.body);
    if (!variant) return res.status(404).json({ message: "Variant not found." });
    res.json(variant);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "SKU already exists." });
    }
    console.error("[ProductVariant] Update error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const variant = await productService.deleteProductVariant(req.params.variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found." });
    res.json({ message: "Variant deleted." });
  } catch (err) {
    console.error("[ProductVariant] Delete error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== "number") {
      return res.status(400).json({ message: "delta (number) is required." });
    }
    const variant = await productService.adjustStock(req.params.variantId, delta);
    res.json(variant);
  } catch (err) {
    console.error("[ProductVariant] AdjustStock error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const uploadVariantImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }
    const imageUrl = `/api/uploads/${req.file.filename}`;
    const variant = await productService.updateProductVariant(req.params.variantId, {
      image_url: imageUrl,
    });
    if (!variant) return res.status(404).json({ message: "Variant not found." });
    res.json(variant);
  } catch (err) {
    console.error("[ProductVariant] UploadImage error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

