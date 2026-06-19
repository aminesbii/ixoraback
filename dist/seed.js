import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
// Load Environment Variables
dotenv.config({ path: path.resolve(process.cwd(), "config/.env") });
// Import Models
import User from "./models/user.model.js";
import Category from "./models/category.model.js";
import Product from "./models/product.model.js";
import ProductImage from "./models/product_image.model.js";
import ProductVariant from "./models/product_variant.model.js";
import Cart from "./models/cart.model.js";
import CartItem from "./models/cart_item.model.js";
import Order from "./models/order.model.js";
import OrderItem from "./models/order_item.model.js";
import Address from "./models/address.model.js";
import ProductEvent from "./models/product_event.model.js";
import ProductPerformanceDaily from "./models/product_performance_daily.model.js";
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in env variables.");
    process.exit(1);
}
const seedDatabase = async () => {
    try {
        console.log("[Seeder] Connecting to database...");
        await mongoose.connect(MONGO_URI);
        console.log("[Seeder] Connected successfully.");
        // 1. Clear existing collections
        console.log("[Seeder] Clearing old collections...");
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Product.deleteMany({}),
            ProductImage.deleteMany({}),
            ProductVariant.deleteMany({}),
            Cart.deleteMany({}),
            CartItem.deleteMany({}),
            Order.deleteMany({}),
            OrderItem.deleteMany({}),
            Address.deleteMany({}),
            ProductEvent.deleteMany({}),
            ProductPerformanceDaily.deleteMany({}),
        ]);
        console.log("[Seeder] Database cleared.");
        // 2. Seed Users
        console.log("[Seeder] Seeding users...");
        const saltRounds = 10;
        const adminPasswordHash = await bcrypt.hash("admin123", saltRounds);
        const customerPasswordHash = await bcrypt.hash("customer123", saltRounds);
        const adminUser = await User.create({
            full_name: "Xora Admin",
            email: "admin@xora.com",
            phone: "+212600000001",
            passwordHash: adminPasswordHash,
            role: "admin",
            status: "active",
        });
        const customerUser = await User.create({
            full_name: "Amine Customer",
            email: "customer@xora.com",
            phone: "+212611111112",
            passwordHash: customerPasswordHash,
            role: "customer",
            status: "active",
        });
        const secondCustomer = await User.create({
            full_name: "Sarah Miller",
            email: "sarah@example.com",
            phone: "+212622222223",
            passwordHash: customerPasswordHash,
            role: "customer",
            status: "active",
        });
        console.log("[Seeder] Users seeded.");
        // 3. Seed Categories
        console.log("[Seeder] Seeding categories...");
        // Parent categories
        const skincareParent = await Category.create({
            name: "Skincare",
            slug: "skincare",
            parent_id: null,
            sort_order: 1,
            is_active: true,
        });
        const haircareParent = await Category.create({
            name: "Haircare",
            slug: "haircare",
            parent_id: null,
            sort_order: 2,
            is_active: true,
        });
        const wellnessParent = await Category.create({
            name: "Wellness",
            slug: "wellness",
            parent_id: null,
            sort_order: 3,
            is_active: true,
        });
        // Subcategories
        const serumsCat = await Category.create({
            name: "Serums & Treatments",
            slug: "serums-treatments",
            parent_id: skincareParent._id,
            sort_order: 1,
            is_active: true,
        });
        const moisturizersCat = await Category.create({
            name: "Moisturizers",
            slug: "moisturizers",
            parent_id: skincareParent._id,
            sort_order: 2,
            is_active: true,
        });
        const cleansersCat = await Category.create({
            name: "Cleansers",
            slug: "cleansers",
            parent_id: skincareParent._id,
            sort_order: 3,
            is_active: true,
        });
        const shampoosCat = await Category.create({
            name: "Shampoos",
            slug: "shampoos",
            parent_id: haircareParent._id,
            sort_order: 1,
            is_active: true,
        });
        const hairTreatmentsCat = await Category.create({
            name: "Hair Oils & Masks",
            slug: "hair-oils-masks",
            parent_id: haircareParent._id,
            sort_order: 2,
            is_active: true,
        });
        console.log("[Seeder] Categories seeded.");
        // 4. Seed Products
        console.log("[Seeder] Seeding products...");
        const p1 = await Product.create({
            category_id: serumsCat._id,
            name: "Xora Hyaluronic Acid 2% + B5 Serum",
            slug: "xora-hyaluronic-acid-2-b5-serum",
            brand_name: "Xora",
            short_description: "A hydrating formula with ultra-pure, vegan hyaluronic acid and skin-nourishing Vitamin B5.",
            description: "This formulation combines low-, medium- and high-molecular weight hyaluronic acid, as well as a next-generation HA crosspolymer at a combined concentration of 2% for multi-depth hydration. This system is supported with the addition of Vitamin B5 which also enhances surface hydration. A lightweight water-based serum that easily absorbs into the skin.",
            details: {
                indication: "Suitable for all skin types. Best for dryness and fine lines.",
                composition: ["Aqua (Water)", "Sodium Hyaluronate", "Pentylene Glycol", "Propanediol", "Panthenol", "Glycerin"],
                usage: "Apply a few drops to the entire face in the morning and evening after cleansing and before creams/moisturizers."
            },
            status: "active",
            is_featured: true,
        });
        const p2 = await Product.create({
            category_id: serumsCat._id,
            name: "Lumina 15% Vitamin C Glow Booster",
            slug: "lumina-15-vitamin-c-glow-booster",
            brand_name: "Lumina Labs",
            short_description: "A concentrated brightening serum with pure L-Ascorbic Acid, Ferulic Acid, and Vitamin E.",
            description: "Rejuvenate your skin with our high-potency Vitamin C serum. Specially formulated to combat dark spots, hyperpigmentation, and signs of premature aging. Ferulic acid acts as a powerful stabilizer to maximize the antioxidant benefits of Vitamin C, revealing an instant, healthy glow.",
            details: {
                indication: "Ideal for dullness, uneven skin tone, and dark spots.",
                composition: ["Aqua", "Ascorbic Acid (Vitamin C)", "Ethoxydiglycol", "Glycerin", "Tocopherol (Vitamin E)", "Ferulic Acid"],
                usage: "Apply 4-5 drops in the morning to dry, clean face and neck. Gently press with fingertips. Follow with moisturizer and sun protection."
            },
            status: "active",
            is_featured: true,
        });
        const p3 = await Product.create({
            category_id: moisturizersCat._id,
            name: "BioEssence Squalane + Ceramide Barrier Repair Cream",
            slug: "bioessence-squalane-ceramide-barrier-repair-cream",
            brand_name: "BioEssence",
            short_description: "A deeply nourishing, non-greasy cream that strengthens the skin's protective lipid barrier.",
            description: "Our rich, whipped moisturizer delivers intense hydration while reinforcing the skin's barrier. Powered by 100% plant-derived squalane and a complex of 3 essential ceramides, it locks in moisture, improves elasticity, and protects against environmental stressors.",
            details: {
                indication: "Highly recommended for dry, sensitive, or compromised skin.",
                composition: ["Aqua", "Squalane", "Glycerin", "Caprylic/Capric Triglyceride", "Ceramide NP", "Ceramide AP", "Ceramide EOP", "Cholesterol"],
                usage: "Apply to clean skin morning and night. Can be used over serums or treatments."
            },
            status: "active",
            is_featured: false,
        });
        const p4 = await Product.create({
            category_id: shampoosCat._id,
            name: "Xora Moroccan Argan Oil Nourishing Shampoo",
            slug: "xora-moroccan-argan-oil-nourishing-shampoo",
            brand_name: "Xora",
            short_description: "Gently cleanses while infusing hair with essential moisture, antioxidants, and liquid gold argan oil.",
            description: "Treat your locks to the luxurious hydration of Moroccan Argan Oil. This sulfate-free formula cleanses hair without stripping natural oils, restoring softness, shine, and manageability to dry or color-treated hair.",
            details: {
                indication: "For dry, frizzy, or damaged hair types.",
                composition: ["Aqua", "Sodium Lauroyl Methyl Isethionate", "Cocamidopropyl Betaine", "Argania Spinosa (Argan) Kernel Oil", "Hydrolyzed Silk Protein"],
                usage: "Massage into wet hair, lather, and rinse thoroughly. Follow with Xora Argan Oil Conditioner for best results."
            },
            status: "active",
            is_featured: false,
        });
        const p5 = await Product.create({
            category_id: hairTreatmentsCat._id,
            name: "Xora Pure Cold-Pressed Argan Elixir",
            slug: "xora-pure-cold-pressed-argan-elixir",
            brand_name: "Xora",
            short_description: "100% pure organic argan oil to nourish hair, skin, and nails.",
            description: "Rich in Vitamin E and essential fatty acids, this cold-pressed organic oil is a multi-tasking miracle worker. It controls frizz, repairs split ends, hydrates skin, and strengthens dry cuticles. Fast-absorbing and non-greasy.",
            details: {
                indication: "Dry hair, dry skin, split ends, and weak nails.",
                composition: ["100% Pure Argania Spinosa (Argan) Kernel Oil"],
                usage: "For hair: Warm 2-3 drops in hands and run through damp or dry hair. For skin/nails: Apply a few drops directly and massage gently."
            },
            status: "active",
            is_featured: true,
        });
        console.log("[Seeder] Products seeded.");
        // 5. Seed Product Images
        console.log("[Seeder] Seeding product images...");
        await ProductImage.create([
            {
                product_id: p1._id,
                image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
                alt_text: "Xora Hyaluronic Acid Serum dropper bottle",
                sort_order: 1,
                is_main: true,
            },
            {
                product_id: p1._id,
                image_url: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80",
                alt_text: "Xora Hyaluronic Acid Serum details texture",
                sort_order: 2,
                is_main: false,
            },
            {
                product_id: p2._id,
                image_url: "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=600&q=80",
                alt_text: "Lumina Vitamin C bottle standing",
                sort_order: 1,
                is_main: true,
            },
            {
                product_id: p3._id,
                image_url: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80",
                alt_text: "BioEssence Squalane + Ceramide Cream jar",
                sort_order: 1,
                is_main: true,
            },
            {
                product_id: p4._id,
                image_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80",
                alt_text: "Xora Argan Oil Shampoo dispenser bottle",
                sort_order: 1,
                is_main: true,
            },
            {
                product_id: p5._id,
                image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
                alt_text: "Xora Pure Argan Elixir amber bottle",
                sort_order: 1,
                is_main: true,
            },
        ]);
        console.log("[Seeder] Product images seeded.");
        // 6. Seed Product Variants
        console.log("[Seeder] Seeding product variants...");
        const v1_30 = await ProductVariant.create({
            product_id: p1._id,
            sku: "SKU-XORA-HA-30",
            variant_name: "30ml Bottle",
            price: 150.0,
            compare_at_price: 180.0,
            currency: "MAD",
            stock_qty: 45,
            is_active: true,
        });
        const v1_50 = await ProductVariant.create({
            product_id: p1._id,
            sku: "SKU-XORA-HA-50",
            variant_name: "50ml Bottle",
            price: 220.0,
            compare_at_price: 250.0,
            currency: "MAD",
            stock_qty: 120,
            is_active: true,
        });
        const v2_30 = await ProductVariant.create({
            product_id: p2._id,
            sku: "SKU-LUM-VC-30",
            variant_name: "30ml Bottle",
            price: 290.0,
            compare_at_price: 350.0,
            currency: "MAD",
            stock_qty: 30,
            is_active: true,
        });
        const v3_50 = await ProductVariant.create({
            product_id: p3._id,
            sku: "SKU-BIO-CC-50",
            variant_name: "50ml Jar",
            price: 195.0,
            compare_at_price: null,
            currency: "MAD",
            stock_qty: 75,
            is_active: true,
        });
        const v4_250 = await ProductVariant.create({
            product_id: p4._id,
            sku: "SKU-XORA-SH-250",
            variant_name: "250ml",
            price: 90.0,
            compare_at_price: 110.0,
            currency: "MAD",
            stock_qty: 60,
            is_active: true,
        });
        const v4_500 = await ProductVariant.create({
            product_id: p4._id,
            sku: "SKU-XORA-SH-500",
            variant_name: "500ml Family Size",
            price: 155.0,
            compare_at_price: 180.0,
            currency: "MAD",
            stock_qty: 40,
            is_active: true,
        });
        const v5_50 = await ProductVariant.create({
            product_id: p5._id,
            sku: "SKU-XORA-AG-50",
            variant_name: "50ml Dropper",
            price: 125.0,
            compare_at_price: 150.0,
            currency: "MAD",
            stock_qty: 90,
            is_active: true,
        });
        console.log("[Seeder] Product variants seeded.");
        // 7. Seed Cart & CartItems (Customer active cart)
        console.log("[Seeder] Seeding carts...");
        const customerCart = await Cart.create({
            user_id: customerUser._id,
            session_token: null,
            status: "active",
        });
        await CartItem.create([
            {
                cart_id: customerCart._id,
                product_id: p1._id,
                variant_id: v1_50._id,
                quantity: 2,
                unit_price: v1_50.price,
            },
            {
                cart_id: customerCart._id,
                product_id: p3._id,
                variant_id: v3_50._id,
                quantity: 1,
                unit_price: v3_50.price,
            },
        ]);
        console.log("[Seeder] Carts seeded.");
        // 8. Seed Orders, OrderItems & Addresses
        console.log("[Seeder] Seeding orders and historical snapshots...");
        // Order 1: Delivered
        const order1 = await Order.create({
            user_id: customerUser._id,
            session_token: null,
            order_number: "ORD-2026-00001",
            customer_name: customerUser.full_name,
            customer_email: customerUser.email,
            customer_phone: customerUser.phone,
            status: "delivered",
            subtotal: 375.0, // (150 * 1) + (225 * 1)
            discount_total: 25.0,
            shipping_fee: 15.0,
            tax_total: 0.0,
            grand_total: 365.0, // 375 - 25 + 15
            currency: "MAD",
        });
        await OrderItem.create([
            {
                order_id: order1._id,
                product_id: p1._id,
                variant_id: v1_30._id,
                product_name_snapshot: p1.name,
                sku_snapshot: v1_30.sku,
                unit_price_snapshot: 150.0,
                quantity: 1,
                line_total: 150.0,
            },
            {
                order_id: order1._id,
                product_id: p2._id,
                variant_id: v2_30._id,
                product_name_snapshot: p2.name,
                sku_snapshot: v2_30.sku,
                unit_price_snapshot: 225.0, // historical discounted price
                quantity: 1,
                line_total: 225.0,
            },
        ]);
        // Order 2: Processing (Guest checkout)
        const order2 = await Order.create({
            user_id: null,
            session_token: "guest_session_12345abcde",
            order_number: "ORD-2026-00002",
            customer_name: "Jane Doe",
            customer_email: "jane.doe@example.com",
            customer_phone: "+212699999999",
            status: "processing",
            subtotal: 195.0,
            discount_total: 0.0,
            shipping_fee: 15.0,
            tax_total: 0.0,
            grand_total: 210.0,
            currency: "MAD",
        });
        await OrderItem.create([
            {
                order_id: order2._id,
                product_id: p3._id,
                variant_id: v3_50._id,
                product_name_snapshot: p3.name,
                sku_snapshot: v3_50.sku,
                unit_price_snapshot: 195.0,
                quantity: 1,
                line_total: 195.0,
            },
        ]);
        // Addresses for Orders
        await Address.create([
            {
                user_id: null,
                order_id: order1._id,
                type: "shipping",
                full_name: "Amine Customer",
                phone: "+212611111112",
                street: "123 Rue de la Liberté, Apt 4",
                city: "Casablanca",
                postal_code: "20000",
                country: "Morocco",
            },
            {
                user_id: null,
                order_id: order1._id,
                type: "billing",
                full_name: "Amine Customer",
                phone: "+212611111112",
                street: "123 Rue de la Liberté, Apt 4",
                city: "Casablanca",
                postal_code: "20000",
                country: "Morocco",
            },
            {
                user_id: null,
                order_id: order2._id,
                type: "shipping",
                full_name: "Jane Doe",
                phone: "+212699999999",
                street: "456 Avenue Hassan II",
                city: "Marrakech",
                postal_code: "40000",
                country: "Morocco",
            },
        ]);
        // Saved Addresses for Customer
        await Address.create([
            {
                user_id: customerUser._id,
                order_id: null,
                type: "shipping",
                full_name: "Amine Customer Home",
                phone: "+212611111112",
                street: "123 Rue de la Liberté, Apt 4",
                city: "Casablanca",
                postal_code: "20000",
                country: "Morocco",
            },
            {
                user_id: customerUser._id,
                order_id: null,
                type: "billing",
                full_name: "Amine Customer Billing",
                phone: "+212611111112",
                street: "789 Boulevard d'Anfa",
                city: "Casablanca",
                postal_code: "20100",
                country: "Morocco",
            },
        ]);
        console.log("[Seeder] Orders, order items, and addresses seeded.");
        // 9. Seed ProductEvents & Daily Performance (Historical analytics)
        console.log("[Seeder] Seeding product events and daily performance...");
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        // Create 7 days of performance history
        const products = [p1, p2, p3, p4, p5];
        const performanceRecords = [];
        const eventRecords = [];
        for (let i = 6; i >= 0; i--) {
            const targetDate = new Date(now.getTime() - i * oneDay);
            // set to midnight UTC for daily buckets
            const midnightUTC = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));
            for (const product of products) {
                // Random clicks/views/purchases per day
                const clicks = Math.floor(Math.random() * 50) + 10;
                const addCarts = Math.floor(clicks * (Math.random() * 0.2 + 0.05)); // 5% - 25% conv
                const purchases = Math.floor(addCarts * (Math.random() * 0.4 + 0.1)); // 10% - 50% conv
                const revenue = purchases * 150; // simple mock price
                performanceRecords.push({
                    product_id: product._id,
                    date: midnightUTC,
                    click_count: clicks,
                    add_to_cart_count: addCarts,
                    purchase_count: purchases,
                    revenue_generated: revenue,
                });
                // Add some raw events for the last 2 days
                if (i <= 1) {
                    // Views
                    for (let c = 0; c < clicks; c++) {
                        eventRecords.push({
                            product_id: product._id,
                            user_id: Math.random() > 0.5 ? customerUser._id : null,
                            session_token: "sess_" + Math.random().toString(36).substring(7),
                            event_type: "view",
                            created_at: new Date(midnightUTC.getTime() + Math.random() * oneDay),
                        });
                    }
                    // Purchases
                    for (let p = 0; p < purchases; p++) {
                        eventRecords.push({
                            product_id: product._id,
                            user_id: customerUser._id,
                            session_token: null,
                            event_type: "purchase",
                            created_at: new Date(midnightUTC.getTime() + Math.random() * oneDay),
                        });
                    }
                }
            }
        }
        await ProductPerformanceDaily.create(performanceRecords);
        await ProductEvent.insertMany(eventRecords);
        console.log("[Seeder] Analytics data seeded.");
        console.log("[Seeder] Database seeding completed successfully!");
    }
    catch (error) {
        console.error("[Seeder] Error seeding database:", error);
    }
    finally {
        await mongoose.disconnect();
        console.log("[Seeder] Database disconnected.");
    }
};
seedDatabase();
