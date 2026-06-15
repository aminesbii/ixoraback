import crypto from "crypto";
import Order from "../models/order.model.js";
import OrderItem from "../models/order_item.model.js";
import Address from "../models/address.model.js";
import Cart from "../models/cart.model.js";
import CartItem from "../models/cart_item.model.js";
import ProductVariant from "../models/product_variant.model.js";

// ─── GENERATE ORDER NUMBER ──────────────────────────────────────────────────
const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `XOR-${date}-${rand}`;
};

// ─── CREATE ORDER FROM CART ─────────────────────────────────────────────────
export const createOrderFromCart = async ({
  cartId,
  userId,
  sessionToken,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  billingAddress,
  shippingFee = 0,
  discountTotal = 0,
  taxTotal = 0,
  currency = "MAD",
}) => {
  // 1. Load cart items
  const cartItems = await CartItem.find({ cart_id: cartId })
    .populate("product_id", "name")
    .populate("variant_id", "sku price stock_qty variant_name");

  if (!cartItems.length) throw new Error("Cart is empty");

  // 2. Validate stock and build order items
  const orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    // Validate stock if variant exists
    if (item.variant_id) {
      const variant = await ProductVariant.findById(item.variant_id._id || item.variant_id);
      if (!variant || variant.stock_qty < item.quantity) {
        throw new Error(
          `Insufficient stock for "${item.product_id?.name || "unknown"}" (variant: ${variant?.variant_name || "N/A"})`
        );
      }
    }

    const lineTotal = item.unit_price * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      product_id: item.product_id._id || item.product_id,
      variant_id: item.variant_id?._id || item.variant_id || null,
      product_name_snapshot: item.product_id?.name || "Unknown Product",
      sku_snapshot: item.variant_id?.sku || null,
      unit_price_snapshot: item.unit_price,
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }

  const grandTotal = subtotal - discountTotal + shippingFee + taxTotal;

  // 3. Create the order
  const order = await Order.create({
    user_id: userId || null,
    session_token: sessionToken || null,
    order_number: generateOrderNumber(),
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone || null,
    status: "pending",
    subtotal,
    discount_total: discountTotal,
    shipping_fee: shippingFee,
    tax_total: taxTotal,
    grand_total: grandTotal,
    currency,
  });

  // 4. Create order items
  const items = await OrderItem.insertMany(
    orderItems.map((oi) => ({ ...oi, order_id: order._id }))
  );

  // 5. Create addresses linked to order
  const addresses = [];
  if (shippingAddress) {
    addresses.push(
      await Address.create({
        ...shippingAddress,
        order_id: order._id,
        user_id: userId || null,
        type: "shipping",
      })
    );
  }
  if (billingAddress) {
    addresses.push(
      await Address.create({
        ...billingAddress,
        order_id: order._id,
        user_id: userId || null,
        type: "billing",
      })
    );
  }

  // 6. Deduct stock
  for (const item of cartItems) {
    if (item.variant_id) {
      await ProductVariant.findByIdAndUpdate(
        item.variant_id._id || item.variant_id,
        { $inc: { stock_qty: -item.quantity } }
      );
    }
  }

  // 7. Mark cart as converted
  await CartItem.deleteMany({ cart_id: cartId });
  await Cart.findByIdAndUpdate(cartId, { status: "converted" });

  return { order, items, addresses };
};

// ─── GET ORDER BY ID ────────────────────────────────────────────────────────
export const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId).lean();
  if (!order) return null;

  const [items, addresses] = await Promise.all([
    OrderItem.find({ order_id: orderId }).lean(),
    Address.find({ order_id: orderId }).lean(),
  ]);

  return { ...order, items, addresses };
};

// ─── GET ORDER BY ORDER NUMBER ──────────────────────────────────────────────
export const getOrderByNumber = async (orderNumber) => {
  const order = await Order.findOne({ order_number: orderNumber }).lean();
  if (!order) return null;

  const [items, addresses] = await Promise.all([
    OrderItem.find({ order_id: order._id }).lean(),
    Address.find({ order_id: order._id }).lean(),
  ]);

  return { ...order, items, addresses };
};

// ─── LIST ORDERS (admin or per-user, paginated) ─────────────────────────────
export const getOrders = async ({
  page = 1,
  limit = 20,
  userId,
  status,
  sort = "-createdAt",
} = {}) => {
  const filter = {};
  if (userId) filter.user_id = userId;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Order.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders: docs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

// ─── UPDATE ORDER STATUS ────────────────────────────────────────────────────
export const updateOrderStatus = (orderId, status) =>
  Order.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true });
