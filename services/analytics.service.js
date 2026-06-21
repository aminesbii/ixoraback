import prisma from "../config/prisma.js";

// ─── TRACK EVENT ─────────────────────────────────────────────────────────────
export const trackEvent = async ({ productId, userId, sessionToken, eventType }) => {
  const event = await prisma.productEvent.create({
    data: {
      product_id: productId,
      user_id: userId || null,
      session_token: sessionToken || null,
      event_type: eventType,
    }
  });

  if (eventType?.toUpperCase() === 'CLICK') {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Increment lifetime clicks on Product
    await prisma.product.update({
      where: { id: productId },
      data: { clicks: { increment: 1 } }
    }).catch(err => console.error("[Analytics] Failed to increment Product clicks:", err));

    // Increment/upsert daily clicks in ProductPerformanceDaily
    await prisma.productPerformanceDaily.upsert({
      where: {
        product_id_date: { product_id: productId, date: todayUTC }
      },
      create: {
        product_id: productId,
        date: todayUTC,
        click_count: 1,
      },
      update: {
        click_count: { increment: 1 },
      }
    }).catch(err => console.error("[Analytics] Failed to upsert daily clicks:", err));
  }

  return event;
};

// ─── GET DAILY PERFORMANCE (date range) ─────────────────────────────────────
export const getDailyPerformance = async ({ productId, startDate, endDate } = {}) => {
  const where = {};
  if (productId) where.product_id = productId;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  return prisma.productPerformanceDaily.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { product: { select: { name: true, slug: true } } }
  });
};

// ─── AGGREGATE EVENTS INTO DAILY PERFORMANCE ────────────────────────────────
export const aggregateDaily = async (dateStr) => {
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

  const events = await prisma.productEvent.groupBy({
    by: ['product_id', 'event_type'],
    where: { created_at: { gte: dayStart, lte: dayEnd } },
    _count: { _all: true }
  });

  const productAggregations = {};
  for (const e of events) {
    if (!productAggregations[e.product_id]) productAggregations[e.product_id] = {};
    productAggregations[e.product_id][e.event_type] = e._count._all;
  }

  const ops = [];
  for (const productId of Object.keys(productAggregations)) {
    const counts = productAggregations[productId];

    const existing = await prisma.productPerformanceDaily.findFirst({ where: { product_id: productId, date: dayStart } });

    if (existing) {
      ops.push(prisma.productPerformanceDaily.update({
        where: { id: existing.id },
        data: {
          click_count: counts.click || 0,
          add_to_cart_count: counts.add_to_cart || 0,
          purchase_count: counts.purchase || 0,
        }
      }));
    } else {
      ops.push(prisma.productPerformanceDaily.create({
        data: {
          product_id: productId,
          date: dayStart,
          click_count: counts.click || 0,
          add_to_cart_count: counts.add_to_cart || 0,
          purchase_count: counts.purchase || 0,
        }
      }));
    }
  }

  if (ops.length === 0) return [];
  return prisma.$transaction(ops);
};

// ─── GET PUBLIC ANALYTICS (home page dashboard) ────────────────────────────
export const getPublicAnalytics = async (days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Total events breakdown
  const totalEvents = await prisma.productEvent.groupBy({
    by: ['event_type'],
    where: { created_at: { gte: since } },
    _count: { _all: true }
  });

  const clickCount = totalEvents.find(e => e.event_type === 'click')?._count._all || 0;
  const viewCount = totalEvents.find(e => e.event_type === 'view')?._count._all || 0;
  const cartCount = totalEvents.find(e => e.event_type === 'add_to_cart')?._count._all || 0;
  const purchaseCount = totalEvents.find(e => e.event_type === 'purchase')?._count._all || 0;

  const totalVisits = clickCount + viewCount;
  const conversionRate = totalVisits > 0 ? ((purchaseCount / totalVisits) * 100) : 0;

  // Top clicked products with full metrics
  const topClicks = await prisma.productEvent.groupBy({
    by: ['product_id'],
    where: { event_type: 'click', created_at: { gte: since } },
    _count: { _all: true }
  });

  const topProductIds = topClicks.slice(0, 10).map(e => e.product_id);

  const topProducts = [];
  for (const productId of topProductIds) {
    const clicks = topClicks.find(e => e.product_id === productId)?._count._all || 0;
    const views = await prisma.productEvent.count({
      where: { product_id: productId, event_type: 'view', created_at: { gte: since } }
    });
    const carts = await prisma.productEvent.count({
      where: { product_id: productId, event_type: 'add_to_cart', created_at: { gte: since } }
    });
    const purchases = await prisma.productEvent.count({
      where: { product_id: productId, event_type: 'purchase', created_at: { gte: since } }
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, slug: true, images: { where: { is_main: true }, take: 1, select: { image_url: true } } }
    });

    if (product) {
      const productConvRate = (views + clicks) > 0 ? ((purchases / (views + clicks)) * 100) : 0;
      topProducts.push({
        product_id: productId,
        name: product.name,
        slug: product.slug,
        image_url: product.images?.[0]?.image_url || '',
        clicks,
        views,
        add_to_cart: carts,
        purchases,
        conversion_rate: productConvRate
      });
    }
  }

  // Daily breakdown for chart
  const dailyRaw = await prisma.productEvent.groupBy({
    by: ['date'],
    where: { created_at: { gte: since } },
    _count: { _all: true }
  });

  const dailyMap = {};
  for (const d of dailyRaw) {
    const key = new Date(d.date).toISOString().split('T')[0];
    dailyMap[key] = dailyMap[key] || { date: key, visits: 0, purchases: 0 };
    dailyMap[key].visits += d._count._all;
  }

  const dailyMetrics = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      totalVisits,
      totalPurchases: purchaseCount,
      totalAddToCart: cartCount,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      totalClicks: clickCount,
      totalViews: viewCount
    },
    topProducts,
    dailyMetrics
  };
};

// ─── DAILY PRODUCT CLICKS (aggregated per product within date range) ───────
export const getDailyProductClicks = async ({ startDate, endDate } = {}) => {
  const where = {};
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const groupData = await prisma.productPerformanceDaily.groupBy({
    by: ['product_id'],
    where,
    _sum: { click_count: true },
    orderBy: { _sum: { click_count: 'desc' } },
  });

  if (groupData.length === 0) return [];

  const productIds = groupData.map(g => g.product_id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      images: { where: { is_main: true }, take: 1, select: { image_url: true } }
    }
  });

  const productMap = {};
  for (const p of products) {
    productMap[p.id] = p;
  }

  const results = [];
  for (const g of groupData) {
    const p = productMap[g.product_id];
    if (p) {
      results.push({
        product_id: p.id,
        name: p.name,
        slug: p.slug,
        image_url: p.images?.[0]?.image_url || '',
        total_clicks: g._sum.click_count || 0,
      });
    }
  }

  return results;
};

// ─── TOP PRODUCTS (dashboard) ───────────────────────────────────────────────
export const getTopProducts = async ({ metric = "purchase_count", limit = 10, days = 30 } = {}) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const allowedMetrics = ["click_count", "add_to_cart_count", "purchase_count", "revenue_generated"];
  if (!allowedMetrics.includes(metric)) metric = "purchase_count";

  const groupData = await prisma.productPerformanceDaily.groupBy({
    by: ['product_id'],
    where: { date: { gte: since } },
    _sum: {
      [metric]: true
    },
    orderBy: {
      _sum: { [metric]: 'desc' }
    },
    take: limit
  });

  const results = [];
  for (const g of groupData) {
    const p = await prisma.product.findUnique({ where: { id: g.product_id } });
    if (p) {
      results.push({
        product_id: p.id,
        name: p.name,
        slug: p.slug,
        total: g._sum[metric] || 0
      });
    }
  }

  results.sort((a, b) => b.total - a.total);
  return results;
};
