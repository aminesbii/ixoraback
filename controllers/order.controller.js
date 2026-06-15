import * as orderService from "../services/order.service.js";

// ─── CHECKOUT (create order from cart) ──────────────────────────────────────
export const checkout = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const sessionToken = req.headers["x-session-token"] || null;
    const {
      cart_id,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      billing_address,
      shipping_fee,
      discount_total,
      tax_total,
      currency,
    } = req.body;

    if (!cart_id || !customer_name || !customer_email) {
      return res.status(400).json({
        message: "cart_id, customer_name, and customer_email are required.",
      });
    }

    if (!shipping_address || !shipping_address.full_name || !shipping_address.street || !shipping_address.city || !shipping_address.country) {
      return res.status(400).json({
        message: "shipping_address with full_name, street, city, and country is required.",
      });
    }

    const result = await orderService.createOrderFromCart({
      cartId: cart_id,
      userId,
      sessionToken,
      customerName: customer_name,
      customerEmail: customer_email,
      customerPhone: customer_phone,
      shippingAddress: shipping_address,
      billingAddress: billing_address || null,
      shippingFee: Number(shipping_fee) || 0,
      discountTotal: Number(discount_total) || 0,
      taxTotal: Number(tax_total) || 0,
      currency: currency || "MAD",
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("[Order] Checkout error:", err);
    res.status(400).json({ message: err.message });
  }
};

// ─── GET MY ORDERS (authenticated user) ─────────────────────────────────────
export const myOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const result = await orderService.getOrders({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      userId: req.user.userId,
      status,
    });
    res.json(result);
  } catch (err) {
    console.error("[Order] MyOrders error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── GET ORDER BY ID ────────────────────────────────────────────────────────
export const getById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    // Non-admin users can only see their own orders
    if (req.user.role !== "admin" && order.user_id?.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(order);
  } catch (err) {
    console.error("[Order] GetById error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── TRACK ORDER BY NUMBER (public) ─────────────────────────────────────────
export const trackByNumber = async (req, res) => {
  try {
    const order = await orderService.getOrderByNumber(req.params.orderNumber);
    if (!order) return res.status(404).json({ message: "Order not found." });
    // Return limited info for public tracking
    res.json({
      order_number: order.order_number,
      status: order.status,
      grand_total: order.grand_total,
      currency: order.currency,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        product_name: i.product_name_snapshot,
        quantity: i.quantity,
        line_total: i.line_total,
      })),
    });
  } catch (err) {
    console.error("[Order] Track error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── LIST ALL ORDERS (admin) ────────────────────────────────────────────────
export const listAll = async (req, res) => {
  try {
    const { page, limit, status, sort } = req.query;
    const result = await orderService.getOrders({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
      sort,
    });
    res.json(result);
  } catch (err) {
    console.error("[Order] ListAll error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── UPDATE STATUS (admin) ──────────────────────────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "status is required." });

    const order = await orderService.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (err) {
    console.error("[Order] UpdateStatus error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
