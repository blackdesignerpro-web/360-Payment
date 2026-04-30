import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import multer from "multer";
import db from "./src/db.js"; // Note: using .js extension for imports in ESM context or relative path

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// File Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// --- API ROUTES ---

// Products
app.get("/api/products", (req, res) => {
  const products = db.prepare("SELECT * FROM products").all();
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const { name, price, stock, barcode, category } = req.body;
  const info = db.prepare(
    "INSERT INTO products (name, price, stock, barcode, category) VALUES (?, ?, ?, ?, ?)"
  ).run(name, price, stock, barcode, category);
  res.json({ id: info.lastInsertRowid });
});

app.put("/api/products/:id", (req, res) => {
  const { name, price, stock, barcode, category } = req.body;
  db.prepare(
    "UPDATE products SET name = ?, price = ?, stock = ?, barcode = ?, category = ? WHERE id = ?"
  ).run(name, price, stock, barcode, category, req.params.id);
  res.json({ success: true });
});

app.delete("/api/products/:id", (req, res) => {
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Sales
app.get("/api/sales", (req, res) => {
  const sales = db.prepare("SELECT * FROM sales ORDER BY created_at DESC").all();
  res.json(sales);
});

app.post("/api/sales", (req, res) => {
  const { total, payment_method, items } = req.body;
  const info = db.prepare(
    "INSERT INTO sales (total, payment_method, items) VALUES (?, ?, ?)"
  ).run(total, payment_method, JSON.stringify(items));

  // Update stock
  const saleItems = items || [];
  saleItems.forEach((item: any) => {
    db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(
      item.quantity,
      item.id
    );
  });

  // Record as revenue
  db.prepare(
    "INSERT INTO transactions (type, category, amount, description) VALUES (?, ?, ?, ?)"
  ).run("revenue", "Venda", total, `Venda #${info.lastInsertRowid}`);

  res.json({ id: info.lastInsertRowid });
});

// Transactions
app.get("/api/transactions", (req, res) => {
  const transactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC").all();
  res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
  const { type, category, amount, description } = req.body;
  db.prepare(
    "INSERT INTO transactions (type, category, amount, description) VALUES (?, ?, ?, ?)"
  ).run(type, category, amount, description);
  res.json({ success: true });
});

// Auth & Face Simple
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
