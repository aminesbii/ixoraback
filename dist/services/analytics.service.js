import prisma from "../config/prisma.js";
// ─── TRACK EVENT ─────────────────────────────────────────────────────────────
export const trackEvent = ({ productId, userId, sessionToken, eventType }) => prisma.productEvent.create({
    data: {
        product_id: productId,
        user_id: userId || null,
        session_token: sessionToken || null,
        event_type: eventType,
    }
});
// ─── GET DAILY PERFORMANCE (date range) ─────────────────────────────────────
export const getDailyPerformance = async ({ productId, startDate, endDate } = {}) => {
    const where = {};
    if (productId)
        where.product_id = productId;
    if (startDate || endDate) {
        where.date = {};
        if (startDate)
            where.date.gte = new Date(startDate);
        if (endDate)
            where.date.lte = new Date(endDate);
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
        if (!productAggregations[e.product_id])
            productAggregations[e.product_id] = {};
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
        }
        else {
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
    if (ops.length === 0)
        return [];
    return prisma.$transaction(ops);
};
// ─── TOP PRODUCTS (dashboard) ───────────────────────────────────────────────
export const getTopProducts = async ({ metric = "purchase_count", limit = 10, days = 30 } = {}) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const allowedMetrics = ["click_count", "add_to_cart_count", "purchase_count", "revenue_generated"];
    if (!allowedMetrics.includes(metric))
        metric = "purchase_count";
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
