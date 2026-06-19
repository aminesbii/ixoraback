import prisma from './config/prisma.js';

try {
  const product = await prisma.product.findFirst({ where: { name: 'aaaaaa' } });
  if (!product) { console.log('Product not found'); process.exit(0); }
  
  const images = await prisma.productImage.findMany({
    where: { product_id: product.id },
    orderBy: { sort_order: 'asc' }
  });
  
  console.log(`Found ${images.length} images for product "${product.name}"`);
  
  if (images.length >= 1) {
    await prisma.productImage.updateMany({ where: { product_id: product.id }, data: { featured1: false } });
    await prisma.productImage.update({ where: { id: images[0].id }, data: { featured1: true } });
    console.log(`Set featured1 on image: ${images[0].image_url}`);
  }
  
  if (images.length >= 2) {
    await prisma.productImage.updateMany({ where: { product_id: product.id }, data: { featured2: false } });
    await prisma.productImage.update({ where: { id: images[1].id }, data: { featured2: true } });
    console.log(`Set featured2 on image: ${images[1].image_url}`);
  }

  const updated = await prisma.productImage.findMany({
    where: { product_id: product.id },
    orderBy: { sort_order: 'asc' }
  });
  updated.forEach(img => console.log(`  ${img.image_url} | featured1=${img.featured1} featured2=${img.featured2}`));
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
}
