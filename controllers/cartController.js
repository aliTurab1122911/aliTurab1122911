const db = require('../config/db');
const mockData = require('../data/mockData');
const { isDbUnavailable } = require('../utils/dbFallback');

function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

async function showCart(req, res) {
  const cart = getCart(req);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('shop/cart', { cart, total });
}

async function addToCart(req, res) {
  const { productId, variantId, quantity } = req.body;
  const qty = Math.max(Number(quantity) || 1, 1);
  let selected;

  try {
    const [rows] = await db.query(
      `SELECT p.id AS product_id, p.name, p.slug, p.price,
              v.id AS variant_id, v.size, v.stock,
              COALESCE(pi.image_url, 'https://via.placeholder.com/600x800?text=No+Image') AS image_url
       FROM products p
       JOIN product_variants v ON v.product_id = p.id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
       WHERE p.id = ? AND v.id = ?`,
      [productId, variantId]
    );

    if (!rows.length) {
      return res.status(400).render('shop/error', { message: 'Invalid product selection.' });
    }
    selected = rows[0];
  } catch (error) {
    if (!isDbUnavailable(error)) throw error;
    const fallback = mockData.findVariant(variantId);
    if (!fallback || Number(fallback.product.id) !== Number(productId)) {
      return res.status(400).render('shop/error', { message: 'Invalid product selection.' });
    }
    selected = {
      product_id: fallback.product.id,
      name: fallback.product.name,
      slug: fallback.product.slug,
      price: fallback.product.price,
      variant_id: fallback.variant.id,
      size: fallback.variant.size,
      stock: fallback.variant.stock,
      image_url: fallback.product.image_url
    };
  }

  const cart = getCart(req);
  const existing = cart.find((item) => item.variantId === selected.variant_id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, selected.stock);
  } else {
    cart.push({
      productId: selected.product_id,
      variantId: selected.variant_id,
      name: selected.name,
      slug: selected.slug,
      size: selected.size,
      quantity: Math.min(qty, selected.stock),
      price: Number(selected.price),
      imageUrl: selected.image_url
    });
  }

  req.session.cart = cart;
  return res.redirect('/cart');
}

function updateCart(req, res) {
  const cart = getCart(req);
  const { variantId, quantity } = req.body;
  const item = cart.find((line) => String(line.variantId) === String(variantId));

  if (item) {
    const qty = Number(quantity);
    if (!qty || qty < 1) {
      req.session.cart = cart.filter((line) => String(line.variantId) !== String(variantId));
    } else {
      item.quantity = qty;
    }
  }

  res.redirect('/cart');
}

function removeFromCart(req, res) {
  const { variantId } = req.params;
  const cart = getCart(req).filter((item) => String(item.variantId) !== String(variantId));
  req.session.cart = cart;
  res.redirect('/cart');
}

module.exports = {
  showCart,
  addToCart,
  updateCart,
  removeFromCart
};
