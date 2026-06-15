import mongoose from "mongoose";

const productEventSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "product_id is required"],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest visitors
    },
    session_token: {
      type: String,
      default: null, // guest session identifier
      trim: true,
    },
    event_type: {
      type: String,
      enum: ["view", "click", "add_to_cart", "purchase"],
      required: [true, "event_type is required"],
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // created_at is manually defined
  }
);

// Efficient queries for aggregation jobs
productEventSchema.index({ product_id: 1, event_type: 1, created_at: -1 });
productEventSchema.index({ session_token: 1, created_at: -1 });

// Optional: TTL index to automatically purge raw events after 90 days
// Uncomment if you don't want to keep raw events indefinitely:
// productEventSchema.index({ created_at: 1 }, { expireAfterSeconds: 7776000 });

const ProductEvent = mongoose.model("ProductEvent", productEventSchema);

export default ProductEvent;
