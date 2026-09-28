/**
 * Mikun's Treats - Backend API
 * Light Express + SQLite backend for order capture and menu data.
 */

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-this-secret';

app.use(cors());
app.use(express.json());

// â”€â”€â”€ Database setup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const db = new Database(path.join(__dirname, 'orders.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    items TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// â”€â”€â”€ Menu data (edit here to update the website's menu) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MENU = [
  { category: "Pastries & Snacks", items: ["Puff Puff", "Chin Chin", "Doughnuts", "Egg Rolls", "Cookies"] },
  { category: "Cakes & Foil Cakes", items: ["Red Velvet", "Vanilla", "Chocolate", "Naked Cakes", "Custom Celebration Cakes"] },
  { category: "Small Chops & Trays", items: ["Meat Pie", "Samosa", "Spring Rolls", "Party Platters"] },
  { category: "Drinks & Dishes", items: ["Zobo", "Jollof Rice", "Stews", "Nigerian Mains"] }
];

// â”€â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

app.get('/', (req, res) => {
  res.json({ service: "Mikun's Treats API", status: "running" });
});

// Public: get menu
app.get('/api/menu', (req, res) => {
  res.json({ menu: MENU });
});

// Public: submit an order
app.post('/api/orders', (req, res) => {
  const { name, phone, items } = req.body;

  if (!name || !phone || !items) {
    return res.status(400).json({ error: "name, phone, and items are required" });
  }

  const stmt = db.prepare(
    'INSERT INTO orders (name, phone, items) VALUES (?, ?, ?)'
  );
  const result = stmt.run(name, phone, items);

  res.status(201).json({
    success: true,
    orderId: result.lastInsertRowid,
    message: "Order received"
  });
});

// Admin-only: view all orders (simple key check - not for production-grade security)
app.get('/api/orders', (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json({ orders });
});

// Public: newsletter / contact signup (optional, minimal)
app.post('/api/newsletter', (req, res) => {
  const { contact } = req.body;
  if (!contact) {
    return res.status(400).json({ error: "contact is required" });
  }
  // For now just acknowledge - extend later to store in its own table if needed
  res.json({ success: true, message: "Thanks! We'll keep you posted." });
});

app.listen(PORT, () => {
  console.log(`Mikun's Treats API running on port ${PORT}`);
});
