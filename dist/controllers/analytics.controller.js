import * as analyticsService from "../services/analytics.service.js";
// ─── TRACK EVENT (public) ───────────────────────────────────────────────────
export const trackEvent = async (req, res) => {
    try {
        const { product_id, event_type } = req.body;
        if (!product_id || !event_type) {
            return res.status(400).json({ message: "product_id and event_type are required." });
        }
        const userId = req.user?.userId || null;
        const sessionToken = req.headers["x-session-token"] || null;
        await analyticsService.trackEvent({
            productId: product_id,
            userId,
            sessionToken,
            eventType: event_type,
        });
        res.status(201).json({ message: "Event tracked." });
    }
    catch (err) {
        console.error("[Analytics] TrackEvent error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── GET DAILY PERFORMANCE (admin) ──────────────────────────────────────────
export const dailyPerformance = async (req, res) => {
    try {
        const { product_id, start_date, end_date } = req.query;
        const data = await analyticsService.getDailyPerformance({
            productId: product_id,
            startDate: start_date,
            endDate: end_date,
        });
        res.json(data);
    }
    catch (err) {
        console.error("[Analytics] DailyPerformance error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── TRIGGER DAILY AGGREGATION (admin / cron) ───────────────────────────────
export const triggerAggregation = async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) {
            return res.status(400).json({ message: "date (YYYY-MM-DD) is required." });
        }
        const results = await analyticsService.aggregateDaily(date);
        res.json({ message: `Aggregated ${results.length} products for ${date}.`, results });
    }
    catch (err) {
        console.error("[Analytics] Aggregation error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── TOP PRODUCTS (admin dashboard) ─────────────────────────────────────────
export const topProducts = async (req, res) => {
    try {
        const { metric, limit, days } = req.query;
        const data = await analyticsService.getTopProducts({
            metric,
            limit: Number(limit) || 10,
            days: Number(days) || 30,
        });
        res.json(data);
    }
    catch (err) {
        console.error("[Analytics] TopProducts error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
