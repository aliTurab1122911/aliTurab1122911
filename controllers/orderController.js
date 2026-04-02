const store = require('../services/storeService');

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
  const orderId = await store.createOrder(
    {
      user_id: req.session.user ? req.session.user.id : '',
      customer_name: fullName,
      customer_email: email,
      customer_phone: phone || '',
      address_line1: addressLine1,
      city,
      state: state || '',
      postal_code: postalCode || '',
      country,
      status: 'pending',
      total_amount: totalAmount
    },
    cart
  );

  req.session.cart = [];
  return res.redirect(`/orders/${orderId}/success`);
}

async function successPage(req, res) {
  const { id } = req.params;
  const order = await store.getOrderById(id);
  if (!order) {
    return res.status(404).render('shop/error', { message: 'Order not found.' });
  }
  return res.render('shop/order-success', { order });
}

async function orderHistory(req, res) {
  const orders = await store.getOrdersByUser(req.session.user.id);
  res.render('shop/order-history', { orders });
}

module.exports = {
  showCheckout,
  placeOrder,
  successPage,
  orderHistory
};
