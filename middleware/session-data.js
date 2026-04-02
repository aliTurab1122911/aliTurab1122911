function sessionData(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.cartCount = (req.session.cart || []).reduce((sum, item) => sum + item.quantity, 0);
  next();
}

module.exports = sessionData;
