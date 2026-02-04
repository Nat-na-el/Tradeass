import React, { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../Theme-provider";
import {
  Trash2,
  Eye,
  Search,
  Download,
  SortAsc,
  SortDesc,
  X,
  Calendar,
  FileText,
} from "lucide-react";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";

export default function Trades() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedDate = searchParams.get("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc"); // date-desc, date-asc, pnl-desc, pnl-asc, pair
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState(null);

  // Fetch trades
  const refreshTrades = async () => {
    setLoading(true);
    try {
      const currentId = localStorage.getItem("currentAccountId") || "default";
      const res = await fetch(
        `https://tradeass-backend.onrender.com/api/trades?accountId=${currentId}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTrades(data || []);
    } catch (err) {
      console.error("Trades fetch error:", err);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTrades();
  }, []);

  // Filtered & Sorted trades
  const filteredTrades = useMemo(() => {
    let result = trades;

    // Date filter
    if (selectedDate) {
      result = result.filter((t) => t.date?.startsWith(selectedDate));
    }

    // Search filter (pair or notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.pair?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.strategy?.toLowerCase().includes(q)
      );
    }

    // Sorting
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

  // Quick stats
  const stats = useMemo(() => {
    if (!filteredTrades.length) {
      return { totalPnL: 0, winRate: 0, totalTrades: 0, avgRR: 0 };
    }

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

  const deleteTrade = async (id) => {
    try {
      const currentId = localStorage.getItem("currentAccountId") || "default";
      await fetch(
        `https://tradeass-backend.onrender.com/api/trades/${id}?accountId=${currentId}`,
        { method: "DELETE" }
      );
      await refreshTrades();
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleteModalOpen(false);
    setTradeToDelete(null);
  };

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
    link.download = `trades-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-lg opacity-70">Loading trades...</p>
        </div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Trade History
          </h1>
          <p className="text-sm sm:text-base mt-1 opacity-80">
            View, filter, and analyze all your executed trades
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/trades/new")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          >
            <Plus size={18} className="mr-2" /> Add Trade
          </Button>

          <Button
            onClick={exportCSV}
            disabled={!filteredTrades.length}
            className="bg-gray-700 hover:bg-gray-800 text-white shadow-md disabled:opacity-50"
          >
            <Download size={18} className="mr-2" /> Export CSV
          </Button>
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Date Picker */}
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium mb-2 opacity-80 flex items-center gap-2">
            <Calendar size={16} /> Filter by Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate || ""}
              onChange={(e) =>
                setSearchParams(e.target.value ? { date: e.target.value } : {})
              }
              className={`w-full p-3 pl-10 rounded-xl border ${
                isDark
                  ? "bg-gray-800/60 border-gray-700 text-gray-100"
                  : "bg-white/80 border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-indigo-500 outline-none`}
            />
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 opacity-80 flex items-center gap-2">
            <Search size={16} /> Search Pair / Notes
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="EURUSD, psychology, revenge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full p-3 pl-10 rounded-xl border ${
                isDark
                  ? "bg-gray-800/60 border-gray-700 text-gray-100"
                  : "bg-white/80 border-gray-300 text-gray-900"
              } focus:ring-2 focus:ring-indigo-500 outline-none`}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Sort */}
        <div className="w-full lg:w-48">
          <label className="block text-sm font-medium mb-2 opacity-80 flex items-center gap-2">
            <SortAsc size={16} /> Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`w-full p-3 rounded-xl border ${
              isDark
                ? "bg-gray-800/60 border-gray-700 text-gray-100"
                : "bg-white/80 border-gray-300 text-gray-900"
            } focus:ring-2 focus:ring-indigo-500 outline-none`}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="pnl-desc">Highest PnL</option>
            <option value="pnl-asc">Lowest PnL</option>
            <option value="pair">Pair (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Trade List */}
      {filteredTrades.length === 0 ? (
        <Card className="p-10 text-center bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <p className="text-xl font-medium opacity-70 mb-2">No trades found</p>
          <p className="opacity-60">
            {searchQuery || selectedDate
              ? "Try adjusting your filters"
              : "Add your first trade to get started"}
          </p>
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

                  <div className="text-sm opacity-80 mt-1">
                    {trade.notes && (
                      <span className="line-clamp-2">
                        <FileText size={14} className="inline mr-1" />
                        {trade.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-10">
                  <div className="text-right min-w-[100px]">
                    <div
                      className={`text-xl font-bold ${
                        Number(trade.pnl || 0) >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {Number(trade.pnl || 0) >= 0 ? "+" : ""}$
                      {Math.abs(Number(trade.pnl || 0)).toFixed(2)}
                    </div>
                    {trade.rr && (
                      <div className="text-xs opacity-70">R:R {trade.rr}</div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedTrade(trade)}
                      className="h-10 w-10 rounded-lg"
                    >
                      <Eye size={18} />
                    </Button>

                    <Button
                      variant="destructive"
                      size="icon"
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

      {/* Trade Details Modal */}
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTrade(null)}
                >
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
              <Button
                variant="outline"
                onClick={() => setSelectedTrade(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteModalOpen && (
        <DeleteConfirmModal
          title="Delete Trade"
          message="Are you sure you want to delete this trade? This action cannot be undone."
          onConfirm={() => deleteTrade(tradeToDelete)}
          onCancel={() => {
            setDeleteModalOpen(false);
            setTradeToDelete(null);
          }}
        />
      )}
    </div>
  );
}
