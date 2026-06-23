import prisma from "./config/prisma.js";

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log("Starting dummy data generation...");

    // 1. Fetch products
    const products = await prisma.product.findMany({ take: 10 });
    if (products.length === 0) {
        console.error("No products found in the database. Please add some products first.");
        return;
    }

    console.log(`Found ${products.length} products. Generating data for the last 30 days...`);

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Clean up existing analytics/orders to avoid clutter? No, just add to it.

    const events = [];
    const performanceDailyMap = {}; // key: productId_dateStr

    // Event types
    const eventTypes = ['VIEW', 'CLICK', 'ADD_TO_CART', 'PURCHASE'];

    const orders = [];

    for (let i = 0; i < 500; i++) {
        const p = products[Math.floor(Math.random() * products.length)];
        const date = randomDate(thirtyDaysAgo, now);

        // Pick an event type, skewing towards view/click
        const r = Math.random();
        let eventType = 'VIEW';
        if (r > 0.5) eventType = 'CLICK';
        if (r > 0.8) eventType = 'ADD_TO_CART';
        if (r > 0.95) eventType = 'PURCHASE';

        events.push({
            product_id: p.id,
            event_type: eventType,
            created_at: date,
        });

        const dateStr = date.toISOString().split('T')[0];
        const key = `${p.id}_${dateStr}`;
        if (!performanceDailyMap[key]) {
            performanceDailyMap[key] = {
                product_id: p.id,
                date: new Date(dateStr + "T00:00:00.000Z"),
                click_count: 0,
                add_to_cart_count: 0,
                purchase_count: 0,
                revenue_generated: 0
            };
        }

        if (eventType === 'CLICK') performanceDailyMap[key].click_count++;
        if (eventType === 'ADD_TO_CART') performanceDailyMap[key].add_to_cart_count++;
        if (eventType === 'PURCHASE') {
            performanceDailyMap[key].purchase_count++;
            performanceDailyMap[key].revenue_generated += 100; // dummy value

            // Also generate a fake Order
            orders.push({
                order_number: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
                customer_name: `Customer ${Math.floor(Math.random() * 1000)}`,
                customer_email: `customer${Math.floor(Math.random() * 1000)}@example.com`,
                status: 'DELIVERED',
                subtotal: 100,
                grand_total: 100,
                currency: 'MAD',
                createdAt: date,
                updatedAt: date
            });
        }
    }

    console.log("Inserting ProductEvents...");
    await prisma.productEvent.createMany({
        data: events
    });

    console.log("Inserting Daily Performances...");
    for (const key in performanceDailyMap) {
        const data = performanceDailyMap[key];
        await prisma.productPerformanceDaily.upsert({
            where: {
                product_id_date: { product_id: data.product_id, date: data.date }
            },
            update: {
                click_count: { increment: data.click_count },
                add_to_cart_count: { increment: data.add_to_cart_count },
                purchase_count: { increment: data.purchase_count },
                revenue_generated: { increment: data.revenue_generated }
            },
            create: {
                product_id: data.product_id,
                date: data.date,
                click_count: data.click_count,
                add_to_cart_count: data.add_to_cart_count,
                purchase_count: data.purchase_count,
                revenue_generated: data.revenue_generated
            }
        });
    }

    console.log(`Inserting ${orders.length} fake Orders for earnings stats...`);
    for (const o of orders) {
        await prisma.order.create({
            data: o
        });
    }

    console.log("Done generating data!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
