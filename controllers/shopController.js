const db = require('../config/db');

async function home(req, res) {
  const [featured] = await db.query(
    `SELECT p.id, p.name, p.slug, p.price, p.short_description,
            COALESCE(pi.image_url, 'https://via.placeholder.com/600x800?text=No+Image') AS image_url
     FROM products p
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
     WHERE p.is_active = 1
     ORDER BY p.created_at DESC
     LIMIT 8`
  );

  res.render('shop/home', { featured });
}

async function products(req, res) {
  const { category, q, sort } = req.query;

  let query =
    `SELECT p.id, p.name, p.slug, p.price, p.short_description,
            c.name AS category_name,
            COALESCE(pi.image_url, 'https://via.placeholder.com/600x800?text=No+Image') AS image_url
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
     WHERE p.is_active = 1`;
  const params = [];

  if (category) {
    query += ' AND c.slug = ?';
    params.push(category);
  }

  if (q) {
    query += ' AND (p.name LIKE ? OR p.short_description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
  else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
  else query += ' ORDER BY p.created_at DESC';

  const [[categories], [items]] = await Promise.all([
    db.query('SELECT id, name, slug FROM categories ORDER BY name'),
    db.query(query, params)
  ]);

  res.render('shop/products', { categories, items, filters: { category, q, sort } });
}

async function productDetail(req, res) {
  const { slug } = req.params;

  const [products] = await db.query(
    `SELECT p.id, p.name, p.slug, p.price, p.description,
            c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ? AND p.is_active = 1`,
    [slug]
  );

  if (!products.length) {
    return res.status(404).render('shop/error', { message: 'Product not found' });
  }

  const product = products[0];
  const [images] = await db.query('SELECT image_url, alt_text FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC', [product.id]);
  const [variants] = await db.query('SELECT id, size, stock, sku FROM product_variants WHERE product_id = ? ORDER BY size', [product.id]);

  return res.render('shop/product-detail', { product, images, variants });
}

module.exports = {
  home,
  products,
  productDetail
};
