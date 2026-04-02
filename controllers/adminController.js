const db = require('../config/db');

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function dashboard(req, res) {
  const [[sales]] = await db.query('SELECT COUNT(*) AS total_orders, COALESCE(SUM(total_amount), 0) AS total_sales FROM orders');
  const [[lowStock]] = await db.query('SELECT COUNT(*) AS low_stock_items FROM product_variants WHERE stock <= 5');
  const [latestOrders] = await db.query('SELECT id, customer_name, status, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 8');

  res.render('admin/dashboard', { sales, lowStock, latestOrders });
}

async function products(req, res) {
  const [items] = await db.query(
    `SELECT p.id, p.name, p.slug, p.price, p.is_active, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.created_at DESC`
  );
  const [categories] = await db.query('SELECT id, name FROM categories ORDER BY name');
  res.render('admin/products', { items, categories });
}

async function createProduct(req, res) {
  const { name, price, categoryId, shortDescription, description, imageUrl, sizeStock } = req.body;
  const slug = slugify(name);

  const [result] = await db.query(
    `INSERT INTO products (name, slug, price, category_id, short_description, description, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [name, slug, price, categoryId || null, shortDescription || null, description || null]
  );

  const productId = result.insertId;
  await db.query('INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)', [productId, imageUrl || 'https://via.placeholder.com/600x800?text=No+Image', name]);

  const parsed = (sizeStock || 'S:10,M:10,L:10').split(',').map((entry) => entry.trim()).filter(Boolean);
  for (const pair of parsed) {
    const [size, stock] = pair.split(':');
    if (!size) continue;
    await db.query(
      'INSERT INTO product_variants (product_id, size, stock, sku) VALUES (?, ?, ?, ?)',
      [productId, size.trim().toUpperCase(), Number(stock || 0), `${slug}-${size.trim().toUpperCase()}`]
    );
  }

  res.redirect('/admin/products');
}

async function toggleProduct(req, res) {
  const { id } = req.params;
  await db.query('UPDATE products SET is_active = NOT is_active WHERE id = ?', [id]);
  res.redirect('/admin/products');
}

async function orders(req, res) {
  const [items] = await db.query('SELECT id, customer_name, customer_email, status, total_amount, created_at FROM orders ORDER BY created_at DESC');
  res.render('admin/orders', { items });
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  res.redirect('/admin/orders');
}

module.exports = {
  dashboard,
  products,
  createProduct,
  toggleProduct,
  orders,
  updateOrderStatus
};
