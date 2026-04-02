const bcrypt = require('bcrypt');
const db = require('../config/db');

async function showLogin(req, res) {
  res.render('shop/login', { error: null });
}

async function showRegister(req, res) {
  res.render('shop/register', { error: null });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('shop/register', { error: 'All fields are required.' });
  }

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) {
    return res.render('shop/register', { error: 'Email already exists.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  await db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, hashed, 'customer']);

  return res.redirect('/login');
}

async function login(req, res) {
  const { email, password } = req.body;

  const [rows] = await db.query('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [email]);
  if (!rows.length) {
    return res.render('shop/login', { error: 'Invalid credentials.' });
  }

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.render('shop/login', { error: 'Invalid credentials.' });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  if (user.role === 'admin') {
    return res.redirect('/admin');
  }

  return res.redirect('/');
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
