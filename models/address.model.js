import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest addresses attached to an order
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null, // null for saved user addresses
    },
    type: {
      type: String,
      enum: ["billing", "shipping"],
      required: [true, "Address type is required"],
    },
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    street: {
      type: String,
      required: [true, "Street is required"],
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: 100,
    },
    postal_code: {
      type: String,
      trim: true,
      maxlength: 20,
      default: null,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Saved addresses per user
addressSchema.index({ user_id: 1, type: 1 });
// Addresses per order
addressSchema.index({ order_id: 1, type: 1 });

const Address = mongoose.model("Address", addressSchema);

export default Address;
