import AddTrade from "@/components/ui/AddTrade";
// src/pages/DailyJournal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Download, Edit } from "lucide-react";
import ConfirmModal from "../components/ui/ConfirmModal";

/**
 * Daily Journal page
 * - Expects a backend at /api/trades to GET/POST/PUT/DELETE trades
 * - If backend not available, falls back to localStorage (graceful)
 *
 * Trade object shape:
 * {
 *   id: string,
 *   date: "YYYY-MM-DD",
 *   pair: "EURUSD",
 *   direction: "Long" | "Short",
 *   entry: number,
 *   exit: number,
 *   stop: number | null,
 *   take: number | null,
 *   pnl: number,
 *   rr: number,
 *   notes: string
 * }
 */

const API_BASE = "/api/trades"; // adapt to your backend

function formatDateInput(d = new Date()) {
  // YYYY-MM-DD
  const iso = new Date(d).toISOString();
  return iso.slice(0, 10);
}

function computeTradeDerived(t) {
  // compute pnl + rr if not provided; minimal logic
  const entry = Number(t.entry) || 0;
  const exit = Number(t.exit) || 0;
  const stop = t.stop ? Number(t.stop) : null;
  const direction = t.direction || "Long";

  const pnl =
    direction === "Long"
      ? +(exit - entry).toFixed(2)
      : +(entry - exit).toFixed(2);

  let rr = null;
  if (stop !== null && stop !== 0) {
    const risk =
      direction === "Long" ? Math.abs(entry - stop) : Math.abs(stop - entry);
    if (risk > 0) rr = +Math.abs((exit - entry) / risk).toFixed(2);
  }
  return { ...t, pnl, rr };
}

export default function DailyJournal() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPair, setFilterPair] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    date: formatDateInput(),
    pair: "",
    direction: "Long",
    entry: "",
    exit: "",
    stop: "",
    take: "",
    notes: "",
  });
  const [error, setError] = useState(null);

  // fetch trades from backend or localStorage
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("No backend");
        const data = await res.json();
        setTrades(data);
      } catch (err) {
        // fallback: get from localStorage
        const raw = localStorage.getItem("dj_trades");
        const local = raw ? JSON.parse(raw) : [];
        setTrades(local);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // persist to localStorage whenever trades change (backup)
  useEffect(() => {
    localStorage.setItem("dj_trades", JSON.stringify(trades));
  }, [trades]);

  // Derived metrics
  const metrics = useMemo(() => {
    if (!trades.length)
      return {
        net: 0,
        wins: 0,
        loss: 0,
        winRate: 0,
        avgPnL: 0,
        expectancy: 0,
        total: 0,
      };
    const total = trades.length;
    let net = 0;
    let wins = 0;
    let avgPnL = 0;
    let expectancy = 0;

    trades.forEach((t) => {
      net += Number(t.pnl || 0);
      if (t.pnl > 0) wins++;
      avgPnL += Number(t.pnl || 0);
    });
    avgPnL = +(avgPnL / total).toFixed(2);
    const winRate = Math.round((wins / total) * 100);
    // expectancy: simplified: average pnl * winrate - avg loss * lossrate
    const avgWin =
      trades.filter((t) => t.pnl > 0).reduce((a, b) => a + b.pnl, 0) /
      (wins || 1);
    const avgLoss =
      trades.filter((t) => t.pnl <= 0).reduce((a, b) => a + b.pnl, 0) /
      (total - wins || 1);
    expectancy = +(
      avgWin * (wins / total) +
      avgLoss * ((total - wins) / total)
    ).toFixed(2);

    return {
      net: +net.toFixed(2),
      wins,
      loss: total - wins,
      winRate,
      avgPnL,
      expectancy,
      total,
    };
  }, [trades]);

  // filtered list
  const shown = trades.filter((t) =>
    filterPair ? t.pair?.toLowerCase().includes(filterPair.toLowerCase()) : true
  );

  // CRUD operations (call backend and update local state)
  async function createTrade(payload) {
    // compute derived fields
    const derived = computeTradeDerived(payload);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(derived),
      });
      if (!res.ok) throw new Error("no backend");
      const created = await res.json();
      setTrades((s) => [created, ...s]);
      return created;
    } catch (err) {
      // fallback: local add
      const id = `loc-${Date.now()}`;
      const created = { ...derived, id };
      setTrades((s) => [created, ...s]);
      return created;
    }
  }

  async function updateTrade(id, payload) {
    const derived = computeTradeDerived(payload);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(derived),
      });
      if (!res.ok) throw new Error("no backend");
      const updated = await res.json();
      setTrades((s) => s.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      setTrades((s) => s.map((t) => (t.id === id ? { ...t, ...derived } : t)));
      return derived;
    }
  }

  async function removeTrade(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("no backend");
      setTrades((s) => s.filter((t) => t.id !== id));
    } catch (err) {
      setTrades((s) => s.filter((t) => t.id !== id));
    }
  }

  function clearAll() {
    setTrades([]);
    localStorage.removeItem("trades");
  }

  // modal handlers
  function openAdd() {
    setEditing(null);
    setForm({
      date: formatDateInput(),
      pair: "",
      direction: "Long",
      entry: "",
      exit: "",
      stop: "",
      take: "",
      notes: "",
    });
    setModalOpen(true);
  }

  function openEdit(t) {
    setEditing(t.id);
    setForm({
      date: t.date,
      pair: t.pair,
      direction: t.direction,
      entry: t.entry,
      exit: t.exit,
      stop: t.stop || "",
      take: t.take || "",
      notes: t.notes || "",
    });
    setModalOpen(true);
  }

  async function submitForm(e) {
    e.preventDefault();
    setError(null);
    try {
      const payload = { ...form };
      if (editing) {
        await updateTrade(editing, payload);
      } else {
        await createTrade({ ...payload, id: undefined });
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message || "Failed");
    }
  }

  // export TSV
  function exportTSV() {
    if (!trades.length) return;
    const keys = [
      "date",
      "pair",
      "direction",
      "entry",
      "exit",
      "stop",
      "take",
      "pnl",
      "rr",
      "notes",
    ];
    const rows = [
      keys.join("\t"),
      ...trades.map((t) => keys.map((k) => t[k] ?? "").join("\t")),
    ];
    const content = rows.join("\n");
    const blob = new Blob([content], { type: "text/tab-separated-values" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `trade-journal-${formatDateInput()}.tsv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Daily Journal
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <AddTrade onSave={(trade) => createTrade(trade)} />

          {/* Replace confirm dialog for clearing all trades with window.prompt for now */}
          <button
            onClick={() => {
              // eslint-disable-next-line no-restricted-globals
              if (window.confirm("Clear all trades?")) clearAll();
            }}
            className="px-4 py-2 rounded-md bg-rose-700 text-white flex items-center gap-2"
          >
            <Trash2 /> Clear All
          </button>

          <button
            onClick={exportTSV}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white flex items-center gap-2"
          >
            <Download /> Export TSV
          </button>
        </div>
      </div>

      {/* top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-white/80 dark:bg-[#071023] border border-slate-200 dark:border-white/6">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Net P&L
          </div>
          <div className="text-2xl font-bold">
            {metrics.net >= 0
              ? `+$${metrics.net}`
              : `-$${Math.abs(metrics.net)}`}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Total trades: {metrics.total}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/80 dark:bg-[#071023] border border-slate-200 dark:border-white/6">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Win Rate
          </div>
          <div className="text-2xl font-bold">{metrics.winRate}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {metrics.wins} wins • {metrics.loss} losses
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/80 dark:bg-[#071023] border border-slate-200 dark:border-white/6">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Avg PnL
          </div>
          <div className="text-2xl font-bold">${metrics.avgPnL}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Expectancy: ${metrics.expectancy}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white/80 dark:bg-[#071023] border border-slate-200 dark:border-white/6">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Last Trade
          </div>
          <div className="text-2xl font-bold">
            {trades[0]?.pnl
              ? trades[0].pnl >= 0
                ? `+$${trades[0].pnl}`
                : `-$${Math.abs(trades[0].pnl)}`
              : "—"}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {trades[0]?.pair ?? "—"}
          </div>
        </div>
      </div>

      {/* Filter + list */}
      <div className="space-y-4">
        <div className="flex gap-3 mb-2">
          <input
            placeholder="Filter by pair..."
            className="flex-1 px-3 py-2 rounded-md border bg-white/80 dark:bg-[#071018] border-slate-200 dark:border-white/6"
            value={filterPair}
            onChange={(e) => setFilterPair(e.target.value)}
          />
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-4">
            {shown.length === 0 ? (
              <div className="p-6 rounded-md border border-slate-200 dark:border-white/6 bg-white/80 dark:bg-[#071018]">
                No trades yet. Click Add Trade to start journaling.
              </div>
            ) : (
              shown.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-md border border-slate-200 dark:border-white/6 bg-white/80 dark:bg-[#071018]"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Date
                      </div>
                      <div className="font-medium">{t.date}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Pair
                      </div>
                      <div className="font-medium">{t.pair}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Direction
                      </div>
                      <div className="font-medium">{t.direction}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        P&L
                      </div>
                      <div
                        className={`font-medium ${
                          t.pnl >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${t.pnl}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Notes
                      </div>
                      <div className="text-sm">{t.notes}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-slate-400">
                        R:R {t.rr ?? "-"}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          className="px-3 py-1 rounded-md bg-slate-800 text-white flex items-center gap-2"
                        >
                          <Edit /> Edit
                        </button>
                        {/* Replace confirm dialog for deleting a trade with window.prompt for now */}
                        <button
                          onClick={() => {
                            // eslint-disable-next-line no-restricted-globals
                            if (window.confirm("Delete trade?"))
                              removeTrade(t.id);
                          }}
                          className="px-3 py-1 rounded-md bg-rose-700 text-white flex items-center gap-2"
                        >
                          <Trash2 /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}

      {/* Debug: raw trades data */}
      {false && (
        <pre className="mt-4 text-xs text-slate-500">
          {JSON.stringify(trades, null, 2)}
        </pre>
      )}
    </div>
  );
}
