import crypto from "crypto";
import prisma from "../config/prisma.js";
const generateOrderNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `XOR-${date}-${rand}`;
};
export const createOrderFromCart = async ({ cartId, userId, sessionToken, customerName, customerEmail, customerPhone, shippingAddress, billingAddress, shippingFee = 0, discountTotal = 0, taxTotal = 0, currency = "MAD", }) => {
    const cartItems = await prisma.cartItem.findMany({ where: { cart_id: cartId }, include: { product: true, variant: true } });
    if (!cartItems.length)
        throw new Error("Cart is empty");
    const orderItems = [];
    let subtotal = 0;
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
        if (!order)
            return null;
        return { ...order, items: order.orderItems };
    }
    catch (e) {
        return null;
    }
};
export const getOrderByNumber = async (orderNumber) => {
    try {
        const order = await prisma.order.findUnique({ where: { order_number: orderNumber }, include: { orderItems: true, addresses: true } });
        if (!order)
            return null;
        return { ...order, items: order.orderItems };
    }
    catch (e) {
        return null;
    }
};
export const getOrders = async ({ page = 1, limit = 20, userId, status, sort = "-createdAt" } = {}) => {
    const where = {};
    if (userId)
        where.user_id = userId;
    if (status)
        where.status = status.toUpperCase();
    const skip = (page - 1) * limit;
    let orderBy = { createdAt: 'desc' };
    if (sort === "createdAt")
        orderBy = { createdAt: 'asc' };
    const [docs, total] = await Promise.all([
        prisma.order.findMany({ where, orderBy, skip, take: Number(limit) }),
        prisma.order.count({ where }),
    ]);
    return { orders: docs, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } };
};
export const updateOrderStatus = async (orderId, status) => {
    try {
        return await prisma.order.update({ where: { id: orderId }, data: { status: status.toUpperCase() } });
    }
    catch (e) {
        return null;
    }
};
