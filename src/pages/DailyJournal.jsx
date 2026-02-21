// src/pages/DailyJournal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Trash2, Plus, Loader2, Check, AlertCircle, FileText, X, Edit } from "lucide-react";
import { useTheme } from "../Theme-provider";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const formatDateInput = (d = new Date()) => new Date(d).toISOString().slice(0, 10);

// Expanded list of common assets for autocomplete
const COMMON_ASSETS = [
  // Forex majors & crosses
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "NZDUSD", "USDCHF",
  "EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "CADJPY", "CHFJPY",
  // Indices – expanded as requested
  "UK100", "US30", "NAS100", "SPX500", "DE40", "JP225", "FRA40", "AUS200",
  "HSI", "CHINA50", "UK100.cash", "US30.cash", "NAS100.cash",
  // Popular stocks
  "AAPL", "TSLA", "AMZN", "GOOGL", "MSFT", "NVDA", "META", "NFLX", "AMD", "INTC",
  "BABA", "PDD", "JD", "SHOP", "SQ", "PYPL", "DIS", "BA", "GE", "F"
];

export default function DailyJournal() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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
    pnl: "",
    rr: "",
    leverage: "100",
    lotSize: "0.1",
  });

  // Fetch trades
  const refreshTrades = async () => {
    const user = auth.currentUser;
    if (!user) {
      setTrades([]);
      setLoading(false);
      setError("Please log in to see your trades");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "users", user.uid, "trades"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const loadedTrades = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrades(loadedTrades);
    } catch (err) {
      console.error("❌ Firestore fetch error:", err);
      setError("Could not load trades. " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        refreshTrades();
      } else {
        setTrades([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-calculate PnL and R:R – improved & fixed
  useEffect(() => {
    const entry = Number(form.entry) || 0;
    const exitPrice = Number(form.exit) || 0;
    const sl = Number(form.stopLoss) || 0;
    const tp = Number(form.takeProfit) || 0;
    const lot = Number(form.lotSize) || 0.1;
    const lev = Number(form.leverage) || 100;

    // PnL (adjusted multiplier for more realistic values)
    let calculatedPnL = "";
    if (entry && exitPrice && lot && lev) {
      const priceDiff = form.direction === "Long" ? (exitPrice - entry) : (entry - exitPrice);
      calculatedPnL = (priceDiff * lot * lev * 100).toFixed(2); // ×100 is common for indices/forex
    }

    // Risk:Reward – fixed logic
    let calculatedRR = "";
    if (entry && sl && tp) {
      const risk = form.direction === "Long" ? (entry - sl) : (sl - entry);
      const reward = form.direction === "Long" ? (tp - entry) : (entry - tp);
      if (risk !== 0) {
        calculatedRR = (reward / risk).toFixed(2);
      } else if (reward > 0) {
        calculatedRR = "∞"; // risk-free trade
      }
    }

    setForm((prev) => ({
      ...prev,
      pnl: calculatedPnL,
      rr: calculatedRR,
    }));
  }, [form.entry, form.exit, form.stopLoss, form.takeProfit, form.lotSize, form.leverage, form.direction]);

  // Today's trades & metrics
  const todayTrades = useMemo(() => {
    const today = formatDateInput();
    return trades.filter((t) => t.date === today);
  }, [trades]);

  const metrics = useMemo(() => {
    if (!todayTrades.length) {
      return { net: 0, wins: 0, losses: 0, winRate: 0, avgPnL: 0, expectancy: 0, total: 0 };
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

  // Save / Update trade
  const saveTrade = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const user = auth.currentUser;
    if (!user) {
      setError("Please log in first");
      return;
    }
    const payload = {
      date: form.date || formatDateInput(),
      pair: form.pair?.toUpperCase() || "",
      direction: form.direction || "Long",
      entry: Number(form.entry) || 0,
      exit: Number(form.exit) || 0,
      stopLoss: Number(form.stopLoss) || 0,
      takeProfit: Number(form.takeProfit) || 0,
      pnl: Number(form.pnl) || 0,
      rr: form.rr || "",
      leverage: Number(form.leverage) || 100,
      lotSize: Number(form.lotSize) || 0.1,
      notes: form.notes || "",
    };
    try {
      if (editingTrade) {
        const tradeRef = doc(db, "users", user.uid, "trades", editingTrade.id);
        await updateDoc(tradeRef, payload);
        setSuccessMsg("Trade updated successfully!");
      } else {
        await addDoc(collection(db, "users", user.uid, "trades"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setSuccessMsg("Trade added successfully!");
      }
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
        pnl: "",
        rr: "",
        leverage: "100",
        lotSize: "0.1",
      });
      await refreshTrades();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save trade: " + err.message);
    }
  };

  // Delete single trade
  const deleteTrade = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "trades", id));
      setSuccessMsg("Trade deleted successfully");
      await refreshTrades();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete trade");
    }
    setDeleteModalOpen(false);
    setTradeToDelete(null);
  };

  // Clear all today's trades
  const clearTodayTrades = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const batch = todayTrades.map((t) =>
        deleteDoc(doc(db, "users", user.uid, "trades", t.id))
      );
      await Promise.all(batch);
      setSuccessMsg("Today's trades cleared successfully");
      await refreshTrades();
    } catch (err) {
      console.error("Batch delete failed:", err);
      setError("Failed to clear trades");
    }
    setDeleteModalOpen(false);
  };

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors duration-300
        ${isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header - better spacing on mobile */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Daily Journal
            </h1>
            <p className="text-sm sm:text-base mt-1 opacity-80">
              Log trades with automatic PnL & R:R calculation
            </p>
          </div>
          <Button
            onClick={() => {
              setModalOpen(true);
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
                pnl: "",
                rr: "",
                leverage: "100",
                lotSize: "0.1",
              });
            }}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          >
            <Plus size={18} className="mr-2" /> Add Trade
          </Button>
        </div>

        {/* Today's Metrics - responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="text-xs font-medium opacity-70 mb-1">Net P&L Today</div>
            <div
              className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                metrics.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {metrics.net >= 0 ? "+" : "-"}${Math.abs(metrics.net).toFixed(2)}
            </div>
          </Card>
          <Card className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="text-xs font-medium opacity-70 mb-1">Win Rate</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {metrics.winRate}%
            </div>
          </Card>
          <Card className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="text-xs font-medium opacity-70 mb-1">Wins / Losses</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-violet-600 dark:text-violet-400">
              {metrics.wins} / {metrics.losses}
            </div>
          </Card>
          <Card className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="text-xs font-medium opacity-70 mb-1">Avg P&L</div>
            <div
              className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                metrics.avgPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {metrics.avgPnL >= 0 ? "+" : "-"}${Math.abs(metrics.avgPnL).toFixed(2)}
            </div>
          </Card>
        </div>

        {/* Trades List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-400">{error}</div>
        ) : todayTrades.length === 0 ? (
          <Card className="p-8 sm:p-10 text-center bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
            <p className="text-lg sm:text-xl font-medium opacity-70 mb-2">No trades logged today</p>
            <p className="text-sm opacity-60 mb-6">Add your first trade to start tracking performance</p>
            <Button
              onClick={() => {
                setModalOpen(true);
                setEditingTrade(null);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
            >
              <Plus size={18} className="mr-2" /> Log First Trade
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {todayTrades.map((trade) => (
              <Card
                key={trade.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-xl transition-all duration-200 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shadow-sm ${
                          Number(trade.pnl || 0) >= 0
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        }`}
                      >
                        {trade.pair?.slice(0, 2) || "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-base sm:text-lg">
                          {trade.pair || "—"} • {trade.direction || "—"}
                        </div>
                        <div className="text-xs sm:text-sm opacity-70 flex flex-wrap gap-3 mt-1">
                          <span>Lot: {trade.lotSize || "—"}</span>
                          <span>Leverage: {trade.leverage || "—"}:1</span>
                          {trade.rr && <span>R:R {trade.rr}</span>}
                        </div>
                      </div>
                    </div>
                    {trade.notes && (
                      <div className="text-sm opacity-80 line-clamp-2 mt-1">
                        <FileText size={14} className="inline mr-1" />
                        {trade.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                    <div className="text-right min-w-[100px]">
                      <div
                        className={`text-xl sm:text-2xl font-bold ${
                          Number(trade.pnl || 0) >= 0
                            ? "text-emerald-700 dark:text-emerald-500"
                            : "text-rose-700 dark:text-rose-500"
                        }`}
                      >
                        {Number(trade.pnl || 0) >= 0 ? "+" : "-"}$
                        {Math.abs(Number(trade.pnl || 0)).toFixed(2)}
                      </div>
                      {trade.rr && <div className="text-xs opacity-70">R:R {trade.rr}</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setEditingTrade(trade);
                          setForm({
                            date: trade.date || formatDateInput(),
                            pair: trade.pair || "",
                            direction: trade.direction || "Long",
                            entry: trade.entry?.toString() || "",
                            exit: trade.exit?.toString() || "",
                            stopLoss: trade.stopLoss?.toString() || "",
                            takeProfit: trade.takeProfit?.toString() || "",
                            notes: trade.notes || "",
                            pnl: trade.pnl?.toString() || "",
                            rr: trade.rr || "",
                            leverage: trade.leverage?.toString() || "100",
                            lotSize: trade.lotSize?.toString() || "0.1",
                          });
                          setModalOpen(true);
                        }}
                        className="h-10 w-10 rounded-lg"
                      >
                        <Edit size={18} />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => {
                          setTradeToDelete(trade.id);
                          setDeleteModalOpen(true);
                        }}
                        className="h-10 w-10 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add / Edit Trade Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div
              className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border backdrop-blur-md
                ${isDark ? "bg-gray-900/95 border-gray-700/60" : "bg-white/95 border-gray-200/60"}`}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    {editingTrade ? "Edit Trade" : "Add New Trade"}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                    <X size={24} />
                  </Button>
                </div>

                <form onSubmit={saveTrade} className="space-y-5">
                  {/* Date & Asset */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Date</Label>
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Pair / Asset</Label
