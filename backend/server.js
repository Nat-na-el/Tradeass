// backend/server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { v4: uuid } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const DBFILE = path.join(__dirname, "trades.json");

// Create file if missing
if (!fs.existsSync(DBFILE)) fs.writeFileSync(DBFILE, "[]", "utf8");

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(DBFILE, "utf8") || "[]");
  } catch {
    return [];
  }
}

function writeAll(arr) {
  fs.writeFileSync(DBFILE, JSON.stringify(arr, null, 2), "utf8");
}

// ✅ Get all trades
app.get("/api/trades", (req, res) => {
  const arr = readAll().sort((a, b) => (a.date < b.date ? 1 : -1));
  res.json(arr);
});

// ✅ Add a new trade
app.post("/api/trades", (req, res) => {
  const body = req.body;
  const id = uuid();
  const trade = { id, ...body };
  const arr = readAll();
  arr.unshift(trade);
  writeAll(arr);
  console.log("✅ Added trade:", trade);
  res.status(201).json(trade);
});

// ✅ Update trade
app.put("/api/trades/:id", (req, res) => {
  const id = req.params.id;
  const arr = readAll();
  const idx = arr.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  arr[idx] = { ...arr[idx], ...req.body };
  writeAll(arr);
  res.json(arr[idx]);
});

// ✅ Delete single trade
app.delete("/api/trades/:id", (req, res) => {
  const id = req.params.id;
  const arr = readAll().filter((t) => t.id !== id);
  writeAll(arr);
  res.json({ ok: true });
});

// ✅ Clear all trades
app.delete("/api/trades", (req, res) => {
  writeAll([]);
  res.json({ ok: true });
});

// ✅ 404 fallback
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () =>
  console.log(`🚀 Trade Journal API running on http://localhost:${PORT}`)
);
