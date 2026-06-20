import prisma from "./config/prisma.js";

import { trackEvent } from "./services/analytics.service.js";

async function test() {
  try {
    console.log("Calling trackEvent with a valid product ID...");
    const result = await trackEvent({
      productId: "8cdfc7d7-96cd-4929-aaef-ead2ce07b60a",
      userId: null,
      sessionToken: "test-session",
      eventType: "CLICK"
    });
    console.log("trackEvent returned:", result);
  } catch (err) {
    console.error("Error occurred in trackEvent:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
