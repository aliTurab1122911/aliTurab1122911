const db = require('../config/db');
const { isDbUnavailable } = require('../utils/dbFallback');

function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function showCheckout(req, res) {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect('/cart');

  const total = calculateTotal(cart);
  res.render('shop/checkout', { cart, total, error: null });
}

async function placeOrder(req, res) {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect('/cart');

  const { fullName, email, phone, addressLine1, city, state, postalCode, country } = req.body;
  if (!fullName || !email || !addressLine1 || !city || !country) {
    return res.render('shop/checkout', { cart, total: calculateTotal(cart), error: 'Please fill all required fields.' });
  }

  const totalAmount = calculateTotal(cart);

  try {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [orderResult] = await conn.query(
        `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, address_line1, city, state, postal_code, country, status, total_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [req.session.user ? req.session.user.id : null, fullName, email, phone || null, addressLine1, city, state || null, postalCode || null, country, totalAmount]
      );

      const orderId = orderResult.insertId;

      for (const item of cart) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.productId, item.variantId, item.quantity, item.price]
        );

        await conn.query('UPDATE product_variants SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [item.quantity, item.variantId]);
      }

      await conn.commit();
      req.session.cart = [];
      return res.redirect(`/orders/${orderId}/success`);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    if (!isDbUnavailable(error)) {
      return res.status(500).render('shop/error', { message: 'Could not place order right now.' });
    }

    const localOrders = req.session.localOrders || [];
    const order = {
      id: localOrders.length + 1,
      customer_name: fullName,
      status: 'pending',
      total_amount: totalAmount,
      created_at: new Date().toISOString()
    };
    localOrders.unshift(order);
    req.session.localOrders = localOrders;
    req.session.cart = [];
    req.session.lastLocalOrder = order;
    return res.redirect(`/orders/local-${order.id}/success`);
  }
}

async function successPage(req, res) {
  const { id } = req.params;
  try {
    const [orders] = await db.query('SELECT id, customer_name, status, total_amount, created_at FROM orders WHERE id = ?', [id]);
    if (!orders.length) {
      return res.status(404).render('shop/error', { message: 'Order not found.' });
    }
    return res.render('shop/order-success', { order: orders[0] });
  } catch (error) {
    if (!isDbUnavailable(error)) throw error;
    const order = req.session.lastLocalOrder;
    if (!order) return res.status(404).render('shop/error', { message: 'Order not found.' });
    return res.render('shop/order-success', { order });
  }
}

async function orderHistory(req, res) {
  try {
    const [orders] = await db.query(
      'SELECT id, status, total_amount, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.session.user.id]
    );
    return res.render('shop/order-history', { orders });
  } catch (error) {
    if (!isDbUnavailable(error)) throw error;
    return res.render('shop/order-history', { orders: req.session.localOrders || [] });
  }
}

module.exports = {
  showCheckout,
  placeOrder,
  successPage,
  orderHistory
};
