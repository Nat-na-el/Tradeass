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
const formatNumber = (num) => {
  if (!num && num !== 0) return "";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const COMMON_ASSETS = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "NZDUSD", "USDCHF",
  "EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "CADJPY", "CHFJPY",
  "UK100", "US30", "NAS100", "SPX500", "DE40", "JP225", "FRA40", "AUS200",
  "HSI", "CHINA50", "UK100.cash", "US30.cash", "NAS100.cash",
  "AAPL", "TSLA", "AMZN", "GOOGL", "MSFT", "NVDA", "META", "NFLX", "AMD", "INTC",
  "BABA", "PDD", "JD", "SHOP", "SQ", "PYPL", "DIS", "BA", "GE", "F"
];
export default function DailyJournal({ currentAccount }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [entries, setEntries] = useState([]); // renamed from trades to entries for clarity
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
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
  // Fetch journal entries from current account subcollection
  const refreshEntries = async () => {
    const user = auth.currentUser;
    if (!user) {
      setEntries([]);
      setLoading(false);
      setError("Please log in to see your journal entries");
      return;
    }
    if (!currentAccount?.id) {
      setEntries([]);
      setLoading(false);
      setError("No account selected. Please choose one from the sidebar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const entriesRef = collection(
        db,
        "users",
        user.uid,
        "accounts",
        currentAccount.id,
        "journals" // ← changed to "journals" subcollection
      );
      const q = query(entriesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(loaded);
    } catch (err) {
      console.error("❌ Journal fetch error:", err);
      setError("Could not load journal entries. " + (err.message || ""));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };
  // Re-fetch when auth state or currentAccount changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        refreshEntries();
      } else {
        setEntries([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [currentAccount]);
  // Auto-calculate PnL and R:R
  useEffect(() => {
    const entry = Number(form.entry) || 0;
    const exitPrice = Number(form.exit) || 0;
    const sl = Number(form.stopLoss) || 0;
    const tp = Number(form.takeProfit) || 0;
    const lot = Number(form.lotSize) || 0.1;
    const lev = Number(form.leverage) || 100;
    let calculatedPnL = "";
    if (entry && exitPrice && lot && lev) {
      const priceDiff = form.direction === "Long" ? (exitPrice - entry) : (entry - exitPrice);
      calculatedPnL = (priceDiff * lot * lev * 100).toFixed(2);
    }
    let calculatedRR = "";
    if (entry && sl && tp) {
      const risk = form.direction === "Long" ? (entry - sl) : (sl - entry);
      const reward = form.direction === "Long" ? (tp - entry) : (entry - tp);
      if (risk !== 0) {
        calculatedRR = (reward / risk).toFixed(2);
      } else if (reward > 0) {
        calculatedRR = "∞";
      }
    }
    setForm((prev) => ({
      ...prev,
      pnl: calculatedPnL,
      rr: calculatedRR,
    }));
  }, [form.entry, form.exit, form.stopLoss, form.takeProfit, form.lotSize, form.leverage, form.direction]);
  // Today's entries
  const todayEntries = useMemo(() => {
    const today = formatDateInput();
    return entries.filter((e) => e.date === today);
  }, [entries]);
  // Metrics for today
  const metrics = useMemo(() => {
    if (!todayEntries.length) {
      return { net: 0, wins: 0, losses: 0, winRate: 0, avgPnL: 0 };
    }
    const total = todayEntries.length;
    let net = 0;
    let wins = 0;
    todayEntries.forEach((e) => {
      const pnl = Number(e.pnl || 0);
      net += pnl;
      if (pnl > 0) wins++;
    });
    const winRate = Math.round((wins / total) * 100);
    const avgPnL = net / total;
    return {
      net: net.toFixed(2),
      wins,
      losses: total - wins,
      winRate,
      avgPnL: avgPnL.toFixed(2),
    };
  }, [todayEntries]);
  // Save entry (add or update)
  const saveEntry = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) {
      setError("Please log in and select an account");
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
      if (editingEntry) {
        const entryRef = doc(
          db,
          "users",
          user.uid,
          "accounts",
          currentAccount.id,
          "journals",
          editingEntry.id
        );
        await updateDoc(entryRef, payload);
        setSuccessMsg("Entry updated successfully!");
      } else {
        await addDoc(
          collection(db, "users", user.uid, "accounts", currentAccount.id, "journals"),
          {
            ...payload,
            createdAt: serverTimestamp(),
          }
        );
        setSuccessMsg("Entry added successfully!");
      }
      setModalOpen(false);
      setEditingEntry(null);
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
      await refreshEntries();
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save entry: " + err.message);
    }
  };
  // Delete single entry
  const deleteEntry = async (id) => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) return;
    try {
      await deleteDoc(
        doc(db, "users", user.uid, "accounts", currentAccount.id, "journals", id)
      );
      setSuccessMsg("Entry deleted successfully");
      await refreshEntries();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete entry");
    }
    setDeleteModalOpen(false);
    setEntryToDelete(null);
  };
  // Optional: clear all today's entries
  const clearTodayEntries = async () => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) return;
    try {
      const batchPromises = todayEntries.map((e) =>
        deleteDoc(
          doc(db, "users", user.uid, "accounts", currentAccount.id, "journals", e.id)
        )
      );
      await Promise.all(batchPromises);
      setSuccessMsg("Today's entries cleared successfully");
      await refreshEntries();
    } catch (err) {
      console.error("Batch delete failed:", err);
      setError("Failed to clear entries");
    }
    setDeleteModalOpen(false);
  };
  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 transition-colors duration-300
        ${isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}
    >
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Daily Journal {currentAccount ? `– ${currentAccount.name}` : ""}
            </h1>
            <p className="text-sm sm:text-base mt-1 opacity-80">
              Log trades with automatic PnL & R:R calculation
            </p>
          </div>
          <Button
            onClick={() => {
              setModalOpen(true);
              setEditingEntry(null);
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
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md py-5 sm:py-4 text-base"
          >
            <Plus size={18} className="mr-2" /> Add Entry
          </Button>
        </div>
        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 rounded-xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md">
            <div className="text-xs font-medium opacity-70 mb-1">Net P&L Today</div>
            <div
              className={`text-xl sm:text-2xl font-bold ${
                metrics.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {metrics.net >= 0 ? "+" : "-"}${formatNumber(Math.abs(metrics.net))}
            </div>
          </Card>
          <Card className="p-4 rounded-xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md">
            <div className="text-xs font-medium opacity-70 mb-1">Win Rate</div>
            <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {metrics.winRate}%
            </div>
          </Card>
          <Card className="p-4 rounded-xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md">
            <div className="text-xs font-medium opacity-70 mb-1">Wins / Losses</div>
            <div className="text-xl sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
              {metrics.wins} / {metrics.losses}
            </div>
          </Card>
          <Card className="p-4 rounded-xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md">
            <div className="text-xs font-medium opacity-70 mb-1">Avg P&L</div>
            <div
              className={`text-xl sm:text-2xl font-bold ${
                metrics.avgPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {metrics.avgPnL >= 0 ? "+" : "-"}${formatNumber(Math.abs(metrics.avgPnL))}
            </div>
          </Card>
        </div>
        {/* Entries List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-400">{error}</div>
        ) : todayEntries.length === 0 ? (
          <Card className="p-6 sm:p-8 text-center bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
            <p className="text-lg sm:text-xl font-medium opacity-70 mb-3">
              No entries logged today in {currentAccount?.name || "this account"}
            </p>
            <p className="text-sm opacity-60 mb-5">
              Add your first journal entry to start tracking
            </p>
            <Button
              onClick={() => {
                setModalOpen(true);
                setEditingEntry(null);
              }}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={18} className="mr-2" /> Log First Entry
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {todayEntries.map((entry) => (
              <Card
                key={entry.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-xl transition-all duration-200 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shadow-sm flex-shrink-0 ${
                          Number(entry.pnl || 0) >= 0
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        }`}
                      >
                        {entry.pair?.slice(0, 2) || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-base sm:text-lg truncate">
                          {entry.pair || "—"} • {entry.direction || "—"}
                        </div>
                        <div className="text-xs sm:text-sm opacity-70 flex flex-wrap gap-2 mt-1">
                          <span>Lot: {entry.lotSize || "—"}</span>
                          <span>Leverage: {entry.leverage || "—"}:1</span>
                          {entry.rr && <span>R:R {entry.rr}</span>}
                        </div>
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="text-xs sm:text-sm opacity-80 line-clamp-2 mt-1">
                        <FileText size={14} className="inline mr-1" />
                        {entry.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                    <div className="text-right min-w-[100px]">
                      <div
                        className={`text-xl sm:text-2xl font-bold ${
                          Number(entry.pnl || 0) >= 0
                            ? "text-emerald-700 dark:text-emerald-500"
                            : "text-rose-700 dark:text-rose-500"
                        }`}
                      >
                        {Number(entry.pnl || 0) >= 0 ? "+" : "-"}${formatNumber(Math.abs(Number(entry.pnl || 0)))}
                      </div>
                      {entry.rr && <div className="text-xs opacity-70">R:R {entry.rr}</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setEditingEntry(entry);
                          setForm({
                            date: entry.date || formatDateInput(),
                            pair: entry.pair || "",
                            direction: entry.direction || "Long",
                            entry: entry.entry?.toString() || "",
                            exit: entry.exit?.toString() || "",
                            stopLoss: entry.stopLoss?.toString() || "",
                            takeProfit: entry.takeProfit?.toString() || "",
                            notes: entry.notes || "",
                            pnl: entry.pnl?.toString() || "",
                            rr: entry.rr || "",
                            leverage: entry.leverage?.toString() || "100",
                            lotSize: entry.lotSize?.toString() || "0.1",
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
                          setEntryToDelete(entry.id);
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
        {/* Add / Edit Entry Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div
              className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border backdrop-blur-md
                ${isDark ? "bg-gray-900/95 border-gray-700/60" : "bg-white/95 border-gray-200/60"}`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    {editingEntry ? "Edit Entry" : "Add New Entry"}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                    <X size={24} />
                  </Button>
                </div>
                <form onSubmit={saveEntry} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Date</Label>
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Pair / Asset</Label>
                      <Input
                        list="assets-list"
                        value={form.pair}
                        onChange={(e) => setForm({ ...form, pair: e.target.value.toUpperCase() })}
                        placeholder="Type or select..."
                      />
                      <datalist id="assets-list">
                        {COMMON_ASSETS.map((asset) => (
                          <option key={asset} value={asset} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Direction</Label>
                      <select
                        value={form.direction}
                        onChange={(e) => setForm({ ...form, direction: e.target.value })}
                        className={`w-full p-3 rounded-xl border text-sm ${
                          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                        } focus:ring-2 focus:ring-indigo-500 outline-none`}
                      >
                        <option value="Long">Long</option>
                        <option value="Short">Short</option>
                      </select>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Leverage</Label>
                      <Input
                        type="number"
                        step="1"
                        min="1"
                        value={form.leverage}
                        onChange={(e) => setForm({ ...form, leverage: e.target.value })}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Lot Size</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={form.lotSize}
                        onChange={(e) => setForm({ ...form, lotSize: e.target.value })}
                        placeholder="0.1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Entry Price</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={form.entry}
                        onChange={(e) => setForm({ ...form, entry: e.target.value })}
                        placeholder="1.08500"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Exit Price</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={form.exit}
                        onChange={(e) => setForm({ ...form, exit: e.target.value })}
                        placeholder="1.09000"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">P&L (auto)</Label>
                      <Input
                        type="text"
                        value={formatNumber(form.pnl)}
                        readOnly
                        placeholder="Auto-calculated"
                        className={`w-full p-3 rounded-xl border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed font-bold text-sm ${
                          Number(form.pnl) > 0
                            ? "text-emerald-700 dark:text-emerald-500"
                            : Number(form.pnl) < 0
                            ? "text-rose-700 dark:text-rose-500"
                            : ""
                        }`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Stop Loss</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={form.stopLoss}
                        onChange={(e) => setForm({ ...form, stopLoss: e.target.value })}
                        placeholder="1.08200"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">Take Profit</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={form.takeProfit}
                        onChange={(e) => setForm({ ...form, takeProfit: e.target.value })}
                        placeholder="1.09500"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1.5">R:R (auto)</Label>
                      <Input
                        type="text"
                        value={form.rr}
                        readOnly
                        placeholder="Auto-calculated"
                        className={`w-full p-3 rounded-xl border bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed font-bold text-sm`}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium mb-1.5">Notes / Thoughts</Label>
                    <textarea
                      placeholder="What went well? What to improve? Emotional state? Market context?..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className={`w-full p-3 rounded-xl border min-h-[100px] text-sm resize-y focus:ring-2 focus:ring-indigo-500 outline-none ${
                        isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3 bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                      <Check size={16} />
                      {successMsg}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-6 sm:py-4 text-base"
                    >
                      {editingEntry ? "Update Entry" : "Save Entry"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-6 sm:py-4 text-base"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation */}
        {deleteModalOpen && (
          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setEntryToDelete(null);
            }}
            onConfirm={entryToDelete ? () => deleteEntry(entryToDelete) : clearTodayEntries}
            title={entryToDelete ? "Delete Entry" : "Clear Today's Entries"}
            message={
              entryToDelete
                ? "Are you sure you want to delete this journal entry? This action cannot be undone."
                : `Are you sure you want to delete all ${todayEntries.length} entries from today?`
            }
          />
        )}
      </div>
    </div>
  );
}
