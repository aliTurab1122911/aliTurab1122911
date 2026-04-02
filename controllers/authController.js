const crypto = require('crypto');
const store = require('../services/storeService');

function hashPassword(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function showLogin(req, res) {
  res.render('shop/login', { error: null, info: null });
}

async function showRegister(req, res) {
  res.render('shop/register', { error: null, info: null });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('shop/register', { error: 'All fields are required.', info: null });
  }

  const existing = await store.findUserByEmail(email);
  if (existing) {
    return res.render('shop/register', { error: 'Email already exists.', info: null });
  }

  await store.createUser({ name, email, passwordHash: hashPassword(password), role: 'customer' });
  return res.redirect('/login');
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await store.findUserByEmail(email);

  if (!user || user.password_hash !== hashPassword(password)) {
    return res.render('shop/login', { error: 'Invalid credentials.', info: null });
  }

  req.session.user = {
    id: Number(user.id),
    name: user.name,
    email: user.email,
    role: user.role
  };

  return res.redirect(user.role === 'admin' ? '/admin' : '/');
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

module.exports = {
  showLogin,
  showRegister,
  register,
  login,
  logout
};
