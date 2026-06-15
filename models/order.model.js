import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest orders
    },
    session_token: {
      type: String,
      default: null, // links guest order to their session
      trim: true,
    },
    order_number: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Customer snapshot at time of order (in case user updates profile later)
    customer_name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customer_email: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
    },
    customer_phone: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    // Pricing breakdown
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount_total: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping_fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax_total: {
      type: Number,
      default: 0,
      min: 0,
    },
    grand_total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "MAD",
      uppercase: true,
      trim: true,
      maxlength: 3,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user_id: 1, status: 1 });
orderSchema.index({ session_token: 1 });
orderSchema.index({ customer_email: 1 });
orderSchema.index({ createdAt: -1 }); // latest orders first

const Order = mongoose.model("Order", orderSchema);

export default Order;
