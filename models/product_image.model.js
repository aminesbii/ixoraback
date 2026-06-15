import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "product_id is required"],
    },
    // Stores a local path (/uploads/...) or a CDN/S3 URL
    image_url: {
      type: String,
      required: [true, "image_url is required"],
      trim: true,
    },
    alt_text: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
    is_main: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one image per product is flagged as main
productImageSchema.index({ product_id: 1, is_main: 1 });
productImageSchema.index({ product_id: 1, sort_order: 1 });

const ProductImage = mongoose.model("ProductImage", productImageSchema);

export default ProductImage;
