import React, { useState, useEffect, useMemo } from "react";
import { Trash2, Download, Edit, Plus, Loader2 } from "lucide-react";
import { useTheme } from "../Theme-provider";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";

const formatDateInput = (d = new Date()) => new Date(d).toISOString().slice(0, 10);

export default function DailyJournal() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);
  const [editingTrade, setEditingTrade] = useState(null);
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

  // Fetch trades from backend
  const refreshTrades = async () => {
    setLoading(true);
    try {
      const currentId = localStorage.getItem("currentAccountId") || "default";
      const res = await fetch(
        `https://tradeass-backend.onrender.com/api/trades?accountId=${currentId}`
      );
      if (!res.ok) throw new Error("Failed to fetch trades");
      const data = await res.json();
      setTrades(data || []);
    } catch (err) {
      console.error("❌ DailyJournal fetch error:", err);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTrades();
  }, []);

  // Filter today's trades
  const todayTrades = useMemo(() => {
    const today = formatDateInput();
    return trades.filter((t) => t.date === today);
  }, [trades]);

  // Today's metrics
  const metrics = useMemo(() => {
    if (!todayTrades.length) {
      return {
        net: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        avgPnL: 0,
        expectancy: 0,
        total: 0,
      };
    }

    const total = todayTrades.length;
    let net = 0;
    let wins = 0;

    todayTrades.forEach((t) => {
      const pnl = Number(t.pnl || 0);
      net += pnl;
      if (pnl > 0) wins++;
    });

    const winRate = Math.round((wins / total) * 100);
    const avgPnL = net / total;

    return {
      net: +net.toFixed(2),
      wins,
      losses: total - wins,
      winRate,
      avgPnL: +avgPnL.toFixed(2),
      expectancy: +avgPnL.toFixed(2),
      total,
    };
  }, [todayTrades]);

  // Add or update trade
  const saveTrade = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    const payload = {
      ...form,
      accountId: localStorage.getItem("currentAccountId") || "default",
    };

    try {
      const method = editingTrade ? "PUT" : "POST";
      const url = editingTrade
        ? `https://tradeass-backend.onrender.com/api/trades/${editingTrade.id}`
        : "https://tradeass-backend.onrender.com/api/trades";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save trade");

      setModalOpen(false);
      setEditingTrade(null);
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
      setError(err.message || "Something went wrong");
    }
  };

  // Delete single trade
  const deleteTrade = async (id) => {
    try {
      await fetch(`https://tradeass-backend.onrender.com/api/trades/${id}`, {
        method: "DELETE",
      });
      await refreshTrades();
    } catch (err) {
      console.error("Delete error:", err);
    }
    setDeleteModalOpen(false);
    setTradeToDelete(null);
  };

  // Clear all today's trades
  const clearTodayTrades = async () => {
    for (const trade of todayTrades) {
      await deleteTrade(trade.id);
    }
    setDeleteModalOpen(false);
  };

  // Open edit modal
  const openEdit = (trade) => {
    setEditingTrade(trade);
    setForm({
      date: trade.date,
      pair: trade.pair || "",
      direction: trade.direction || "Long",
      entry: trade.entry || "",
      exit: trade.exit || "",
      stopLoss: trade.stopLoss || "",
      takeProfit: trade.takeProfit || "",
      notes: trade.notes || "",
    });
    setModalOpen(true);
  };

  // Export to CSV
  const exportCSV = () => {
    if (!todayTrades.length) return;

    const headers = [
      "Date",
      "Pair",
      "Direction",
      "Entry",
      "Exit",
      "Stop Loss",
      "Take Profit",
      "PnL",
      "R:R",
      "Notes",
    ];

    const rows = todayTrades.map((t) => [
      t.date,
      t.pair || "",
      t.direction || "",
      t.entry || "",
      t.exit || "",
      t.stopLoss || "",
      t.takeProfit || "",
      t.pnl || 0,
      t.rr || "",
      t.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daily-journal-${formatDateInput()}.csv`);
    link.click();
  };

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors duration-300
        ${isDark 
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100" 
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Daily Journal
          </h1>
          <p className="text-sm sm:text-base mt-1 opacity-80">
            {formatDateInput()} • Track your trades and mindset
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setEditingTrade(null);
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
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all duration-200"
          >
            <Plus size={18} /> Add Trade
          </button>

          <button
            onClick={exportCSV}
            disabled={!todayTrades.length}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} /> Export CSV
          </button>

          <button
            onClick={() => todayTrades.length > 0 && setDeleteModalOpen(true)}
            disabled={!todayTrades.length}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/90 hover:bg-red-700 text-white rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={18} /> Clear Today
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Net P&L</div>
          <div
            className={`text-2xl font-bold ${
              metrics.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {metrics.net >= 0 ? "+" : "-"}${Math.abs(metrics.net).toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {metrics.winRate}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Avg PnL</div>
          <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            ${metrics.avgPnL}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Trades Today</div>
          <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {metrics.total}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Wins / Losses</div>
          <div className="text-2xl font-bold">
            {metrics.wins} <span className="text-emerald-600">/</span> {metrics.losses}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Expectancy</div>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
            ${metrics.expectancy}
          </div>
        </div>
      </div>

      {/* Trades List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="mt-4 text-lg opacity-70">Loading today's trades...</p>
        </div>
      ) : todayTrades.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-xl font-medium opacity-70">No trades recorded today</p>
          <p className="mt-2 opacity-60">Click "Add Trade" to start journaling</p>
        </div>
      ) : (
        <div className="space-y-4">
          {todayTrades.map((trade) => (
            <div
              key={trade.id}
              className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-xl transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold ${
                        trade.pnl >= 0
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      }`}
                    >
                      {trade.pair?.slice(0, 2) || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {trade.pair} • {trade.direction}
                      </div>
                      <div className="text-sm opacity-70">
                        Entry: {trade.entry} | SL: {trade.stopLoss || "—"} | TP: {trade.takeProfit || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm opacity-70 mt-1">
                    {trade.notes && <span className="block italic">Note: {trade.notes}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="text-right">
                    <div
                      className={`text-xl font-bold ${
                        trade.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {trade.pnl >= 0 ? "+" : ""}${Math.abs(Number(trade.pnl || 0)).toFixed(2)}
                    </div>
                    {trade.rr && <div className="text-xs opacity-70">R:R {trade.rr}</div>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(trade)}
                      className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setTradeToDelete(trade.id);
                        setDeleteModalOpen(true);
                      }}
                      className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-700 dark:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4">
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md border 
              ${isDark ? "bg-gray-900/90 border-gray-700/50" : "bg-white/90 border-gray-200/50"}`}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-6">
                {editingTrade ? "Edit Trade" : "Add New Trade"}
              </h3>

              <form onSubmit={saveTrade} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Pair</label>
                    <input
                      placeholder="EURUSD"
                      value={form.pair}
                      onChange={(e) => setForm({ ...form, pair: e.target.value.toUpperCase() })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Direction</label>
                    <select
                      value={form.direction}
                      onChange={(e) => setForm({ ...form, direction: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                    >
                      <option value="Long">Long</option>
                      <option value="Short">Short</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">R:R (optional)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      value={form.rr || ""}
                      onChange={(e) => setForm({ ...form, rr: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Entry</label>
                    <input
                      type="number"
                      step="0.00001"
                      placeholder="1.08500"
                      value={form.entry}
                      onChange={(e) => setForm({ ...form, entry: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Exit</label>
                    <input
                      type="number"
                      step="0.00001"
                      placeholder="1.09000"
                      value={form.exit}
                      onChange={(e) => setForm({ ...form, exit: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">PnL</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="45.50"
                      value={form.pnl || ""}
                      onChange={(e) => setForm({ ...form, pnl: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Stop Loss</label>
                    <input
                      type="number"
                      step="0.00001"
                      placeholder="1.08200"
                      value={form.stopLoss}
                      onChange={(e) => setForm({ ...form, stopLoss: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Take Profit</label>
                    <input
                      type="number"
                      step="0.00001"
                      placeholder="1.09500"
                      value={form.takeProfit}
                      onChange={(e) => setForm({ ...form, takeProfit: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Notes / Thoughts</label>
                  <textarea
                    placeholder="What went well? What to improve? Emotional state?..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className={`w-full p-3 rounded-lg border min-h-[100px] ${
                      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none`}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md"
                  >
                    {editingTrade ? "Update Trade" : "Save Trade"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setEditingTrade(null);
                    }}
                    className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteModalOpen && (
        <DeleteConfirmModal
          title={tradeToDelete ? "Delete Trade" : "Clear Today's Trades"}
          message={
            tradeToDelete
              ? "Are you sure you want to delete this trade? This action cannot be undone."
              : `Are you sure you want to delete all ${todayTrades.length} trades from today?`
          }
          onConfirm={tradeToDelete ? () => deleteTrade(tradeToDelete) : clearTodayTrades}
          onCancel={() => {
            setDeleteModalOpen(false);
            setTradeToDelete(null);
          }}
        />
      )}
    </div>
  );
}
