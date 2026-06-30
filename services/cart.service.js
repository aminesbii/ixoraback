import prisma from "../config/prisma.js";

// ─── FIND OR CREATE CART ─────────────────────────────────────────────────────
export const getOrCreateCart = async ({ userId, sessionToken }) => {
  const where = { status: "ACTIVE" };
  if (userId) where.user_id = userId;
  else if (sessionToken) where.session_token = sessionToken;
  else throw new Error("userId or sessionToken is required");

  let cart = await prisma.cart.findFirst({ where });
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        user_id: userId || null,
        session_token: sessionToken || null,
        status: "ACTIVE"
      }
    });
  }
  return cart;
};

// ─── GET CART WITH ITEMS ─────────────────────────────────────────────────────
export const getCartWithItems = async (cartId) => {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      cartItems: {
        include: {
          product: { select: { name: true, slug: true } },
          variant: { select: { variant_name: true, sku: true, price: true, stock_qty: true } }
        },
        orderBy: { added_at: 'desc' }
      }
    }
  });
  if (!cart) return null;

  const subtotal = cart.cartItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  // Remap cartItems to items for backward compatibility
  return { ...cart, items: cart.cartItems, subtotal };
};

// ─── ADD TO CART ─────────────────────────────────────────────────────────────
export const addToCart = async ({ cartId, productId, variantId, quantity = 1 }) => {
  let unitPrice;
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw new Error("Variant not found");
    if (!variant.is_active) throw new Error("Variant is not active");
    if (variant.stock_qty < quantity) throw new Error("Insufficient stock");
    unitPrice = variant.price;
  } else {
    // Treat as base product
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");
    // Optionally check product stock if available, but for now just safely get price
    if (product.on_sale && product.sale_percentage) {
      unitPrice = product.base_price * (1 - (product.sale_percentage / 100));
    } else {
      unitPrice = product.base_price || 0;
    }
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId || null,
    }
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + quantity,
        unit_price: unitPrice ?? existing.unit_price
      }
    });
  }

  return prisma.cartItem.create({
    data: {
      cart_id: cartId,
      product_id: productId,
      variant_id: variantId || null,
      quantity,
      unit_price: unitPrice || 0,
    }
  });
};

// ─── UPDATE ITEM QUANTITY ────────────────────────────────────────────────────
export const updateCartItem = async (itemId, quantity) => {
  if (quantity <= 0) {
    try { return await prisma.cartItem.delete({ where: { id: itemId } }); } catch (e) { return null; }
  }
  try { return await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } }); } catch (e) { return null; }
};

// ─── REMOVE ITEM ─────────────────────────────────────────────────────────────
export const removeCartItem = async (itemId) => {
  try { return await prisma.cartItem.delete({ where: { id: itemId } }); } catch (e) { return null; }
};

// ─── CLEAR CART ──────────────────────────────────────────────────────────────
export const clearCart = async (cartId) => {
  await prisma.cartItem.deleteMany({ where: { cart_id: cartId } });
  return prisma.cart.update({ where: { id: cartId }, data: { status: "ABANDONED" } });
};

// ─── MERGE GUEST CART INTO USER CART ─────────────────────────────────────────
export const mergeGuestCart = async (sessionToken, userId) => {
  const guestCart = await prisma.cart.findFirst({ where: { session_token: sessionToken, status: "ACTIVE" } });
  if (!guestCart) return null;

  const userCart = await getOrCreateCart({ userId });
  const guestItems = await prisma.cartItem.findMany({ where: { cart_id: guestCart.id } });

  for (const item of guestItems) {
    await addToCart({
      cartId: userCart.id,
      productId: item.product_id,
      variantId: item.variant_id,
      quantity: item.quantity,
    });
  }

  await prisma.cart.update({ where: { id: guestCart.id }, data: { status: "CONVERTED" } });
  await prisma.cartItem.deleteMany({ where: { cart_id: guestCart.id } });

  return getCartWithItems(userCart.id);
};
