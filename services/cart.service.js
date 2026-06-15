import Cart from "../models/cart.model.js";
import CartItem from "../models/cart_item.model.js";
import ProductVariant from "../models/product_variant.model.js";

// ─── FIND OR CREATE CART ─────────────────────────────────────────────────────
export const getOrCreateCart = async ({ userId, sessionToken }) => {
  const filter = { status: "active" };
  if (userId) filter.user_id = userId;
  else if (sessionToken) filter.session_token = sessionToken;
  else throw new Error("userId or sessionToken is required");

  let cart = await Cart.findOne(filter);
  if (!cart) {
    cart = await Cart.create({
      user_id: userId || null,
      session_token: sessionToken || null,
    });
  }
  return cart;
};

// ─── GET CART WITH ITEMS ─────────────────────────────────────────────────────
export const getCartWithItems = async (cartId) => {
  const cart = await Cart.findById(cartId).lean();
  if (!cart) return null;

  const items = await CartItem.find({ cart_id: cartId })
    .populate("product_id", "name slug")
    .populate("variant_id", "variant_name sku price stock_qty")
    .sort({ added_at: -1 })
    .lean();

  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  return { ...cart, items, subtotal };
};

// ─── ADD TO CART ─────────────────────────────────────────────────────────────
export const addToCart = async ({ cartId, productId, variantId, quantity = 1 }) => {
  // Resolve price from variant if present, otherwise caller must provide it
  let unitPrice;
  if (variantId) {
    const variant = await ProductVariant.findById(variantId);
    if (!variant) throw new Error("Variant not found");
    if (!variant.is_active) throw new Error("Variant is not active");
    if (variant.stock_qty < quantity) throw new Error("Insufficient stock");
    unitPrice = variant.price;
  }

  // Upsert: if the same product+variant is already in the cart, increment qty
  const existing = await CartItem.findOne({
    cart_id: cartId,
    product_id: productId,
    variant_id: variantId || null,
  });

  if (existing) {
    existing.quantity += quantity;
    existing.unit_price = unitPrice ?? existing.unit_price;
    return existing.save();
  }

  return CartItem.create({
    cart_id: cartId,
    product_id: productId,
    variant_id: variantId || null,
    quantity,
    unit_price: unitPrice,
  });
};

// ─── UPDATE ITEM QUANTITY ────────────────────────────────────────────────────
export const updateCartItem = async (itemId, quantity) => {
  if (quantity <= 0) {
    return CartItem.findByIdAndDelete(itemId);
  }
  return CartItem.findByIdAndUpdate(itemId, { quantity }, { new: true });
};

// ─── REMOVE ITEM ─────────────────────────────────────────────────────────────
export const removeCartItem = (itemId) => CartItem.findByIdAndDelete(itemId);

// ─── CLEAR CART ──────────────────────────────────────────────────────────────
export const clearCart = async (cartId) => {
  await CartItem.deleteMany({ cart_id: cartId });
  return Cart.findByIdAndUpdate(cartId, { status: "abandoned" }, { new: true });
};

// ─── MERGE GUEST CART INTO USER CART ─────────────────────────────────────────
export const mergeGuestCart = async (sessionToken, userId) => {
  const guestCart = await Cart.findOne({ session_token: sessionToken, status: "active" });
  if (!guestCart) return null;

  const userCart = await getOrCreateCart({ userId });
  const guestItems = await CartItem.find({ cart_id: guestCart._id });

  for (const item of guestItems) {
    await addToCart({
      cartId: userCart._id,
      productId: item.product_id,
      variantId: item.variant_id,
      quantity: item.quantity,
    });
  }

  // Mark guest cart as converted
  guestCart.status = "converted";
  await guestCart.save();
  await CartItem.deleteMany({ cart_id: guestCart._id });

  return getCartWithItems(userCart._id);
};
