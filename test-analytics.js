import { getEarningsStats } from './services/order.service.js';

async function main() {
    try {
        const data = await getEarningsStats(30);
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("DEBUG ERROR:", err);
    }
}

main();
