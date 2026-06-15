import ProductEvent from "../models/product_event.model.js";
import ProductPerformanceDaily from "../models/product_performance_daily.model.js";

// ─── TRACK EVENT ─────────────────────────────────────────────────────────────
export const trackEvent = ({ productId, userId, sessionToken, eventType }) =>
  ProductEvent.create({
    product_id: productId,
    user_id: userId || null,
    session_token: sessionToken || null,
    event_type: eventType,
  });

// ─── GET DAILY PERFORMANCE (date range) ─────────────────────────────────────
export const getDailyPerformance = async ({
  productId,
  startDate,
  endDate,
} = {}) => {
  const filter = {};
  if (productId) filter.product_id = productId;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  return ProductPerformanceDaily.find(filter)
    .sort({ date: -1 })
    .populate("product_id", "name slug")
    .lean();
};

// ─── AGGREGATE EVENTS INTO DAILY PERFORMANCE ────────────────────────────────
// Call this via a cron job or admin endpoint
export const aggregateDaily = async (dateStr) => {
  // dateStr = "YYYY-MM-DD"
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

  const pipeline = [
    { $match: { created_at: { $gte: dayStart, $lte: dayEnd } } },
    {
      $group: {
        _id: { product_id: "$product_id", event_type: "$event_type" },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.product_id",
        events: {
          $push: { type: "$_id.event_type", count: "$count" },
        },
      },
    },
  ];

  const results = await ProductEvent.aggregate(pipeline);

  const ops = results.map((r) => {
    const counts = {};
    for (const e of r.events) counts[e.type] = e.count;

    return ProductPerformanceDaily.findOneAndUpdate(
      { product_id: r._id, date: dayStart },
      {
        $set: {
          click_count: counts.click || 0,
          add_to_cart_count: counts.add_to_cart || 0,
          purchase_count: counts.purchase || 0,
        },
      },
      { upsert: true, new: true }
    );
  });

  return Promise.all(ops);
};

// ─── TOP PRODUCTS (dashboard) ───────────────────────────────────────────────
export const getTopProducts = async ({ metric = "purchase_count", limit = 10, days = 30 } = {}) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const allowedMetrics = ["click_count", "add_to_cart_count", "purchase_count", "revenue_generated"];
  if (!allowedMetrics.includes(metric)) metric = "purchase_count";

  return ProductPerformanceDaily.aggregate([
    { $match: { date: { $gte: since } } },
    {
      $group: {
        _id: "$product_id",
        total: { $sum: `$${metric}` },
      },
    },
    { $sort: { total: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        product_id: "$_id",
        name: "$product.name",
        slug: "$product.slug",
        total: 1,
      },
    },
  ]);
};
