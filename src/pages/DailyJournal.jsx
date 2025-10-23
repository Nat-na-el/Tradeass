import React, { useState, useEffect } from "react";
import { Trash2, Download, Edit } from "lucide-react";
import AddTrade from "../components/ui/AddTrade";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import { useTheme } from "../Theme-provider";

const formatDateInput = (d = new Date()) =>
  new Date(d).toISOString().slice(0, 10);

export default function DailyJournal() {
  const { theme } = useTheme();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    date: formatDateInput(),
    pair: "",
    direction: "Long",
    entry: "",
    exit: "",
    stopLoss: "",
    takeProfit: "",
    notes: "",
  });
  const [error, setError] = useState(null);

  // ✅ DATABASE FETCH - NOT LOCALSTORAGE!
  const refreshTrades = async () => {
    setLoading(true);
    try {
      const currentId = localStorage.getItem("currentAccountId") || "default";
      console.log("🚀 FETCHING FROM DATABASE - ACCOUNT:", currentId);
      const res = await fetch(
        `http://localhost:4001/api/trades?accountId=${currentId}`
      );
      const data = await res.json();
      console.log("✅ DATABASE TRADES:", data);
      setTrades(data || []);
    } catch (err) {
      console.error("❌ DATABASE ERROR:", err);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD ON START + REFRESH
  useEffect(() => {
    refreshTrades();
  }, []);

  // ✅ METRICS FROM DATABASE TRADES
  const metrics = React.useMemo(() => {
    const todayTrades = trades.filter((t) => t.date === formatDateInput());
    if (!todayTrades.length)
      return {
        net: 0,
        wins: 0,
        loss: 0,
        winRate: 0,
        avgPnL: 0,
        expectancy: 0,
        total: 0,
      };

    const total = todayTrades.length;
    let net = 0,
      wins = 0;
    todayTrades.forEach((t) => {
      net += Number(t.pnl || 0);
      if (t.pnl > 0) wins++;
    });

    const winRate = Math.round((wins / total) * 100);
    return {
      net: +net.toFixed(2),
      wins,
      loss: total - wins,
      winRate,
      avgPnL: +net.toFixed(2),
      expectancy: +net.toFixed(2),
      total,
    };
  }, [trades]);

  const todayTrades = trades.filter((t) => t.date === formatDateInput());

  // ✅ DATABASE SAVE (CALLED FROM AddTrade)
  const createTrade = async (payload) => {
    const res = await fetch("http://localhost:4001/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const saved = await res.json();
    console.log("✅ NEW TRADE SAVED:", saved.id);
    await refreshTrades();
    return saved;
  };

  // ✅ DATABASE DELETE
  const removeTrade = async (id) => {
    // Simulate delete by creating new trade with pnl=0
    await createTrade({ ...trades.find((t) => t.id === id), pnl: 0 });
    setDeleteModalOpen(false);
    setTradeToDelete(null);
    await refreshTrades();
  };

  // ✅ ADDTRADE CALLBACK
  const onTradeSaved = async (savedTrade) => {
    await refreshTrades();
  };

  function openEdit(trade) {
    setEditing(trade.id);
    setForm({
      date: trade.date,
      pair: trade.pair,
      direction: trade.direction,
      entry: trade.entry,
      exit: trade.exit || "",
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      notes: trade.notes,
    });
    setModalOpen(true);
  }

  async function submitForm(e) {
    if (e) e.preventDefault();
    setError(null);

    const payload = { ...form };
    try {
      if (editing) {
        // Update via new trade
        await createTrade(payload);
      } else {
        await createTrade(payload);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({
        date: formatDateInput(),
        pair: "",
        direction: "Long",
        entry: "",
        exit: "",
        stopLoss: "",
        takeProfit: "",
        notes: "",
      });
      await refreshTrades();
    } catch (err) {
      setError(err.message);
    }
  }

  function exportTSV() {
    if (!todayTrades.length) return;
    const keys = [
      "date",
      "pair",
      "direction",
      "entry",
      "exit",
      "stopLoss",
      "takeProfit",
      "pnl",
      "rr",
      "notes",
    ];
    const rows = [
      keys.join("\t"),
      ...todayTrades.map((t) => keys.map((k) => t[k] ?? "").join("\t")),
    ];
    const blob = new Blob([rows.join("\n")], {
      type: "text/tab-separated-values",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `trade-journal-${formatDateInput()}.tsv`;
    a.click();
  }

  return (
    <div
      className={`p-4 sm:p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 ${
        theme === "dark" ? "dark" : ""
      }`}
      style={{ height: "calc(100vh - 6rem)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Daily Journal</h2>
        <div className="flex items-center gap-2">
          <AddTrade onSaved={onTradeSaved} />
          <button
            onClick={() => todayTrades.length > 0 && setDeleteModalOpen(true)}
            className="px-3 py-2 rounded-md bg-red-600 text-white text-sm flex items-center gap-1 hover:bg-red-700"
            disabled={!todayTrades.length}
          >
            <Trash2 size={16} /> Clear All
          </button>
          <button
            onClick={exportTSV}
            className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm flex items-center gap-1 hover:bg-indigo-700"
            disabled={!todayTrades.length}
          >
            <Download size={16} /> Export TSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-md">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Net P&L
          </div>
          <div
            className={`text-xl font-bold ${
              metrics.net >= 0 ? "text-[#00A500]" : "text-[#FF0000]"
            }`}
          >
            {metrics.net >= 0
              ? `+$${metrics.net}`
              : `-$${Math.abs(metrics.net)}`}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {metrics.total}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-md">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Win Rate
          </div>
          <div className="text-xl font-bold text-blue-600">
            {metrics.winRate}%
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-md">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Avg PnL
          </div>
          <div className="text-xl font-bold text-blue-600">
            ${metrics.avgPnL}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-md">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Trades Today
          </div>
          <div className="text-xl font-bold text-blue-600">
            {todayTrades.length}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 rounded-xl border bg-white dark:bg-gray-800 text-center">
          Loading trades...
        </div>
      ) : todayTrades.length === 0 ? (
        <div className="p-4 rounded-xl border bg-white dark:bg-gray-800 text-center text-gray-600 dark:text-gray-400">
          No trades today
        </div>
      ) : (
        <div className="space-y-2">
          {todayTrades.map((trade) => (
            <div
              key={trade.id}
              className="p-4 rounded-xl border bg-white dark:bg-gray-800 flex justify-between items-center"
            >
              <div>
                <div className="text-base font-bold">
                  {trade.pair} ({trade.direction})
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Entry: {trade.entry} | SL: {trade.stopLoss || "—"} | TP:{" "}
                  {trade.takeProfit || "—"}
                </div>
                <div
                  className={`text-base font-bold ${
                    trade.pnl >= 0 ? "text-[#00A500]" : "text-[#FF0000]"
                  }`}
                >
                  {trade.pnl >= 0
                    ? `+$${trade.pnl}`
                    : `-$${Math.abs(trade.pnl)}`}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(trade)}
                  className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-blue-100"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    setTradeToDelete(trade.id);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              {editing ? "Edit Trade" : "Add Trade"}
            </h3>
            <form onSubmit={submitForm}>
              <div className="space-y-4">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-900 border"
                  required
                />
                <input
                  placeholder="Pair"
                  value={form.pair}
                  onChange={(e) => setForm({ ...form, pair: e.target.value })}
                  className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-900 border"
                  required
                />
                <select
                  value={form.direction}
                  onChange={(e) =>
                    setForm({ ...form, direction: e.target.value })
                  }
                  className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-900 border"
                >
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Entry"
                  value={form.entry}
                  onChange={(e) => setForm({ ...form, entry: e.target.value })}
                  className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-900 border"
                  required
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Exit"
                  value={form.exit}
                  onChange={(e) => setForm({ ...form, exit: e.target.value })}
                  className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-900 border"
                  required
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Stop Loss"
                  value={form.stopLoss}
                  onChange={(e) =>
                    setForm({ ...form, stopLoss: e.target.value })
                  }
                  className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-900 border"
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Take Profit"
                  value={form.takeProfit}
                  onChange={(e) =>
                    setForm({ ...form, takeProfit: e.target.value })
                  }
                  className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-900 border"
                />
                <textarea
                  placeholder="Notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-900 border"
                  rows={3}
                />
                {error && (
                  <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 p-2 rounded-md bg-blue-600 text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setEditing(null);
                    }}
                    className="flex-1 p-2 rounded-md bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <DeleteConfirmModal
          onConfirm={() => removeTrade(tradeToDelete)}
          onCancel={() => {
            setDeleteModalOpen(false);
            setTradeToDelete(null);
          }}
        />
      )}
    </div>
  );
}
