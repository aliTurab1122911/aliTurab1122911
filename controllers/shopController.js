const store = require('../services/storeService');

async function home(req, res) {
  const allProducts = await store.getProducts();
  const featured = allProducts.filter((p) => p.is_active).slice(0, 8);
  res.render('shop/home', { featured, demoMode: false });
}

async function products(req, res) {
  const { category, q, sort } = req.query;
  const categories = await store.getCategories();
  let items = (await store.getProducts()).filter((p) => p.is_active);

  if (category) {
    const cat = categories.find((c) => c.slug === category);
    items = items.filter((p) => p.category_id === (cat ? cat.id : -1));
  }

  if (q) {
    const needle = String(q).toLowerCase();
    items = items.filter((p) => `${p.name} ${p.short_description}`.toLowerCase().includes(needle));
  }

  if (sort === 'price_asc') items.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') items.sort((a, b) => b.price - a.price);
  else items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.render('shop/products', { categories, items, filters: { category, q, sort }, demoMode: false });
}

async function productDetail(req, res) {
  const { slug } = req.params;
  const product = await store.getProductBySlug(slug);

  if (!product || !product.is_active) {
    return res.status(404).render('shop/error', { message: 'Product not found' });
  }

  const variants = await store.getVariantsByProductId(product.id);
  const images = [{ image_url: product.image_url, alt_text: product.name }];

  return res.render('shop/product-detail', { product, images, variants, demoMode: false });
}

function about(req, res) {
  res.render('shop/about');
}

function contact(req, res) {
  res.render('shop/contact');
}

module.exports = {
  home,
  products,
  productDetail,
  about,
  contact
};
