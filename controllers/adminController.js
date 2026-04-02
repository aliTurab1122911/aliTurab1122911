const store = require('../services/storeService');

async function dashboard(req, res) {
  const [sales, latestOrders] = await Promise.all([
    store.dashboardStats(),
    store.getAllOrders()
  ]);

  const lowStock = { low_stock_items: sales.low_stock_items };
  res.render('admin/dashboard', {
    sales: { total_orders: sales.total_orders, total_sales: sales.total_sales },
    lowStock,
    latestOrders: latestOrders.slice(0, 8),
    demoMode: false
  });
}

async function products(req, res) {
  const [items, categories] = await Promise.all([
    store.getProducts(),
    store.getCategories()
  ]);
  res.render('admin/products', { items, categories, demoMode: false });
}

async function createProduct(req, res) {
  const { name, price, categoryId, shortDescription, description, sizeStock } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/600x800?text=No+Image';

  await store.createProduct({
    name,
    price,
    categoryId,
    shortDescription,
    description,
    imagePath,
    sizeStock
  });

  res.redirect('/admin/products');
}

async function showEditProduct(req, res) {
  const [product, categories, variants] = await Promise.all([
    store.getProductById(req.params.id),
    store.getCategories(),
    store.getVariantsByProductId(req.params.id)
  ]);

  if (!product) return res.status(404).render('shop/error', { message: 'Product not found' });

  const sizeStock = variants.map((v) => `${v.size}:${v.stock}`).join(',');
  res.render('admin/edit-product', { product, categories, sizeStock });
}

async function updateProduct(req, res) {
  const { name, price, categoryId, shortDescription, description, sizeStock } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  await store.updateProduct(req.params.id, {
    name,
    price,
    categoryId,
    shortDescription,
    description,
    imagePath,
    sizeStock
  });

  res.redirect('/admin/products');
}

async function toggleProduct(req, res) {
  await store.toggleProduct(req.params.id);
  res.redirect('/admin/products');
}

async function orders(req, res) {
  const items = await store.getAllOrders();
  res.render('admin/orders', { items, demoMode: false });
}

async function updateOrderStatus(req, res) {
  await store.updateOrderStatus(req.params.id, req.body.status);
  res.redirect('/admin/orders');
}

module.exports = {
  dashboard,
  products,
  createProduct,
  showEditProduct,
  updateProduct,
  toggleProduct,
  orders,
  updateOrderStatus
};
