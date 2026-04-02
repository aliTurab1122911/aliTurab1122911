function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('shop/error', { message: 'Access denied' });
  }
  return next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
