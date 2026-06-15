import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"],
    },
    brand_name: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    short_description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    // Flexible JSONB-equivalent: stores indication, composition, usage, etc.
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for catalog browsing
productSchema.index({ category_id: 1, status: 1 });
productSchema.index({ is_featured: 1, status: 1 });
productSchema.index({ name: "text", brand_name: "text", short_description: "text" }); // full-text search

const Product = mongoose.model("Product", productSchema);

export default Product;
