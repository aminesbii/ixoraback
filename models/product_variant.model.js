import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "product_id is required"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    variant_name: {
      type: String,
      trim: true,
      maxlength: 150,
      default: null, // e.g. "100ml", "Blue / Large"
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compare_at_price: {
      type: Number,
      min: [0, "Compare-at price cannot be negative"],
      default: null, // original/crossed-out price
    },
    currency: {
      type: String,
      default: "MAD",
      uppercase: true,
      trim: true,
      maxlength: 3,
    },
    stock_qty: {
      type: Number,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for inventory management
productVariantSchema.index({ product_id: 1, is_active: 1 });

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);

export default ProductVariant;
