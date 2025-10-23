const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("trades.db");

// ✅ CREATE TABLE IF NOT EXISTS
db.run(`
  CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    accountId TEXT,
    date TEXT,
    pair TEXT,
    direction TEXT,
    entry REAL,
    stopLoss REAL,
    takeProfit REAL,
    positionSize REAL,
    leverage REAL,
    exit REAL,
    notes TEXT,
    risk REAL,
    reward REAL,
    rr REAL,
    pnl REAL
  )
`);

// ✅ ADD TRADE
app.post("/api/trades", (req, res) => {
  try {
    const trade = req.body;
    const accountId = trade.accountId || "default";
    const id = `trade-${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO trades (
        id, accountId, date, pair, direction, entry, stopLoss, takeProfit,
        positionSize, leverage, exit, notes, risk, reward, rr, pnl
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      accountId,
      trade.date,
      trade.pair,
      trade.direction,
      trade.entry,
      trade.stopLoss,
      trade.takeProfit,
      trade.positionSize,
      trade.leverage,
      trade.exit,
      trade.notes,
      trade.risk,
      trade.reward,
      trade.rr,
      trade.pnl
    );

    console.log(`✅ SAVED (${accountId}): ${trade.pair}`);
    res.json({ success: true, id, accountId });
  } catch (err) {
    console.error("❌ ERROR SAVING TRADE:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ FETCH TRADES
app.get("/api/trades", (req, res) => {
  const { accountId = "default" } = req.query;

  db.all(
    "SELECT * FROM trades WHERE accountId = ? ORDER BY date DESC",
    [accountId],
    (err, trades) => {
      // ✅ FIXED!
      if (err) {
        console.error("❌ DB ERROR:", err);
        return res.json([]);
      }

      // ✅ Always return an array
      console.log(`📡 SENDING ${accountId} TRADES (${trades.length})`);
      if (!Array.isArray(trades)) {
        trades = [];
      }

      res.json(trades);
    }
  );
});

// ✅ DELETE TRADE
app.delete("/api/trades/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { accountId = "default" } = req.query;

    const result = db
      .prepare("DELETE FROM trades WHERE id = ? AND accountId = ?")
      .run(id, accountId);

    console.log(`✅ DELETED (${accountId}): ${id}`);
    res.json({ success: true, deleted: result.changes });
  } catch (err) {
    console.error("❌ ERROR DELETING TRADE:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ START SERVER
const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
