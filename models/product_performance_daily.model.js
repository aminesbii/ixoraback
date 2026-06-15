import mongoose from "mongoose";

const productPerformanceDailySchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "product_id is required"],
    },
    // Date only — store as YYYY-MM-DD midnight UTC for consistency
    date: {
      type: Date,
      required: [true, "date is required"],
    },
    click_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    add_to_cart_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchase_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    revenue_generated: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one row per product per day
productPerformanceDailySchema.index({ product_id: 1, date: 1 }, { unique: true });

// Index for date-range dashboard queries
productPerformanceDailySchema.index({ date: -1 });

const ProductPerformanceDaily = mongoose.model(
  "ProductPerformanceDaily",
  productPerformanceDailySchema
);

export default ProductPerformanceDaily;
