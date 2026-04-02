const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let attemptedInit = false;
let available = false;

function isConfigured() {
  return Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
}

async function initPool() {
  if (attemptedInit) return;
  attemptedInit = true;

  if (!isConfigured()) {
    available = false;
    return;
  }

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    await pool.query('SELECT 1');
    available = true;
    console.log('MySQL connected.');
  } catch (error) {
    available = false;
    console.warn('MySQL unavailable. Running in frontend/demo mode.');
  }
}

async function query(sql, params = []) {
  await initPool();
  if (!available || !pool) {
    throw new Error('DB_UNAVAILABLE');
  }
  return pool.query(sql, params);
}

async function getConnection() {
  await initPool();
  if (!available || !pool) {
    throw new Error('DB_UNAVAILABLE');
  }
  return pool.getConnection();
}

async function isDbAvailable() {
  await initPool();
  return available;
}

module.exports = {
  query,
  getConnection,
  isDbAvailable,
  isConfigured
};
