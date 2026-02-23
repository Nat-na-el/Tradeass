import React, { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../Theme-provider";
import {
  Trash2,
  Eye,
  Download,
  X,
  FileText,
  Edit,
  Check,
  AlertCircle,
  PlusCircle,
  BookOpen,
} from "lucide-react";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import { db, auth, writeBatch } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function Trades({ currentAccount }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedDate = searchParams.get("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const [selectedTrade, setSelectedTrade] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [editForm, setEditForm] = useState({
    pair: "",
    direction: "",
    entry: "",
    exit: "",
    stopLoss: "",
    takeProfit: "",
    rr: "",
    pnl: "",
    notes: "",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);

  const [message, setMessage] = useState({ text: "", type: "success" });

  // Fetch trades from current account's subcollection
  const refreshTrades = async () => {
    const user = auth.currentUser;
    if (!user) {
      setTrades([]);
      setLoading(false);
      setError("Please log in to view your trades");
      return;
    }

    if (!currentAccount?.id) {
      setTrades([]);
      setLoading(false);
      setError("No account selected. Please choose one from the sidebar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tradesRef = collection(
        db,
        "users",
        user.uid,
        "accounts",
        currentAccount.id,
        "trades"
      );
      const q = query(tradesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const loadedTrades = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrades(loadedTrades);
    } catch (err) {
      console.error("❌ Trades fetch error:", err);
      setError("Failed to load trades: " + (err.message || "Check connection"));
      setTrades([]);
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
  }, [currentAccount]);

  // Filtered & Sorted trades
  const filteredTrades = useMemo(() => {
    let result = trades;

    if (selectedDate) {
      result = result.filter((t) => t.date?.startsWith(selectedDate));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.pair?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.strategy?.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "pnl-desc") return Number(b.pnl || 0) - Number(a.pnl || 0);
      if (sortBy === "pnl-asc") return Number(a.pnl || 0) - Number(b.pnl || 0);
      if (sortBy === "pair") return (a.pair || "").localeCompare(b.pair || "");
      return 0;
    });

    return result;
  }, [trades, selectedDate, searchQuery, sortBy]);

  // Stats
  const stats = useMemo(() => {
    if (!filteredTrades.length) return { totalPnL: 0, winRate: 0, totalTrades: 0, avgRR: 0 };
    const total = filteredTrades.length;
    const wins = filteredTrades.filter((t) => Number(t.pnl || 0) > 0).length;
    const totalPnL = filteredTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
    const totalRR = filteredTrades.reduce((sum, t) => sum + Number(t.rr || 0), 0);
    return {
      totalPnL: totalPnL.toFixed(2),
      winRate: total ? Math.round((wins / total) * 100) : 0,
      totalTrades: total,
      avgRR: total ? (totalRR / total).toFixed(2) : 0,
    };
  }, [filteredTrades]);

  // Open edit modal
  const openEdit = (trade) => {
    setEditingTrade(trade);
    setEditForm({
      pair: trade.pair || "",
      direction: trade.direction || "Long",
      entry: trade.entry || "",
      exit: trade.exit || "",
      stopLoss: trade.stopLoss || "",
      takeProfit: trade.takeProfit || "",
      rr: trade.rr || "",
      pnl: trade.pnl || "",
      notes: trade.notes || "",
    });
    setEditModalOpen(true);
  };

  // Save edited trade
  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingTrade) return;

    const user = auth.currentUser;
    if (!user || !currentAccount?.id) {
      setMessage({ text: "No account or user logged in", type: "error" });
      return;
    }

    try {
      const tradeRef = doc(
        db,
        "users",
        user.uid,
        "accounts",
        currentAccount.id,
        "trades",
        editingTrade.id
      );
      await updateDoc(tradeRef, {
        ...editForm,
        updatedAt: serverTimestamp(),
      });

      setMessage({ text: "Trade updated successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 4000);
      setEditModalOpen(false);
      setEditingTrade(null);
      await refreshTrades();
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ text: "Error updating trade: " + err.message, type: "error" });
    }
  };

  // Delete trade
  const deleteTrade = async (id) => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) return;

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "accounts", currentAccount.id, "trades", id)
      );
      setMessage({ text: "Trade deleted successfully", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 4000);
      await refreshTrades();
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage({ text: "Failed to delete trade: " + err.message, type: "error" });
    }

    setDeleteModalOpen(false);
    setTradeToDelete(null);
  };

  // Export CSV
  const exportCSV = () => {
    if (!filteredTrades.length) return;

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

    const rows = filteredTrades.map((t) => [
      t.date || "",
      t.pair || "",
      t.direction || "",
      t.entry || "",
      t.exit || "",
      t.stopLoss || "",
      t.takeProfit || "",
      t.pnl || 0,
      t.rr || "",
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `forgex-trades-${currentAccount?.name || "account"}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // One-time migration of old flat trades (run once)
  const migrateOldTrades = async () => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) {
      setMessage({ text: "No user or account selected", type: "error" });
      return;
    }

    try {
      const oldTradesSnap = await getDocs(collection(db, "users", user.uid, "trades"));
      if (oldTradesSnap.empty) {
        setMessage({ text: "No old trades found to migrate", type: "info" });
        return;
      }

      const batch = writeBatch(db);
      oldTradesSnap.forEach((oldDoc) => {
        const newRef = doc(
          collection(db, "users", user.uid, "accounts", currentAccount.id, "trades")
        );
        batch.set(newRef, oldDoc.data());
        batch.delete(oldDoc.ref); // optional: remove old document
      });

      await batch.commit();
      setMessage({
        text: `Successfully migrated ${oldTradesSnap.size} old trades to ${currentAccount.name}!`,
        type: "success",
      });
      refreshTrades();
    } catch (err) {
      console.error("Migration error:", err);
      setMessage({ text: "Migration failed: " + err.message, type: "error" });
    }
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
            {currentAccount ? `${currentAccount.name} – Trade History` : "Trade History"}
          </h1>
          <p className="text-sm sm:text-base mt-1 opacity-80">
            View, analyze, and edit your executed trades {currentAccount ? `for ${currentAccount.name}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={exportCSV}
            disabled={!filteredTrades.length || loading}
            className="bg-gray-700 hover:bg-gray-800 text-white shadow-md disabled:opacity-50"
          >
            <Download size={18} className="mr-2" /> Export CSV
          </Button>
          {/* Optional: show migration button only if you still have old trades */}
          <Button
            onClick={migrateOldTrades}
            variant="outline"
            className="text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-600/10"
          >
            Migrate Old Trades (one-time)
          </Button>
        </div>
      </div>

      {/* Feedback message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm ${
            message.type === "success"
              ? "bg-emerald-100/90 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
              : "bg-rose-100/90 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700"
          }`}
        >
          {message.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2 opacity-80">Filter by Date</label>
          <input
            type="date"
            value={selectedDate || ""}
            onChange={(e) =>
              setSearchParams(e.target.value ? { date: e.target.value } : {})
            }
            className={`w-full p-3.5 rounded-xl border transition-all ${
              isDark
                ? "bg-gray-800/70 border-gray-700 text-gray-100 focus:border-indigo-500"
                : "bg-white/80 border-gray-300 text-gray-900 focus:border-indigo-500"
            } focus:ring-2 focus:ring-indigo-500/40 outline-none`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-80">Search Pair / Notes</label>
          <div className="relative">
            <input
              type="text"
              placeholder="EURUSD, revenge trade, FOMO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-3.5 pr-10 rounded-xl border transition-all ${
                isDark
                  ? "bg-gray-800/70 border-gray-700 text-gray-100 focus:border-indigo-500"
                  : "bg-white/80 border-gray-300 text-gray-900 focus:border-indigo-500"
              } focus:ring-2 focus:ring-indigo-500/40 outline-none`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-80">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`w-full p-3.5 rounded-xl border transition-all ${
              isDark
                ? "bg-gray-800/70 border-gray-700 text-gray-100 focus:border-indigo-500"
                : "bg-white/80 border-gray-300 text-gray-900 focus:border-indigo-500"
            } focus:ring-2 focus:ring-indigo-500/40 outline-none`}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="pnl-desc">Highest PnL</option>
            <option value="pnl-asc">Lowest PnL</option>
            <option value="pair">Pair (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <Card className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Total P&L</div>
          <div
            className={`text-2xl lg:text-3xl font-bold ${
              Number(stats.totalPnL) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {Number(stats.totalPnL) >= 0 ? "+" : "-"}${Math.abs(Number(stats.totalPnL)).toFixed(2)}
          </div>
        </Card>
        <Card className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Win Rate</div>
          <div className="text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.winRate}%
          </div>
        </Card>
        <Card className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Total Trades</div>
          <div className="text-2xl lg:text-3xl font-bold text-violet-600 dark:text-violet-400">
            {stats.totalTrades}
          </div>
        </Card>
        <Card className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="text-xs font-medium opacity-70 mb-1">Avg R:R</div>
          <div className="text-2xl lg:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
            {stats.avgRR}
          </div>
        </Card>
      </div>

      {/* No trades state – with buttons to add trade or journal */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-rose-400 text-xl font-medium">{error}</div>
      ) : filteredTrades.length === 0 ? (
        <Card className="p-12 text-center bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
          <AlertCircle size={64} className="mx-auto text-amber-500 mb-6 opacity-90" />
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
            No trades recorded yet
          </h2>
          <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
            {currentAccount
              ? `Start tracking your performance in ${currentAccount.name}. Add a trade or journal today's session.`
              : "Select or create an account from the sidebar to begin."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md px-8 py-6 text-lg"
              onClick={() => navigate("/trades/new")}
            >
              <PlusCircle size={20} className="mr-2" />
              Add New Trade
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-600/10 px-8 py-6 text-lg"
              onClick={() => navigate("/journal")}
            >
              <BookOpen size={20} className="mr-2" />
              Journal Today's Session
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTrades.map((trade) => (
            <Card
              key={trade.id}
              className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-xl transition-all duration-200 group"
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
                      <div className="font-semibold text-lg">
                        {trade.pair || "—"} • {trade.direction || "—"}
                      </div>
                      <div className="text-sm opacity-70 flex items-center gap-3 flex-wrap">
                        <span>
                          {trade.date ? format(parseISO(trade.date), "dd MMM yyyy • HH:mm") : "—"}
                        </span>
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

                <div className="flex items-center gap-6 sm:gap-10">
                  <div className="text-right min-w-[100px]">
                    <div
                      className={`text-xl font-bold ${
                        Number(trade.pnl || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {Number(trade.pnl || 0) >= 0 ? "+" : ""}$
                      {Math.abs(Number(trade.pnl || 0)).toFixed(2)}
                    </div>
                    {trade.rr && <div className="text-xs opacity-70">R:R {trade.rr}</div>}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setSelectedTrade(trade)}
                      className="h-10 w-10 rounded-lg"
                      disabled={loading}
                    >
                      <Eye size={18} />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => openEdit(trade)}
                      className="h-10 w-10 rounded-lg"
                      disabled={loading}
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
                      disabled={loading}
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

      {/* View Details Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4">
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border backdrop-blur-md
              ${isDark ? "bg-gray-900/95 border-gray-700/60" : "bg-white/95 border-gray-200/60"}`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Trade Details
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTrade(null)}>
                  <X size={24} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm opacity-70 mb-1">Pair & Direction</div>
                    <div className="text-xl font-semibold">
                      {selectedTrade.pair || "—"} • {selectedTrade.direction || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70 mb-1">Date & Time</div>
                    <div className="text-lg">
                      {selectedTrade.date
                        ? format(parseISO(selectedTrade.date), "PPP • p")
                        : "—"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm opacity-70 mb-1">Entry</div>
                      <div className="text-lg font-medium">{selectedTrade.entry || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-70 mb-1">Exit</div>
                      <div className="text-lg font-medium">{selectedTrade.exit || "—"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm opacity-70 mb-1">Stop Loss</div>
                      <div className="text-lg">{selectedTrade.stopLoss || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-70 mb-1">Take Profit</div>
                      <div className="text-lg">{selectedTrade.takeProfit || "—"}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70 mb-1">Risk:Reward</div>
                    <div className="text-xl font-bold text-violet-600 dark:text-violet-400">
                      {selectedTrade.rr || "—"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm opacity-70 mb-1">Profit & Loss</div>
                    <div
                      className={`text-3xl font-bold ${
                        Number(selectedTrade.pnl || 0) >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {Number(selectedTrade.pnl || 0) >= 0 ? "+" : ""}$
                      {Math.abs(Number(selectedTrade.pnl || 0)).toFixed(2)}
                    </div>
                  </div>
                  {selectedTrade.notes && (
                    <div>
                      <div className="text-sm opacity-70 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Journal Notes
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 whitespace-pre-wrap text-sm">
                        {selectedTrade.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
              <Button variant="outline" onClick={() => openEdit(selectedTrade)}>
                <Edit size={16} className="mr-2" /> Edit Trade
              </Button>
              <Button variant="outline" onClick={() => setSelectedTrade(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingTrade && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4">
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border backdrop-blur-md
              ${isDark ? "bg-gray-900/95 border-gray-700/60" : "bg-white/95 border-gray-200/60"}`}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Edit Trade
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setEditModalOpen(false)}>
                  <X size={24} />
                </Button>
              </div>

              <form onSubmit={saveEdit} className="space-y-5">
                {/* ... your original edit form fields remain unchanged ... */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Pair</label>
                    <input
                      value={editForm.pair}
                      onChange={(e) => setEditForm({ ...editForm, pair: e.target.value })}
                      className={`w-full p-3 rounded-xl border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Direction</label>
                    <select
                      value={editForm.direction}
                      onChange={(e) => setEditForm({ ...editForm, direction: e.target.value })}
                      className={`w-full p-3 rounded-xl border ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                      } focus:ring-2 focus:ring-indigo-500 outline-none`}
                    >
                      <option value="Long">Long</option>
                      <option value="Short">Short</option>
                    </select>
                  </div>
                </div>

                {/* ... rest of your edit form fields (entry, exit, pnl, stopLoss, takeProfit, rr, notes) ... */}
                {/* I omitted repeating them here to save space — keep them exactly as in your original code */}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1"
                    disabled={loading}
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
            setTradeToDelete(null);
          }}
          onConfirm={() => deleteTrade(tradeToDelete)}
          title="Delete Trade"
          message="Are you sure you want to delete this trade? This action cannot be undone."
        />
      )}
    </div>
  );
}
