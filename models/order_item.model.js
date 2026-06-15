import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "order_id is required"],
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "product_id is required"],
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant",
      default: null,
    },
    // Immutable snapshots — product data at the time of purchase
    product_name_snapshot: {
      type: String,
      required: [true, "Product name snapshot is required"],
      trim: true,
    },
    sku_snapshot: {
      type: String,
      trim: true,
      default: null,
    },
    unit_price_snapshot: {
      type: Number,
      required: [true, "Unit price snapshot is required"],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    line_total: {
      type: Number,
      required: [true, "Line total is required"],
      min: 0,
    },
  },
  {
    timestamps: false,
  }
);

orderItemSchema.index({ order_id: 1 });
orderItemSchema.index({ product_id: 1 }); // for sales reports per product

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;
