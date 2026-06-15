import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest carts
    },
    session_token: {
      type: String,
      default: null, // used for guest session tracking
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "converted", "abandoned"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// A user should have at most one active cart; guests identified by session_token
cartSchema.index({ user_id: 1, status: 1 });
cartSchema.index({ session_token: 1, status: 1 });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
