const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const db = require('../config/db');

dotenv.config();

async function run() {
  const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await db.query(stmt);
  }

  const categories = [
    ['Women', 'women'],
    ['Men', 'men'],
    ['Accessories', 'accessories']
  ];

  for (const [name, slug] of categories) {
    await db.query('INSERT IGNORE INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
  }

  const [[adminExists]] = await db.query('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['admin']);
  if (!adminExists.count) {
    const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Store Admin', process.env.ADMIN_EMAIL || 'admin@fashionbrand.com', password, 'admin']
    );
  }

  const [existingProducts] = await db.query('SELECT id FROM products LIMIT 1');
  if (!existingProducts.length) {
    const [[women]] = await db.query('SELECT id FROM categories WHERE slug = ?', ['women']);
    const [[men]] = await db.query('SELECT id FROM categories WHERE slug = ?', ['men']);
    const sampleProducts = [
      {
        name: 'Ivory Satin Dress', slug: 'ivory-satin-dress', categoryId: women.id, price: 89.0,
        short: 'Elegant satin silhouette with minimal seams.',
        description: 'A timeless ivory satin dress designed for evening wear with a modern neckline.',
        image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=900&q=80'
      },
      {
        name: 'Classic Linen Shirt', slug: 'classic-linen-shirt', categoryId: men.id, price: 54.0,
        short: 'Breathable linen shirt for everyday luxury.',
        description: 'Premium linen shirt with tailored cuffs and a relaxed modern fit.',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
      }
    ];

    for (const product of sampleProducts) {
      const [result] = await db.query(
        `INSERT INTO products (name, slug, category_id, price, short_description, description, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [product.name, product.slug, product.categoryId, product.price, product.short, product.description]
      );

      const productId = result.insertId;
      await db.query('INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)', [productId, product.image, product.name]);
      for (const size of ['S', 'M', 'L']) {
        await db.query('INSERT INTO product_variants (product_id, size, stock, sku) VALUES (?, ?, ?, ?)', [productId, size, 15, `${product.slug}-${size}`]);
      }
    }
  }

  console.log('Database initialized with schema + seed data.');
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
