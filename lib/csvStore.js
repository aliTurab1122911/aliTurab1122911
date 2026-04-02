const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const files = {
  categories: 'categories.csv',
  products: 'products.csv',
  variants: 'variants.csv',
  users: 'users.csv',
  orders: 'orders.csv',
  orderItems: 'order_items.csv'
};

function parseLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function toCsvValue(value) {
  const stringValue = value == null ? '' : String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

async function readTable(key) {
  const filePath = path.join(dataDir, files[key]);
  const raw = await fs.readFile(filePath, 'utf8');
  const lines = raw.trim().split('\n');
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).filter(Boolean).map((line) => {
    const values = parseLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
  return { headers, rows };
}

async function writeTable(key, headers, rows) {
  const filePath = path.join(dataDir, files[key]);
  const output = [headers.join(',')];
  rows.forEach((row) => {
    output.push(headers.map((header) => toCsvValue(row[header])).join(','));
  });
  await fs.writeFile(filePath, `${output.join('\n')}\n`, 'utf8');
}

function nextId(rows) {
  return rows.length ? Math.max(...rows.map((r) => Number(r.id) || 0)) + 1 : 1;
}

module.exports = {
  readTable,
  writeTable,
  nextId
};
