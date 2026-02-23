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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "success" });

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

  // ─── Fetch trades ──────────────────────────────────────────────
  const refreshTrades = async () => {
    const user = auth.currentUser;
    if (!user) {
      setTrades([]);
      setLoading(false);
      setError("Please sign in to view your trades");
      return;
    }

    if (!currentAccount?.id) {
      setTrades([]);
      setLoading(false);
      return; // UI will show onboarding card
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
      const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTrades(loaded);
    } catch (err) {
      console.error("Trades fetch failed:", err);
      setError("Unable to load trades. Please try again later.");
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) refreshTrades();
      else {
        setTrades([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [currentAccount]);

  // ─── Filtered & Sorted ─────────────────────────────────────────
  const filteredTrades = useMemo(() => {
    let result = [...trades];

    if (selectedDate) {
      result = result.filter((t) => t.date?.startsWith(selectedDate));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          (t.pair || "").toLowerCase().includes(q) ||
          (t.notes || "").toLowerCase().includes(q) ||
          (t.strategy || "").toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortBy === "date-asc") return new Date(a.date || 0) - new Date(b.date || 0);
      if (sortBy === "pnl-desc") return Number(b.pnl || 0) - Number(a.pnl || 0);
      if (sortBy === "pnl-asc") return Number(a.pnl || 0) - Number(b.pnl || 0);
      if (sortBy === "pair") return (a.pair || "").localeCompare(b.pair || "");
      return 0;
    });

    return result;
  }, [trades, selectedDate, searchQuery, sortBy]);

  // ─── Stats ─────────────────────────────────────────────────────
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

  // ─── Edit Handlers ─────────────────────────────────────────────
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

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingTrade) return;

    const user = auth.currentUser;
    if (!user || !currentAccount?.id) {
      setMessage({ text: "No account selected", type: "error" });
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

      setMessage({ text: "Trade updated successfully", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 4000);
      setEditModalOpen(false);
      setEditingTrade(null);
      await refreshTrades();
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ text: "Failed to update trade", type: "error" });
    }
  };

  // ─── Delete ────────────────────────────────────────────────────
  const deleteTrade = async (id) => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) return;

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "accounts", currentAccount.id, "trades", id)
      );
      setMessage({ text: "Trade deleted", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "success" }), 4000);
      await refreshTrades();
    } catch (err) {
      setMessage({ text: "Failed to delete trade", type: "error" });
    }

    setDeleteModalOpen(false);
    setTradeToDelete(null);
  };

  // ─── Export ────────────────────────────────────────────────────
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
    link.download = `trades-${currentAccount?.name || "account"}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // ─── Migration (optional one-time) ─────────────────────────────
  const migrateOldTrades = async () => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) {
      setMessage({ text: "No account selected", type: "error" });
      return;
    }

    try {
      const oldSnap = await getDocs(collection(db, "users", user.uid, "trades"));
      if (oldSnap.empty) {
        setMessage({ text: "No legacy trades found", type: "info" });
        return;
      }

      const batch = writeBatch(db);
      oldSnap.forEach((old) => {
        const newRef = doc(collection(db, "users", user.uid, "accounts", currentAccount.id, "trades"));
        batch.set(newRef, old.data());
        batch.delete(old.ref);
      });

      await batch.commit();
      setMessage({ text: `Migrated ${oldSnap.size} legacy trades`, type: "success" });
      refreshTrades();
    } catch (err) {
      setMessage({ text: "Migration failed", type: "error" });
    }
  };

  // ────────────────────────────────────────────────────────────────
  // RENDERING
  // ────────────────────────────────────────────────────────────────

  if (!currentAccount?.id) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
        <Card className="max-w-lg w-full p-10 text-center shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl">
          <AlertCircle size={64} className="mx-auto text-amber-500 mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            No Trading Account Selected
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
            To start tracking trades and performance, please select or create a trading account.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg px-10 py-6 text-lg font-medium"
              onClick={() => navigate("/edit-balance-pnl")}
            >
              Create New Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 px-10 py-6 text-lg font-medium"
              onClick={() => navigate("/trades/new")}
            >
              Add Your First Trade
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors duration-300
        ${isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            {currentAccount.name} – Trade History
          </h1>
          <p className="mt-2 text-lg opacity-80">Review and manage your executed trades</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={exportCSV}
            disabled={!filteredTrades.length || loading}
            variant="outline"
          >
            <Download size={18} className="mr-2" /> Export CSV
          </Button>
          <Button
            onClick={migrateOldTrades}
            variant="outline"
            className="border-amber-600 text-amber-600 hover:bg-amber-50"
          >
            Migrate Legacy Trades
          </Button>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm ${
            message.type === "success"
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200"
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
            onChange={(e) => setSearchParams(e.target.value ? { date: e.target.value } : {})}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
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

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-rose-500 text-xl font-medium">{error}</div>
      ) : filteredTrades.length === 0 ? (
        <Card className="p-12 text-center bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-w-2xl mx-auto">
          <AlertCircle size={72} className="mx-auto text-amber-500 mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            No trades recorded yet
          </h2>
          <p className="text-lg opacity-80 mb-10 leading-relaxed">
            Begin tracking your trading performance by adding your first trade.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg px-10 py-7 text-xl font-medium"
              onClick={() => navigate("/trades/new")}
            >
              <PlusCircle size={24} className="mr-3" />
              Add New Trade
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-600/10 px-10 py-7 text-xl font-medium"
              onClick={() => navigate("/journal")}
            >
              <BookOpen size={24} className="mr-3" />
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
                      {Number(trade.pnl || 0) >= 0 ? "+" : ""}${Math.abs(Number(trade.pnl || 0)).toFixed(2)}
                    </div>
                    {trade.rr && <div className="text-xs opacity-70">R:R {trade.rr}</div>}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setSelectedTrade(trade)}
                      className="h-10 w-10 rounded-lg"
                    >
                      <Eye size={18} />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => openEdit(trade)}
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

      {/* Modals – keep your original modal code here */}
      {/* View Details Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4">
          <div
            className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border backdrop-blur-md
              ${isDark ? "bg-gray-900/95 border-gray-700/60" : "bg-white/95 border-gray-200/60"}`}
          >
            {/* ... your original view modal content ... */}
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
            {/* ... your original edit form ... */}
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
