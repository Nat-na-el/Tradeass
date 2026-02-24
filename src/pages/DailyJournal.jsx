import React, { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  Plus,
  Loader2,
  Check,
  AlertCircle,
  FileText,
  X,
  Edit,
} from "lucide-react";
import { useTheme } from "../Theme-provider";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  if (num == null || isNaN(num)) return "—";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const COMMON_ASSETS = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "NZDUSD", "USDCHF",
  "EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "CADJPY", "CHFJPY",
  "UK100", "US30", "NAS100", "SPX500", "DE40", "JP225", "FRA40", "AUS200",
  "HSI", "CHINA50", "AAPL", "TSLA", "AMZN", "GOOGL", "MSFT", "NVDA", "META"
];

export default function DailyJournal({ currentAccount }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [messageTimeout, setMessageTimeout] = useState(null);

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

  // Show temporary success/error messages
  const showMessage = (msg, type = "success") => {
    if (messageTimeout) clearTimeout(messageTimeout);
    setSuccessMsg(type === "success" ? msg : null);
    setError(type === "error" ? msg : null);
    const timeout = setTimeout(() => {
      setSuccessMsg(null);
      setError(null);
    }, 5000);
    setMessageTimeout(timeout);
  };

  // Fetch entries only when we have a valid account
  const refreshEntries = async () => {
    const user = auth.currentUser;
    if (!user) {
      setEntries([]);
      setLoading(false);
      showMessage("Please sign in to access your journal", "error");
      return;
    }

    if (!currentAccount?.id) {
      setEntries([]);
      setLoading(false);
      return; // Don't show error — let UI handle no-account state
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
        "journals"
      );
      const q = query(entriesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(loaded);
    } catch (err) {
      console.error("Journal fetch error:", err);
      showMessage("Failed to load journal entries", "error");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Auto-calculate PnL & R:R
  useEffect(() => {
    const entryVal = Number(form.entry) || 0;
    const exitVal = Number(form.exit) || 0;
    const slVal = Number(form.stopLoss) || 0;
    const tpVal = Number(form.takeProfit) || 0;
    const lotVal = Number(form.lotSize) || 0.1;
    const levVal = Number(form.leverage) || 100;

    let pnl = "";
    if (entryVal && exitVal && lotVal && levVal) {
      const diff = form.direction === "Long" ? exitVal - entryVal : entryVal - exitVal;
      pnl = (diff * lotVal * levVal * 100).toFixed(2);
    }

    let rr = "";
    if (entryVal && slVal && tpVal) {
      const risk = form.direction === "Long" ? entryVal - slVal : slVal - entryVal;
      const reward = form.direction === "Long" ? tpVal - entryVal : entryVal - tpVal;
      rr = risk !== 0 ? (reward / risk).toFixed(2) : reward > 0 ? "∞" : "";
    }

    setForm((prev) => ({ ...prev, pnl, rr }));
  }, [form.entry, form.exit, form.stopLoss, form.takeProfit, form.lotSize, form.leverage, form.direction]);

  const todayEntries = useMemo(() => {
    const today = formatDateInput();
    return entries.filter((e) => e.date === today);
  }, [entries]);

  const metrics = useMemo(() => {
    if (!todayEntries.length) return { net: 0, wins: 0, losses: 0, winRate: 0, avgPnL: 0 };
    let net = 0, wins = 0;
    todayEntries.forEach((e) => {
      const p = Number(e.pnl || 0);
      net += p;
      if (p > 0) wins++;
    });
    const total = todayEntries.length;
    return {
      net: net.toFixed(2),
      wins,
      losses: total - wins,
      winRate: total ? Math.round((wins / total) * 100) : 0,
      avgPnL: (net / total).toFixed(2),
    };
  }, [todayEntries]);

  const saveEntry = async (e) => {
    e?.preventDefault();
    const user = auth.currentUser;
    if (!user) return showMessage("Please sign in", "error");
    if (!currentAccount?.id) return showMessage("No active trading account", "error");

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
        const ref = doc(db, "users", user.uid, "accounts", currentAccount.id, "journals", editingEntry.id);
        await updateDoc(ref, payload);
        showMessage("Entry updated successfully");
      } else {
        await addDoc(collection(db, "users", user.uid, "accounts", currentAccount.id, "journals"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        showMessage("Entry added successfully");
      }
      setModalOpen(false);
      setEditingEntry(null);
      refreshEntries();
    } catch (err) {
      console.error("Save failed:", err);
      showMessage("Failed to save entry", "error");
    }
  };

  const deleteEntry = async (id) => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "accounts", currentAccount.id, "journals", id));
      showMessage("Entry deleted");
      refreshEntries();
    } catch (err) {
      showMessage("Delete failed", "error");
    }
    setDeleteModalOpen(false);
    setEntryToDelete(null);
  };

  const clearTodayEntries = async () => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) return;

    try {
      const promises = todayEntries.map((e) =>
        deleteDoc(doc(db, "users", user.uid, "accounts", currentAccount.id, "journals", e.id))
      );
      await Promise.all(promises);
      showMessage("Today's entries cleared");
      refreshEntries();
    } catch (err) {
      showMessage("Failed to clear entries", "error");
    }
    setDeleteModalOpen(false);
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
            No Active Trading Account
          </h2>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Please select or create a trading account to start logging your sessions.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg px-10 py-6 text-lg"
              onClick={() => navigate("/edit-balance-pnl")}
            >
              Create Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 px-10 py-6 text-lg"
              onClick={() => navigate("/journal/new")}
            >
              Start Entry Anyway
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Daily Journal
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-base px-4 py-1">
                {currentAccount.name || "Account"}
              </Badge>
              <p className="text-lg text-muted-foreground">
                Log your trades & sessions
              </p>
            </div>
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
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg px-8 py-6 text-lg"
          >
            <Plus className="mr-2 h-5 w-5" /> New Entry
          </Button>
        </div>

        {/* Messages */}
        {(successMsg || error) && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 shadow animate-in fade-in duration-300 ${
              successMsg
                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                : "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
            }`}
          >
            {successMsg ? (
              <Check className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium">{successMsg || error}</span>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Net P&L Today</p>
              <p className={`text-3xl font-bold mt-2 ${metrics.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {metrics.net >= 0 ? "+" : ""}${formatNumber(Math.abs(metrics.net))}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{metrics.winRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Wins / Losses</p>
              <p className="text-3xl font-bold text-violet-600 mt-2">
                {metrics.wins} <span className="text-muted-foreground">/</span> {metrics.losses}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background to-muted/50 border shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Avg P&L</p>
              <p className={`text-3xl font-bold mt-2 ${metrics.avgPnL >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {metrics.avgPnL >= 0 ? "+" : ""}${formatNumber(Math.abs(metrics.avgPnL))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your journal...</p>
          </div>
        ) : todayEntries.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-2 border-muted-foreground/30 bg-muted/20 rounded-2xl">
            <div className="mx-auto max-w-md">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-6 opacity-70" />
              <h3 className="text-2xl font-semibold mb-4">No Entries Today</h3>
              <p className="text-muted-foreground mb-8">
                Start documenting your trading session for {currentAccount.name}.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg px-10 py-6 text-lg"
                onClick={() => {
                  setModalOpen(true);
                  setEditingEntry(null);
                }}
              >
                <Plus className="mr-2 h-5 w-5" /> Log First Entry
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-5">
            {todayEntries.map((entry) => (
              <Card
                key={entry.id}
                className="overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all shadow-sm hover:shadow group"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex items-start gap-5">
                        <div
                          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow ${
                            Number(entry.pnl || 0) >= 0
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                          }`}
                        >
                          {entry.pair?.slice(0, 2) || "?"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-semibold truncate">
                              {entry.pair || "—"} • {entry.direction}
                            </h3>
                            {entry.rr && (
                              <Badge variant="secondary" className="text-sm">
                                R:R {entry.rr}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <div>Lot: {entry.lotSize || "—"}</div>
                            <div>Leverage: {entry.leverage || "—"}:1</div>
                            <div>Entry: {entry.entry || "—"}</div>
                            <div>Exit: {entry.exit || "—"}</div>
                          </div>

                          {entry.notes && (
                            <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                              <FileText className="inline h-4 w-4 mr-1.5 opacity-70" />
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end p-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 bg-muted/30 dark:bg-muted/20">
                      <div className="text-right mr-8">
                        <div
                          className={`text-3xl font-bold ${
                            Number(entry.pnl || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {Number(entry.pnl || 0) >= 0 ? "+" : ""}${formatNumber(Math.abs(Number(entry.pnl || 0)))}
                        </div>
                        {entry.rr && <div className="text-sm text-muted-foreground mt-1">R:R {entry.rr}</div>}
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => openEdit(entry)}>
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 border-destructive/50 hover:bg-destructive/10 text-destructive"
                          onClick={() => {
                            setEntryToDelete(entry.id);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  {editingEntry ? "Edit Entry" : "New Journal Entry"}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </CardHeader>

              <CardContent>
                <form onSubmit={saveEntry} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>Pair / Asset</Label>
                      <Input
                        list="assets"
                        value={form.pair}
                        onChange={(e) => setForm({ ...form, pair: e.target.value.toUpperCase() })}
                        placeholder="EURUSD, AAPL..."
                        className="mt-1.5 h-11"
                      />
                      <datalist id="assets">
                        {COMMON_ASSETS.map((a) => <option key={a} value={a} />)}
                      </datalist>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>Direction</Label>
                      <select
                        value={form.direction}
                        onChange={(e) => setForm({ ...form, direction: e.target.value })}
                        className="w-full h-11 mt-1.5 rounded-md border border-input bg-background px-3 focus:ring-2 focus:ring-ring"
                      >
                        <option value="Long">Long</option>
                        <option value="Short">Short</option>
                      </select>
                    </div>
                    <div>
                      <Label>Leverage</Label>
                      <Input
                        type="number"
                        min="1"
                        value={form.leverage}
                        onChange={(e) => setForm({ ...form, leverage: e.target.value })}
                        placeholder="100"
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>Lot Size</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={form.lotSize}
                        onChange={(e) => setForm({ ...form, lotSize: e.target.value })}
                        placeholder="0.1"
                        className="mt-1.5 h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>Entry Price</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={form.entry}
                        onChange={(e) => setForm({ ...form, entry: e.target.value })}
                        placeholder="1.08500"
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>Exit Price</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={form.exit}
                        onChange={(e) => setForm({ ...form, exit: e.target.value })}
                        placeholder="1.09000"
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>P&L (auto)</Label>
                      <div
                        className={`h-11 mt-1.5 flex items-center px-4 rounded-md border font-bold ${
                          Number(form.pnl) > 0
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : Number(form.pnl) < 0
                            ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            : "bg-gray-100 dark:bg-gray-800 text-muted-foreground border-gray-300 dark:border-gray-700"
                        }`}
                      >
                        {Number(form.pnl) >= 0 ? "+" : ""}${formatNumber(Math.abs(Number(form.pnl)))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label>Stop Loss</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={form.stopLoss}
                        onChange={(e) => setForm({ ...form, stopLoss: e.target.value })}
                        placeholder="1.08200"
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>Take Profit</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={form.takeProfit}
                        onChange={(e) => setForm({ ...form, takeProfit: e.target.value })}
                        placeholder="1.09500"
                        className="mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label>R:R (auto)</Label>
                      <div className="h-11 mt-1.5 flex items-center px-4 rounded-md border bg-gray-100 dark:bg-gray-800 text-muted-foreground border-gray-300 dark:border-gray-700 font-bold">
                        {form.rr || "—"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Notes / Thoughts</Label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Market context, emotions, lessons learned..."
                      className={`w-full mt-1.5 p-4 rounded-xl border min-h-[160px] text-sm resize-y focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                        isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-base shadow-md"
                    >
                      {editingEntry ? "Update Entry" : "Save Entry"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 py-6 text-base"
                      onClick={() => setModalOpen(false)}
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
              setEntryToDelete(null);
            }}
            onConfirm={entryToDelete ? () => deleteEntry(entryToDelete) : clearTodayEntries}
            title={entryToDelete ? "Delete Entry" : "Clear Today's Entries"}
            message={
              entryToDelete
                ? "Are you sure you want to delete this entry? This cannot be undone."
                : `Are you sure you want to clear all ${todayEntries.length} entries from today?`
            }
          />
        )}
      </div>
    </div>
  );
}
