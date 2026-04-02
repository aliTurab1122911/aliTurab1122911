const { readTable, writeTable, nextId } = require('../lib/csvStore');

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function getCategories() {
  const { rows } = await readTable('categories');
  return rows.map((r) => ({ ...r, id: Number(r.id) }));
}

async function getProducts() {
  const [{ rows: products }, categories] = await Promise.all([readTable('products'), getCategories()]);
  return products.map((p) => ({
    ...p,
    id: Number(p.id),
    category_id: Number(p.category_id),
    price: Number(p.price),
    is_active: Number(p.is_active),
    category_name: categories.find((c) => c.id === Number(p.category_id))?.name || 'Collection'
  }));
}

async function getProductBySlug(slug) {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

async function getVariantsByProductId(productId) {
  const { rows } = await readTable('variants');
  return rows
    .filter((v) => Number(v.product_id) === Number(productId))
    .map((v) => ({ ...v, id: Number(v.id), product_id: Number(v.product_id), stock: Number(v.stock) }));
}

async function getVariantById(variantId) {
  const { rows } = await readTable('variants');
  const v = rows.find((x) => Number(x.id) === Number(variantId));
  if (!v) return null;
  return { ...v, id: Number(v.id), product_id: Number(v.product_id), stock: Number(v.stock) };
}

async function updateVariantStock(variantId, quantity) {
  const table = await readTable('variants');
  const row = table.rows.find((v) => Number(v.id) === Number(variantId));
  if (!row) return;
  row.stock = String(Math.max(Number(row.stock) - Number(quantity), 0));
  await writeTable('variants', table.headers, table.rows);
}

async function findUserByEmail(email) {
  const { rows } = await readTable('users');
  return rows.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

async function createUser({ name, email, passwordHash, role = 'customer' }) {
  const table = await readTable('users');
  const id = nextId(table.rows);
  table.rows.push({ id: String(id), name, email, password_hash: passwordHash, role, created_at: new Date().toISOString() });
  await writeTable('users', table.headers, table.rows);
  return { id, name, email, role };
}

async function createOrder(orderInput, items) {
  const orderTable = await readTable('orders');
  const itemTable = await readTable('orderItems');
  const orderId = nextId(orderTable.rows);
  orderTable.rows.push({ id: String(orderId), ...orderInput, created_at: new Date().toISOString() });

  let itemId = nextId(itemTable.rows);
  for (const item of items) {
    itemTable.rows.push({
      id: String(itemId++),
      order_id: String(orderId),
      product_id: String(item.productId),
      variant_id: String(item.variantId),
      quantity: String(item.quantity),
      unit_price: String(item.price)
    });
    await updateVariantStock(item.variantId, item.quantity);
  }

  await writeTable('orders', orderTable.headers, orderTable.rows);
  await writeTable('orderItems', itemTable.headers, itemTable.rows);
  return orderId;
}

async function getOrdersByUser(userId) {
  const { rows } = await readTable('orders');
  return rows
    .filter((o) => String(o.user_id || '') === String(userId))
    .map((o) => ({ ...o, id: Number(o.id), total_amount: Number(o.total_amount) }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function getAllOrders() {
  const { rows } = await readTable('orders');
  return rows
    .map((o) => ({ ...o, id: Number(o.id), total_amount: Number(o.total_amount) }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function getOrderById(id) {
  const { rows } = await readTable('orders');
  const row = rows.find((o) => String(o.id) === String(id));
  if (!row) return null;
  return { ...row, id: Number(row.id), total_amount: Number(row.total_amount) };
}

async function updateOrderStatus(id, status) {
  const table = await readTable('orders');
  const row = table.rows.find((o) => String(o.id) === String(id));
  if (!row) return;
  row.status = status;
  await writeTable('orders', table.headers, table.rows);
}

async function createProduct(input) {
  const productTable = await readTable('products');
  const variantTable = await readTable('variants');
  const productId = nextId(productTable.rows);
  const slug = slugify(input.name);

  productTable.rows.push({
    id: String(productId),
    name: input.name,
    slug,
    category_id: String(input.categoryId || ''),
    price: String(input.price),
    short_description: input.shortDescription || '',
    description: input.description || '',
    image_url: input.imageUrl,
    is_active: '1',
    created_at: new Date().toISOString()
  });

  let variantId = nextId(variantTable.rows);
  const pairs = (input.sizeStock || 'S:10,M:10,L:10').split(',').map((x) => x.trim()).filter(Boolean);
  for (const pair of pairs) {
    const [size, stock] = pair.split(':');
    if (!size) continue;
    variantTable.rows.push({
      id: String(variantId++),
      product_id: String(productId),
      size: size.trim().toUpperCase(),
      stock: String(Number(stock || 0)),
      sku: `${slug}-${size.trim().toUpperCase()}`
    });
  }

  await writeTable('products', productTable.headers, productTable.rows);
  await writeTable('variants', variantTable.headers, variantTable.rows);
}

async function toggleProduct(id) {
  const table = await readTable('products');
  const row = table.rows.find((p) => String(p.id) === String(id));
  if (!row) return;
  row.is_active = row.is_active === '1' ? '0' : '1';
  await writeTable('products', table.headers, table.rows);
}

async function dashboardStats() {
  const [orders, variants] = await Promise.all([getAllOrders(), readTable('variants')]);
  return {
    total_orders: orders.length,
    total_sales: orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
    low_stock_items: variants.rows.filter((v) => Number(v.stock) <= 5).length
  };
}

module.exports = {
  getCategories,
  getProducts,
  getProductBySlug,
  getVariantsByProductId,
  getVariantById,
  findUserByEmail,
  createUser,
  createOrder,
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  createProduct,
  toggleProduct,
  dashboardStats
};
