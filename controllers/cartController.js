const store = require('../services/storeService');

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

  const [allProducts, variant] = await Promise.all([
    store.getProducts(),
    store.getVariantById(variantId)
  ]);

  const product = allProducts.find((p) => p.id === Number(productId));

  if (!product || !variant || variant.product_id !== product.id) {
    return res.status(400).render('shop/error', { message: 'Invalid product selection.' });
  }

  const cart = getCart(req);
  const existing = cart.find((item) => item.variantId === variant.id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, variant.stock);
  } else {
    cart.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      size: variant.size,
      quantity: Math.min(qty, variant.stock),
      price: Number(product.price),
      imageUrl: product.image_url
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
