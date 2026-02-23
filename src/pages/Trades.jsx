import React, { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "../components/ui/card";
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
  Loader2,
} from "lucide-react";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

export default function Trades({ currentAccount }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "success", visible: false });

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

  // Show message temporarily
  useEffect(() => {
    if (message.text) {
      setMessage((prev) => ({ ...prev, visible: true }));
      const timer = setTimeout(() => setMessage({ text: "", type: "success", visible: false }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Fetch trades
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
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tradesRef = collection(db, "users", user.uid, "accounts", currentAccount.id, "trades");
      const q = query(tradesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setTrades(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Trades fetch failed:", err);
      setError("Unable to load trades. Please try again.");
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) refreshTrades();
      else setTrades([]);
    });
    return unsubscribe;
  }, [currentAccount]);

  // Filtered + Sorted
  const filteredTrades = useMemo(() => {
    let result = [...trades];
    if (selectedDate) result = result.filter((t) => t.date?.startsWith(selectedDate));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          (t.pair || "").toLowerCase().includes(q) ||
          (t.notes || "").toLowerCase().includes(q)
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

  // Stats
  const stats = useMemo(() => {
    if (!filteredTrades.length) return { totalPnL: 0, winRate: 0, totalTrades: 0, avgRR: 0 };
    const total = filteredTrades.length;
    const wins = filteredTrades.filter((t) => Number(t.pnl || 0) > 0).length;
    const totalPnL = filteredTrades.reduce((s, t) => s + Number(t.pnl || 0), 0);
    const totalRR = filteredTrades.reduce((s, t) => s + Number(t.rr || 0), 0);
    return {
      totalPnL: totalPnL.toFixed(2),
      winRate: total ? Math.round((wins / total) * 100) : 0,
      totalTrades: total,
      avgRR: total ? (totalRR / total).toFixed(2) : 0,
    };
  }, [filteredTrades]);

  // Edit
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
    if (!user || !currentAccount?.id) return;

    try {
      const ref = doc(db, "users", user.uid, "accounts", currentAccount.id, "trades", editingTrade.id);
      await updateDoc(ref, { ...editForm, updatedAt: serverTimestamp() });
      setMessage({ text: "Trade updated successfully", type: "success" });
      setEditModalOpen(false);
      setEditingTrade(null);
      refreshTrades();
    } catch (err) {
      setMessage({ text: "Failed to update trade", type: "error" });
    }
  };

  // Delete
  const deleteTrade = async (id) => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "accounts", currentAccount.id, "trades", id));
      setMessage({ text: "Trade deleted", type: "success" });
      refreshTrades();
    } catch (err) {
      setMessage({ text: "Failed to delete", type: "error" });
    }
    setDeleteModalOpen(false);
    setTradeToDelete(null);
  };

  // Export
  const exportCSV = () => {
    if (!filteredTrades.length) return;
    const headers = ["Date", "Pair", "Direction", "Entry", "Exit", "SL", "TP", "PnL", "R:R", "Notes"];
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
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trades-${currentAccount?.name || "all"}-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  // Migration
  const migrateOldTrades = async () => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) return setMessage({ text: "No account selected", type: "error" });

    try {
      const old = await getDocs(collection(db, "users", user.uid, "trades"));
      if (old.empty) return setMessage({ text: "No legacy trades", type: "info" });

      const batch = writeBatch(db);
      old.forEach(d => {
        const newRef = doc(collection(db, "users", user.uid, "accounts", currentAccount.id, "trades"));
        batch.set(newRef, d.data());
        batch.delete(d.ref);
      });
      await batch.commit();
      setMessage({ text: `Migrated ${old.size} trades`, type: "success" });
      refreshTrades();
    } catch (err) {
      setMessage({ text: "Migration failed", type: "error" });
    }
  };

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────

  if (!currentAccount?.id) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
        <Card className="max-w-lg w-full p-12 text-center shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700">
          <AlertCircle className="mx-auto h-16 w-16 text-amber-500 mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            No Trading Account Selected
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            To view and manage your trades, please select or create a trading account.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg px-10 py-6 text-lg"
              onClick={() => navigate("/edit-balance-pnl")}
            >
              Create New Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 px-10 py-6 text-lg"
              onClick={() => navigate("/trades/new")}
            >
              Add First Trade
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors
        ${isDark ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100" : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {currentAccount.name} – Trades
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Track and analyze your trading performance
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={exportCSV}
              disabled={!filteredTrades.length || loading}
              className="border-gray-300 dark:border-gray-700"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={migrateOldTrades}
              className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
            >
              Migrate Legacy Trades
            </Button>
          </div>
        </div>

        {/* Messages */}
        {message.visible && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-5 duration-300 ${
              message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                : "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="mb-2 block text-sm font-medium">Filter by Date</Label>
            <Input
              type="date"
              value={selectedDate || ""}
              onChange={(e) => setSearchParams(e.target.value ? { date: e.target.value } : {})}
              className="h-11"
            />
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">Search Pair / Notes</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="EURUSD, revenge trade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">Sort By</Label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="pnl-desc">Highest PnL</option>
              <option value="pnl-asc">Lowest PnL</option>
              <option value="pair">Pair (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold mt-1 ${Number(stats.totalPnL) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {Number(stats.totalPnL) >= 0 ? "+" : ""}${Math.abs(Number(stats.totalPnL)).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.winRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
              <p className="text-2xl font-bold text-violet-600 mt-1">{stats.totalTrades}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Avg R:R</p>
              <p className="text-2xl font-bold text-cyan-600 mt-1">{stats.avgRR}</p>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading trades...</p>
          </div>
        ) : error ? (
          <Card className="p-10 text-center border-destructive/50 bg-destructive/5">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium text-destructive">{error}</p>
          </Card>
        ) : filteredTrades.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2 border-muted-foreground/30 bg-muted/20 rounded-2xl">
            <div className="mx-auto max-w-md">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-6 opacity-70" />
              <h3 className="text-2xl font-semibold mb-3">No Trades Yet</h3>
              <p className="text-muted-foreground mb-8">
                Begin building your trading history by adding your first trade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg px-8 py-6 text-lg"
                  onClick={() => navigate("/trades/new")}
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> Add First Trade
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg"
                  onClick={() => navigate("/journal")}
                >
                  <BookOpen className="mr-2 h-5 w-5" /> Journal Session
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <Card
                key={trade.id}
                className="overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-sm ${
                            Number(trade.pnl || 0) >= 0
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                          }`}
                        >
                          {trade.pair?.slice(0, 2) || "?"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-semibold truncate">
                              {trade.pair || "—"} • {trade.direction}
                            </h3>
                            {trade.rr && (
                              <Badge variant="outline" className="text-xs">
                                R:R {trade.rr}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                            <span>{trade.date ? format(parseISO(trade.date), "dd MMM yyyy • HH:mm") : "—"}</span>
                            <span>Entry: {trade.entry || "—"}</span>
                            <span>Exit: {trade.exit || "—"}</span>
                          </div>

                          {trade.notes && (
                            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                              <FileText className="inline h-4 w-4 mr-1.5" />
                              {trade.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end p-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 bg-muted/30 dark:bg-muted/20">
                      <div className="text-right mr-6">
                        <div
                          className={`text-3xl font-bold ${
                            Number(trade.pnl || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {Number(trade.pnl || 0) >= 0 ? "+" : ""}${Math.abs(Number(trade.pnl || 0)).toFixed(2)}
                        </div>
                        {trade.rr && <div className="text-sm text-muted-foreground mt-1">R:R {trade.rr}</div>}
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setSelectedTrade(trade)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => openEdit(trade)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 border-destructive/50 hover:bg-destructive/10 text-destructive"
                          onClick={() => {
                            setTradeToDelete(trade.id);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Details Modal */}
        {selectedTrade && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <Card className="w-full max-w-3xl border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Trade Details
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTrade(null)}>
                  <X className="h-6 w-6" />
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Pair & Direction</p>
                    <p className="text-xl font-semibold mt-1">
                      {selectedTrade.pair || "—"} • {selectedTrade.direction || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="text-lg mt-1">
                      {selectedTrade.date ? format(parseISO(selectedTrade.date), "PPP • p") : "—"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entry</p>
                      <p className="text-lg font-medium mt-1">{selectedTrade.entry || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exit</p>
                      <p className="text-lg font-medium mt-1">{selectedTrade.exit || "—"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Stop Loss</p>
                      <p className="text-lg mt-1">{selectedTrade.stopLoss || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Take Profit</p>
                      <p className="text-lg mt-1">{selectedTrade.takeProfit || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk:Reward</p>
                    <p className="text-xl font-bold text-violet-600 dark:text-violet-400 mt-1">
                      {selectedTrade.rr || "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Profit & Loss</p>
                    <p
                      className={`text-4xl font-bold mt-1 ${
                        Number(selectedTrade.pnl || 0) >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {Number(selectedTrade.pnl || 0) >= 0 ? "+" : ""}$
                      {Math.abs(Number(selectedTrade.pnl || 0)).toFixed(2)}
                    </p>
                  </div>
                  {selectedTrade.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Journal Notes
                      </p>
                      <div className="p-4 rounded-lg bg-muted/50 dark:bg-muted/30 border border-border whitespace-pre-wrap text-sm">
                        {selectedTrade.notes}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="flex justify-end gap-4 p-6 border-t border-border">
                <Button variant="outline" onClick={() => openEdit(selectedTrade)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" onClick={() => setSelectedTrade(null)}>
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && editingTrade && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <Card className="w-full max-w-lg border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Edit Trade
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditModalOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveEdit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label>Pair</Label>
                      <Input
                        value={editForm.pair}
                        onChange={(e) => setEditForm({ ...editForm, pair: e.target.value })}
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>Direction</Label>
                      <select
                        value={editForm.direction}
                        onChange={(e) => setEditForm({ ...editForm, direction: e.target.value })}
                        className="w-full h-11 mt-1.5 rounded-md border border-input bg-background px-3 focus:ring-2 focus:ring-ring"
                      >
                        <option value="Long">Long</option>
                        <option value="Short">Short</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <Label>Entry</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={editForm.entry}
                        onChange={(e) => setEditForm({ ...editForm, entry: e.target.value })}
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>Exit</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={editForm.exit}
                        onChange={(e) => setEditForm({ ...editForm, exit: e.target.value })}
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>PnL</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.pnl}
                        onChange={(e) => setEditForm({ ...editForm, pnl: e.target.value })}
                        className="mt-1.5 h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <Label>Stop Loss</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={editForm.stopLoss}
                        onChange={(e) => setEditForm({ ...editForm, stopLoss: e.target.value })}
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>Take Profit</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={editForm.takeProfit}
                        onChange={(e) => setEditForm({ ...editForm, takeProfit: e.target.value })}
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>R:R</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editForm.rr}
                        onChange={(e) => setEditForm({ ...editForm, rr: e.target.value })}
                        className="mt-1.5 h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      className={`w-full mt-1.5 p-4 rounded-xl border min-h-[140px] text-sm resize-y focus:ring-2 focus:ring-indigo-500 outline-none ${
                        isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                      }`}
                      placeholder="What did you learn from this trade?"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-base shadow-md"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 py-6 text-base"
                      onClick={() => setEditModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
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
    </div>
  );
}
