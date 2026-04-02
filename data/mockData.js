const categories = [
  { id: 1, name: 'Women', slug: 'women' },
  { id: 2, name: 'Men', slug: 'men' },
  { id: 3, name: 'Accessories', slug: 'accessories' }
];

const products = [
  {
    id: 101,
    name: 'Ivory Satin Dress',
    slug: 'ivory-satin-dress',
    price: 89,
    short_description: 'Elegant satin silhouette with minimal seams.',
    description: 'A timeless ivory satin dress designed for evening wear with a modern neckline.',
    category_id: 1,
    category_name: 'Women',
    image_url: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=900&q=80',
    is_active: 1,
    variants: [
      { id: 1001, size: 'S', stock: 10, sku: 'ivory-satin-dress-S' },
      { id: 1002, size: 'M', stock: 10, sku: 'ivory-satin-dress-M' },
      { id: 1003, size: 'L', stock: 10, sku: 'ivory-satin-dress-L' }
    ]
  },
  {
    id: 102,
    name: 'Classic Linen Shirt',
    slug: 'classic-linen-shirt',
    price: 54,
    short_description: 'Breathable linen shirt for everyday luxury.',
    description: 'Premium linen shirt with tailored cuffs and a relaxed modern fit.',
    category_id: 2,
    category_name: 'Men',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    is_active: 1,
    variants: [
      { id: 1004, size: 'S', stock: 10, sku: 'classic-linen-shirt-S' },
      { id: 1005, size: 'M', stock: 10, sku: 'classic-linen-shirt-M' },
      { id: 1006, size: 'L', stock: 10, sku: 'classic-linen-shirt-L' }
    ]
  }
];

function findProductBySlug(slug) {
  return products.find((p) => p.slug === slug && p.is_active);
}

function findVariant(variantId) {
  for (const p of products) {
    const variant = p.variants.find((v) => v.id === Number(variantId));
    if (variant) return { product: p, variant };
  }
  return null;
}

module.exports = {
  categories,
  products,
  findProductBySlug,
  findVariant
};
