import crypto from "crypto";
import prisma from "../config/prisma.js";

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `XOR-${date}-${rand}`;
};

export const createOrderFromCart = async ({
  cartId, userId, sessionToken, customerName, customerEmail, customerPhone, shippingAddress, billingAddress, shippingFee = 0, discountTotal = 0, taxTotal = 0, currency = "MAD",
}) => {
  const cartItems = await prisma.cartItem.findMany({ where: { cart_id: cartId }, include: { product: true, variant: true } });
  if (!cartItems.length) throw new Error("Cart is empty");

  const orderItems = []; let subtotal = 0;
  for (const item of cartItems) {
    if (item.variant_id) {
      if (!item.variant || item.variant.stock_qty < item.quantity) {
        throw new Error(`Insufficient stock for "${item.product?.name}"`);
      }
    }
    const lineTotal = item.unit_price * item.quantity;
    subtotal += lineTotal;
    orderItems.push({
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name_snapshot: item.product?.name || "Unknown Product",
      sku_snapshot: item.variant?.sku || null,
      unit_price_snapshot: item.unit_price,
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }

  const grandTotal = subtotal - discountTotal + shippingFee + taxTotal;

  const order = await prisma.order.create({
    data: {
      user_id: userId || null, session_token: sessionToken || null, order_number: generateOrderNumber(),
      customer_name: customerName, customer_email: customerEmail, customer_phone: customerPhone || null,
      status: "PENDING", subtotal, discount_total: discountTotal, shipping_fee: shippingFee,
      tax_total: taxTotal, grand_total: grandTotal, currency,
      orderItems: { create: orderItems },
      addresses: {
        create: [
          ...(shippingAddress ? [{ ...shippingAddress, user_id: userId || null, type: "SHIPPING" }] : []),
          ...(billingAddress ? [{ ...billingAddress, user_id: userId || null, type: "BILLING" }] : [])
        ]
      }
    },
    include: { orderItems: true, addresses: true }
  });

  for (const item of cartItems) {
    if (item.variant_id) {
      await prisma.productVariant.update({ where: { id: item.variant_id }, data: { stock_qty: { decrement: item.quantity } } });
    }
  }

  await prisma.cartItem.deleteMany({ where: { cart_id: cartId } });
  await prisma.cart.update({ where: { id: cartId }, data: { status: "CONVERTED" } });

  return { order, items: order.orderItems, addresses: order.addresses };
};

export const getOrderById = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { orderItems: true, addresses: true } });
    if (!order) return null;
    return { ...order, items: order.orderItems };
  } catch (e) { return null; }
};

export const getOrderByNumber = async (orderNumber) => {
  try {
    const order = await prisma.order.findUnique({ where: { order_number: orderNumber }, include: { orderItems: true, addresses: true } });
    if (!order) return null;
    return { ...order, items: order.orderItems };
  } catch (e) { return null; }
};

export const getOrders = async ({ page = 1, limit = 20, userId, status, sort = "-createdAt" } = {}) => {
  const where = {};
  if (userId) where.user_id = userId;
  if (status) where.status = status.toUpperCase();

  const skip = (page - 1) * limit;
  let orderBy = { createdAt: 'desc' };
  if (sort === "createdAt") orderBy = { createdAt: 'asc' };

  const [docs, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy, skip, take: Number(limit) }),
    prisma.order.count({ where }),
  ]);

  return { orders: docs, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    return await prisma.order.update({ where: { id: orderId }, data: { status: status.toUpperCase() } });
  } catch (e) { return null; }
};

export const deleteOrder = async (orderId) => {
  try {
    await prisma.orderItem.deleteMany({ where: { order_id: orderId } });
    await prisma.address.deleteMany({ where: { order_id: orderId } });
    await prisma.order.delete({ where: { id: orderId } });
    return true;
  } catch (e) { return false; }
};

export const updateOrder = async (orderId, data) => {
  try {
    const updateData = {};
    if (data.customer_name) updateData.customer_name = data.customer_name;
    if (data.customer_email) updateData.customer_email = data.customer_email;
    if (data.customer_phone !== undefined) updateData.customer_phone = data.customer_phone;
    if (data.status) updateData.status = data.status.toUpperCase();
    if (data.shipping_fee !== undefined) updateData.shipping_fee = Number(data.shipping_fee);
    if (data.discount_total !== undefined) updateData.discount_total = Number(data.discount_total);
    if (data.tax_total !== undefined) updateData.tax_total = Number(data.tax_total);
    return await prisma.order.update({ where: { id: orderId }, data: updateData });
  } catch (e) { return null; }
};

export const getEarningsStats = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const groupData = await prisma.order.groupBy({
    by: ['createdAt'],
    where: {
      status: { not: 'CANCELLED' }, // Ensure we don't count cancelled orders
      createdAt: { gte: since }
    },
    _sum: { grand_total: true },
    _count: { id: true },
    orderBy: { createdAt: 'asc' }
  });

  const dailyMap = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().split('T')[0];
    dailyMap[key] = { date: key, orders: 0, earnings: 0 };
  }

  for (const g of groupData) {
    const key = new Date(g.createdAt).toISOString().split('T')[0];
    if (dailyMap[key]) {
      dailyMap[key].orders += g._count.id;
      dailyMap[key].earnings += g._sum.grand_total || 0;
    }
  }

  return Object.values(dailyMap);
};

export const getOrderStatusStats = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const groupData = await prisma.order.groupBy({
    by: ['status'],
    where: { createdAt: { gte: since } },
    _count: { id: true }
  });

  return groupData.map(g => ({
    status: g.status,
    count: g._count.id
  }));
};
