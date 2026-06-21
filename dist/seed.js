import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import prisma from "./config/prisma.js";
dotenv.config({ path: path.resolve(process.cwd(), "config/.env") });
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const CUSTOMER_EMAIL = "customer@gmail.com";
const productSeedData = [
    {
        name: "Xora Hydrating Serum",
        slug: "xora-hydrating-serum",
        brand_name: "Xora",
        short_description: "A lightweight serum that boosts hydration and leaves skin smoother.",
        description: "A hydrating serum infused with hyaluronic acid and panthenol for deep moisture retention.",
        status: "ACTIVE",
        is_featured: true,
        details: {
            indication: "Suitable for all skin types.",
            composition: ["Hyaluronic Acid", "Panthenol", "Glycerin"],
            usage: "Apply 2-3 drops on clean skin morning and night.",
        },
        variantData: [
            { sku: "SKU-XORA-HS-30", variant_name: "30ml", price: 149, compare_at_price: 179, stock_qty: 45 },
            { sku: "SKU-XORA-HS-50", variant_name: "50ml", price: 219, compare_at_price: 249, stock_qty: 32 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
                alt_text: "Hydrating serum bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Vitamin C Glow Booster",
        slug: "vitamin-c-glow-booster",
        brand_name: "Lumina",
        short_description: "Brightening serum that helps reduce dullness and uneven tone.",
        description: "A potent vitamin C serum with antioxidants to support glow and radiance.",
        status: "ACTIVE",
        is_featured: true,
        details: {
            indication: "Best for dull or uneven skin tone.",
            composition: ["Vitamin C", "Ferulic Acid", "Vitamin E"],
            usage: "Use once daily in the morning before moisturizer.",
        },
        variantData: [
            { sku: "SKU-LUM-VC-30", variant_name: "30ml", price: 189, compare_at_price: 229, stock_qty: 38 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=600&q=80",
                alt_text: "Vitamin C serum bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Ceramide Barrier Cream",
        slug: "ceramide-barrier-cream",
        brand_name: "BioEssence",
        short_description: "Rich moisturizer that strengthens the skin barrier.",
        description: "A creamy moisturizer that nourishes dry skin and helps lock in moisture.",
        status: "ACTIVE",
        is_featured: false,
        details: {
            indication: "Ideal for dry and sensitive skin.",
            composition: ["Ceramides", "Squalane", "Shea Butter"],
            usage: "Apply after cleansing and serum use.",
        },
        variantData: [
            { sku: "SKU-BIO-CC-50", variant_name: "50ml", price: 169, compare_at_price: 199, stock_qty: 50 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80",
                alt_text: "Ceramide cream jar",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Argan Nourish Shampoo",
        slug: "argan-nourish-shampoo",
        brand_name: "Xora",
        short_description: "Sulfate-free shampoo for soft, healthy-looking hair.",
        description: "A nourishing shampoo that cleanses gently while reinforcing hair shine and softness.",
        status: "ACTIVE",
        is_featured: false,
        details: {
            indication: "Great for dry and frizzy hair.",
            composition: ["Argan Oil", "Biotin", "Aloe Vera"],
            usage: "Massage into wet hair and rinse thoroughly.",
        },
        variantData: [
            { sku: "SKU-XORA-SH-250", variant_name: "250ml", price: 99, compare_at_price: 119, stock_qty: 40 },
            { sku: "SKU-XORA-SH-500", variant_name: "500ml", price: 159, compare_at_price: 189, stock_qty: 28 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80",
                alt_text: "Shampoo bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Cold Pressed Argan Elixir",
        slug: "cold-pressed-argan-elixir",
        brand_name: "Xora",
        short_description: "Multi-use oil that smooths hair and nourishes skin.",
        description: "A cold-pressed argan oil crafted to help tame frizz and support soft skin.",
        status: "ACTIVE",
        is_featured: true,
        details: {
            indication: "Suitable for hair, skin, and nails.",
            composition: ["Argan Oil", "Vitamin E"],
            usage: "Apply a few drops to hair, skin, or cuticles.",
        },
        variantData: [
            { sku: "SKU-XORA-AE-50", variant_name: "50ml", price: 129, compare_at_price: 149, stock_qty: 55 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
                alt_text: "Argan oil bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Gentle Face Cleanser",
        slug: "gentle-face-cleanser",
        brand_name: "PureGlow",
        short_description: "A soothing cleanser that removes impurities without drying skin.",
        description: "A gentle daily cleanser formulated to refresh the skin while preserving moisture balance.",
        status: "ACTIVE",
        is_featured: false,
        details: {
            indication: "Perfect for daily cleansing.",
            composition: ["Aloe Vera", "Chamomile", "Glycerin"],
            usage: "Massage onto damp skin, then rinse well.",
        },
        variantData: [
            { sku: "SKU-PG-FC-150", variant_name: "150ml", price: 79, compare_at_price: 99, stock_qty: 36 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80",
                alt_text: "Face cleanser bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Retinol Night Repair Serum",
        slug: "retinol-night-repair-serum",
        brand_name: "Xora",
        short_description: "Advanced retinol serum for nighttime skin renewal.",
        description: "A concentrated retinol serum that helps reduce fine lines and improve skin texture overnight.",
        status: "ACTIVE",
        is_featured: true,
        details: {
            indication: "Best for mature or aging skin.",
            composition: ["Retinol", "Peptides", "Ceramides"],
            usage: "Apply a pea-sized amount to clean skin before bed.",
        },
        variantData: [
            { sku: "SKU-XORA-RN-30", variant_name: "30ml", price: 249, compare_at_price: 299, stock_qty: 25 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?auto=format&fit=crop&w=600&q=80",
                alt_text: "Retinol serum dropper bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Niacinamide Brightening Toner",
        slug: "niacinamide-brightening-toner",
        brand_name: "Lumina",
        short_description: "Pore-refining toner that evens out skin tone.",
        description: "A gentle toner infused with niacinamide and zinc to balance oil production and brighten complexion.",
        status: "ACTIVE",
        is_featured: false,
        details: {
            indication: "Ideal for combination and oily skin.",
            composition: ["Niacinamide", "Zinc PCA", "Green Tea Extract"],
            usage: "Apply with a cotton pad after cleansing twice daily.",
        },
        variantData: [
            { sku: "SKU-LUM-NB-150", variant_name: "150ml", price: 139, compare_at_price: 169, stock_qty: 40 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80",
                alt_text: "Toner bottle with cotton pad",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Leave-In Hair Conditioner",
        slug: "leave-in-hair-conditioner",
        brand_name: "Xora",
        short_description: "Weightless leave-in conditioner for detangling and shine.",
        description: "A nourishing leave-in conditioner that hydrates hair, reduces frizz, and adds a healthy sheen.",
        status: "ACTIVE",
        is_featured: false,
        details: {
            indication: "Great for curly, dry, or damaged hair.",
            composition: ["Coconut Oil", "Silk Proteins", "Panthenol"],
            usage: "Spray onto damp hair and style as usual.",
        },
        variantData: [
            { sku: "SKU-XORA-LC-200", variant_name: "200ml", price: 89, compare_at_price: 109, stock_qty: 50 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80",
                alt_text: "Leave-in conditioner spray bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Eucalyptus Body Lotion",
        slug: "eucalyptus-body-lotion",
        brand_name: "BioEssence",
        short_description: "Cooling body lotion with eucalyptus for refreshed skin.",
        description: "A lightweight, fast-absorbing body lotion enriched with eucalyptus oil and shea butter for deep hydration.",
        status: "ACTIVE",
        is_featured: false,
        details: {
            indication: "Best for post-workout or warm weather.",
            composition: ["Eucalyptus Oil", "Shea Butter", "Aloe Vera"],
            usage: "Apply generously to body after shower.",
        },
        variantData: [
            { sku: "SKU-BIO-EB-250", variant_name: "250ml", price: 119, compare_at_price: null, stock_qty: 35 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1600924779117-927b4f81457d?auto=format&fit=crop&w=600&q=80",
                alt_text: "Body lotion pump bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "SPF 50 Sunscreen Fluid",
        slug: "spf-50-sunscreen-fluid",
        brand_name: "PureGlow",
        short_description: "Lightweight sunscreen with broad-spectrum SPF 50 protection.",
        description: "A non-greasy sunscreen fluid that protects against UVA/UVB rays while keeping skin hydrated.",
        status: "ACTIVE",
        is_featured: true,
        details: {
            indication: "Suitable for all skin types, including sensitive.",
            composition: ["Zinc Oxide", "Vitamin E", "Aloe Vera"],
            usage: "Apply 15 minutes before sun exposure. Reapply every 2 hours.",
        },
        variantData: [
            { sku: "SKU-PG-SP50-50", variant_name: "50ml", price: 159, compare_at_price: 189, stock_qty: 30 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=600&q=80",
                alt_text: "Sunscreen tube",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Jasmine Perfume Oil",
        slug: "jasmine-perfume-oil",
        brand_name: "Xora",
        short_description: "Concentrated jasmine perfume oil for a lasting floral scent.",
        description: "A rich, alcohol-free perfume oil crafted from jasmine blossoms for a warm and elegant fragrance.",
        status: "ACTIVE",
        is_featured: false,
        details: {
            indication: "Suitable for daily wear and special occasions.",
            composition: ["Jasmine Absolute", "Sandalwood Oil", "Vanillin"],
            usage: "Apply to pulse points: wrists, neck, and behind ears.",
        },
        variantData: [
            { sku: "SKU-XORA-JP-10", variant_name: "10ml", price: 199, compare_at_price: 249, stock_qty: 20 },
            { sku: "SKU-XORA-JP-30", variant_name: "30ml", price: 429, compare_at_price: 499, stock_qty: 12 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80",
                alt_text: "Perfume oil bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Beard Grooming Kit",
        slug: "beard-grooming-kit",
        brand_name: "Xora",
        short_description: "Complete beard care set with oil, balm, and comb.",
        description: "A premium grooming kit featuring beard oil, softening balm, and a wooden comb for a well-groomed beard.",
        status: "ACTIVE",
        is_featured: false,
        details: {
            indication: "Designed for all beard lengths.",
            composition: ["Jojoba Oil", "Beeswax", "Argan Oil"],
            usage: "Apply oil daily, balm for shaping and styling.",
        },
        variantData: [
            { sku: "SKU-XORA-BK-01", variant_name: "Standard Kit", price: 299, compare_at_price: 359, stock_qty: 15 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=600&q=80",
                alt_text: "Beard grooming kit with tools",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
    {
        name: "Vitamin D3 + K2 Supplement",
        slug: "vitamin-d3-k2-supplement",
        brand_name: "Xora Wellness",
        short_description: "Daily immunity and bone health supplement.",
        description: "A high-potency Vitamin D3 and K2 supplement to support immune function, bone density, and calcium absorption.",
        status: "ACTIVE",
        is_featured: true,
        details: {
            indication: "Recommended for adults with limited sun exposure.",
            composition: ["Vitamin D3 (2000 IU)", "Vitamin K2 (MK-7, 100 mcg)"],
            usage: "Take one softgel daily with a meal.",
        },
        variantData: [
            { sku: "SKU-XW-D3-60", variant_name: "60 Softgels", price: 89, compare_at_price: 109, stock_qty: 100 },
            { sku: "SKU-XW-D3-120", variant_name: "120 Softgels", price: 149, compare_at_price: 179, stock_qty: 60 },
        ],
        imageData: [
            {
                image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
                alt_text: "Vitamin supplement bottle",
                sort_order: 1,
                is_main: true,
            },
        ],
    },
];
async function main() {
    console.log("[Seeder] Starting database seed...");
    // 1. Clean Up Tables
    await prisma.$transaction([
        prisma.productEvent.deleteMany(),
        prisma.productPerformanceDaily.deleteMany(),
        prisma.cartItem.deleteMany(),
        prisma.orderItem.deleteMany(),
        prisma.address.deleteMany(),
        prisma.order.deleteMany(),
        prisma.cart.deleteMany(),
        prisma.productImage.deleteMany(),
        prisma.productVariant.deleteMany(),
        prisma.product.deleteMany(),
        prisma.category.deleteMany(),
        prisma.user.deleteMany(),
    ]);
    console.log("[Seeder] Existing data removed.");
    // 2. Seed Users
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const adminUser = await prisma.user.create({
        data: {
            full_name: "Admin User",
            email: ADMIN_EMAIL,
            phone: "+212600000001",
            passwordHash: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
        },
    });
    console.log(`[Seeder] Created admin user: ${adminUser.email}`);
    const customerUser = await prisma.user.create({
        data: {
            full_name: "Amine Customer",
            email: CUSTOMER_EMAIL,
            phone: "+212611111112",
            passwordHash: hashedPassword,
            role: "CUSTOMER",
            status: "ACTIVE",
        },
    });
    console.log(`[Seeder] Created customer user: ${customerUser.email}`);
    // 3. Seed Categories
    const categories = await prisma.$transaction([
        prisma.category.create({ data: { name: "Skincare", slug: "skincare", sort_order: 1 } }),
        prisma.category.create({ data: { name: "Haircare", slug: "haircare", sort_order: 2 } }),
        prisma.category.create({ data: { name: "Wellness", slug: "wellness", sort_order: 3 } }),
        prisma.category.create({ data: { name: "Bodycare", slug: "bodycare", sort_order: 4 } }),
        prisma.category.create({ data: { name: "Sunscreen", slug: "sunscreen", sort_order: 5 } }),
        prisma.category.create({ data: { name: "Fragrance", slug: "fragrance", sort_order: 6 } }),
        prisma.category.create({ data: { name: "Men's Grooming", slug: "mens-grooming", sort_order: 7 } }),
        prisma.category.create({ data: { name: "Baby Care", slug: "baby-care", sort_order: 8 } }),
        prisma.category.create({ data: { name: "Oral Care", slug: "oral-care", sort_order: 9 } }),
        prisma.category.create({ data: { name: "Makeup", slug: "makeup", sort_order: 10 } }),
        prisma.category.create({ data: { name: "Supplements", slug: "supplements", sort_order: 11 } }),
    ]);
    const categoryMap = Object.fromEntries(categories.map((category) => [category.slug, category]));
    // 4. Seed Products, Variants, Images
    console.log("[Seeder] Seeding products...");
    const seededProducts = [];
    for (const productData of productSeedData) {
        const categoryKey = productData.slug.includes("argan") || productData.slug.includes("shampoo") || productData.slug.includes("elixir") || productData.slug.includes("leave-in") || productData.slug.includes("conditioner")
            ? "haircare"
            : productData.slug.includes("cleanser") || productData.slug.includes("serum") || productData.slug.includes("cream") || productData.slug.includes("retinol") || productData.slug.includes("toner")
                ? "skincare"
                : productData.slug.includes("body-lotion")
                    ? "bodycare"
                    : productData.slug.includes("sunscreen") || productData.slug.includes("spf")
                        ? "sunscreen"
                        : productData.slug.includes("perfume") || productData.slug.includes("jasmine")
                            ? "fragrance"
                            : productData.slug.includes("beard") || productData.slug.includes("grooming")
                                ? "mens-grooming"
                                : productData.slug.includes("d3") || productData.slug.includes("supplement")
                                    ? "supplements"
                                    : "wellness";
        const category = categoryMap[categoryKey];
        const product = await prisma.product.create({
            data: {
                category_id: category.id,
                name: productData.name,
                slug: productData.slug,
                brand_name: productData.brand_name,
                short_description: productData.short_description,
                description: productData.description,
                details: productData.details,
                status: productData.status,
                is_featured: productData.is_featured,
            },
        });
        const variants = [];
        for (const variant of productData.variantData) {
            const createdVariant = await prisma.productVariant.create({
                data: {
                    product_id: product.id,
                    sku: variant.sku,
                    variant_name: variant.variant_name,
                    price: variant.price,
                    compare_at_price: variant.compare_at_price,
                    currency: "MAD",
                    stock_qty: variant.stock_qty,
                    is_active: true,
                },
            });
            variants.push(createdVariant);
        }
        await prisma.productImage.createMany({
            data: productData.imageData.map((image, index) => ({
                product_id: product.id,
                image_url: image.image_url,
                alt_text: image.alt_text,
                sort_order: image.sort_order ?? index + 1,
                is_main: image.is_main ?? index === 0,
            })),
        });
        seededProducts.push({ ...product, variants });
        console.log(`[Seeder] Seeded product: ${product.name}`);
    }
    const p1 = seededProducts.find((p) => p.slug === "xora-hydrating-serum");
    const p2 = seededProducts.find((p) => p.slug === "vitamin-c-glow-booster");
    const p3 = seededProducts.find((p) => p.slug === "ceramide-barrier-cream");
    // 5. Seed Carts (Fixed Syntax)
    await prisma.cart.create({
        data: {
            user: {
                connect: { id: customerUser.id }
            },
            cartItems: {
                create: [
                    {
                        product: { connect: { id: p1.id } },
                        variant: { connect: { id: p1.variants[0].id } },
                        quantity: 2,
                        unit_price: p1.variants[0].price,
                    },
                ],
            },
        },
    });
    console.log("[Seeder] Carts seeded.");
    // 6. Seed Orders, OrderItems (Fixed Syntax)
    console.log("[Seeder] Seeding orders and historical snapshots...");
    // Order 1: Registered Customer Order
    const order1 = await prisma.order.create({
        data: {
            user: {
                connect: { id: customerUser.id }
            },
            session_token: null,
            order_number: "ORD-2026-00001",
            customer_name: customerUser.full_name,
            customer_email: customerUser.email,
            customer_phone: customerUser.phone,
            status: "DELIVERED",
            subtotal: 375.0,
            discount_total: 25.0,
            shipping_fee: 15.0,
            tax_total: 0.0,
            grand_total: 365.0,
            currency: "MAD",
            orderItems: {
                create: [
                    {
                        product: { connect: { id: p1.id } },
                        variant: { connect: { id: p1.variants[0].id } },
                        product_name_snapshot: p1.name,
                        sku_snapshot: p1.variants[0].sku,
                        unit_price_snapshot: 150.0,
                        quantity: 1,
                        line_total: 150.0,
                    },
                    {
                        product: { connect: { id: p2.id } },
                        variant: { connect: { id: p2.variants[0].id } },
                        product_name_snapshot: p2.name,
                        sku_snapshot: p2.variants[0].sku,
                        unit_price_snapshot: 225.0,
                        quantity: 1,
                        line_total: 225.0,
                    },
                ],
            },
        },
    });
    // Order 2: Guest Checkout Order
    const order2 = await prisma.order.create({
        data: {
            session_token: "guest_session_12345abcde",
            order_number: "ORD-2026-00002",
            customer_name: "Jane Doe",
            customer_email: "jane.doe@example.com",
            customer_phone: "+212699999999",
            status: "PROCESSING",
            subtotal: 195.0,
            discount_total: 0.0,
            shipping_fee: 15.0,
            tax_total: 0.0,
            grand_total: 210.0,
            currency: "MAD",
            orderItems: {
                create: [
                    {
                        product: { connect: { id: p3.id } },
                        variant: { connect: { id: p3.variants[0].id } },
                        product_name_snapshot: p3.name,
                        sku_snapshot: p3.variants[0].sku,
                        unit_price_snapshot: 195.0,
                        quantity: 1,
                        line_total: 195.0,
                    },
                ],
            },
        },
    });
    // 7. Seed Addresses
    await prisma.address.createMany({
        data: [
            {
                user_id: null,
                order_id: order1.id,
                type: "SHIPPING",
                full_name: "Amine Customer",
                phone: "+212611111112",
                street: "123 Rue de la Liberté, Apt 4",
                city: "Casablanca",
                postal_code: "20000",
                country: "Morocco",
            },
            {
                user_id: null,
                order_id: order1.id,
                type: "BILLING",
                full_name: "Amine Customer",
                phone: "+212611111112",
                street: "123 Rue de la Liberté, Apt 4",
                city: "Casablanca",
                postal_code: "20000",
                country: "Morocco",
            },
            {
                user_id: null,
                order_id: order2.id,
                type: "SHIPPING",
                full_name: "Jane Doe",
                phone: "+212699999999",
                street: "456 Avenue Hassan II",
                city: "Marrakech",
                postal_code: "40000",
                country: "Morocco",
            },
            {
                user_id: customerUser.id,
                order_id: null,
                type: "SHIPPING",
                full_name: "Amine Customer Home",
                phone: "+212611111112",
                street: "123 Rue de la Liberté, Apt 4",
                city: "Casablanca",
                postal_code: "20000",
                country: "Morocco",
            },
            {
                user_id: customerUser.id,
                order_id: null,
                type: "BILLING",
                full_name: "Amine Customer Billing",
                phone: "+212611111112",
                street: "789 Boulevard d'Anfa",
                city: "Casablanca",
                postal_code: "20100",
                country: "Morocco",
            },
        ],
    });
    console.log("[Seeder] Orders, order items, and addresses seeded.");
    // 8. Analytics Data (ProductEvents & Performance)
    console.log("[Seeder] Seeding product events and daily performance...");
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const performanceRecords = [];
    const eventRecords = [];
    for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(now.getTime() - i * oneDay);
        const midnightUTC = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));
        for (const product of seededProducts) {
            const clicks = Math.floor(Math.random() * 50) + 10;
            const addCarts = Math.floor(clicks * (Math.random() * 0.2 + 0.05));
            const purchases = Math.floor(addCarts * (Math.random() * 0.4 + 0.1));
            const revenue = purchases * 150;
            performanceRecords.push({
                product_id: product.id,
                date: midnightUTC,
                click_count: clicks,
                add_to_cart_count: addCarts,
                purchase_count: purchases,
                revenue_generated: revenue,
            });
            if (i <= 1) {
                for (let c = 0; c < clicks; c++) {
                    eventRecords.push({
                        product_id: product.id,
                        user_id: Math.random() > 0.5 ? customerUser.id : null,
                        session_token: "sess_" + Math.random().toString(36).substring(7),
                        event_type: "VIEW",
                        created_at: new Date(midnightUTC.getTime() + Math.random() * oneDay),
                    });
                }
                for (let p = 0; p < purchases; p++) {
                    eventRecords.push({
                        product_id: product.id,
                        user_id: customerUser.id,
                        session_token: null,
                        event_type: "PURCHASE",
                        created_at: new Date(midnightUTC.getTime() + Math.random() * oneDay),
                    });
                }
            }
        }
    }
    await prisma.productPerformanceDaily.createMany({ data: performanceRecords });
    await prisma.productEvent.createMany({ data: eventRecords });
    console.log("[Seeder] Analytics data seeded.");
    console.log("[Seeder] Database seeding completed successfully!");
}
main()
    .catch((error) => {
    console.error("[Seeder] Error seeding database:", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
