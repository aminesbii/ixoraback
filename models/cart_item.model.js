import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: [true, "cart_id is required"],
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "product_id is required"],
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: null, // null for products without variants
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    unit_price: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    added_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // added_at serves as the timestamp
  }
);

// Prevent duplicate entries for the same product/variant in a cart
cartItemSchema.index({ cart_id: 1, product_id: 1, variant_id: 1 }, { unique: true });

const CartItem = mongoose.model("CartItem", cartItemSchema);

export default CartItem;
