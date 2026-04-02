const bcrypt = require('bcrypt');
const db = require('../config/db');
const { isDbUnavailable } = require('../utils/dbFallback');

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

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.render('shop/register', { error: 'Email already exists.', info: null });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, hashed, 'customer']);
    return res.redirect('/login');
  } catch (error) {
    if (isDbUnavailable(error)) {
      return res.render('shop/register', { error: null, info: 'Demo mode: registration is disabled until MySQL is connected.' });
    }
    throw error;
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.render('shop/login', { error: 'Invalid credentials.', info: null });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.render('shop/login', { error: 'Invalid credentials.', info: null });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    return res.redirect(user.role === 'admin' ? '/admin' : '/');
  } catch (error) {
    if (isDbUnavailable(error)) {
      if (!email || !password) {
        return res.render('shop/login', { error: 'Enter email and password.', info: null });
      }
      const demoRole = email.toLowerCase() === 'admin@demo.com' ? 'admin' : 'customer';
      req.session.user = { id: 0, name: demoRole === 'admin' ? 'Demo Admin' : 'Demo User', email, role: demoRole };
      return res.redirect(demoRole === 'admin' ? '/admin' : '/');
    }
    throw error;
  }
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
