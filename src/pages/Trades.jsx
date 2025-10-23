import React, { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../Theme-provider";
import { Trash2, Eye } from "lucide-react";

export default function Trades() {
  const { theme } = useTheme();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedDate = searchParams.get("date");
  const [selectedTrade, setSelectedTrade] = useState(null);

  // ✅ DATABASE FETCH + ACCOUNT FILTER
  const refreshTrades = async () => {
    setLoading(true);
    try {
      const currentId = localStorage.getItem("currentAccountId") || "default";
      console.log("🚀 TRADES FETCHING FROM DB - ACCOUNT:", currentId);
      const res = await fetch(
        `http://localhost:4001/api/trades?accountId=${currentId}`
      );
      const data = await res.json();
      console.log("✅ TRADES LOADED:", data);
      setTrades(data || []);
    } catch (err) {
      console.error("❌ TRADES ERROR:", err);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTrades();
  }, []);

  const filteredTrades = useMemo(() => {
    if (!selectedDate) return trades;
    return trades.filter((t) => t.date?.startsWith(selectedDate));
  }, [trades, selectedDate]);

  const tradesByDate = useMemo(() => {
    return filteredTrades.reduce((acc, trade) => {
      const dateKey = trade.date?.slice(0, 10) || "unknown";
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(trade);
      return acc;
    }, {});
  }, [filteredTrades]);

  const deleteTrade = async (id) => {
    const shouldDelete = window.confirm("Delete this trade?");
    if (!shouldDelete) return;

    try {
      const currentId = localStorage.getItem("currentAccountId") || "default";
      await fetch(
        `http://localhost:4001/api/trades/${id}?accountId=${currentId}`,
        {
          method: "DELETE",
        }
      );
      await refreshTrades();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const viewTrade = (trade) => {
    setSelectedTrade(trade);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div
          className={`text-gray-600 dark:text-gray-400 ${
            theme === "dark" ? "dark" : ""
          }`}
        >
          Loading trades...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-6 bg-white dark:bg-gray-900 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Trades
        </h2>
        <Button
          onClick={() => navigate("/trades/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add Trade
        </Button>
      </div>

      {/* DAY FILTER */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Filter by Date:
        </label>
        <select
          value={selectedDate || ""}
          onChange={(e) =>
            setSearchParams(e.target.value ? { date: e.target.value } : {})
          }
          className="w-full max-w-md p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
        >
          <option value="">All Days</option>
          {[...new Set(trades.map((t) => t.date?.slice(0, 10)))]
            .sort((a, b) => new Date(b) - new Date(a))
            .map((date) => (
              <option key={date} value={date}>
                {format(parseISO(date), "MMM dd, yyyy")}
              </option>
            ))}
        </select>
      </div>

      {/* TRADES BY DAY */}
      {Object.entries(tradesByDate).length === 0 ? (
        <Card className="p-6 text-center text-gray-500 dark:text-gray-400">
          No trades found
        </Card>
      ) : (
        Object.entries(tradesByDate).map(([date, dayTrades]) => (
          <div key={date} className="mb-6">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-gray-800 dark:text-gray-100">
              {format(parseISO(date), "EEEE, MMMM dd, yyyy")} (
              {dayTrades.length} trades)
            </h3>
            <div className="space-y-3">
              {dayTrades.map((trade) => (
                <Card key={trade.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {trade.pair || trade.strategy || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Time:{" "}
                        {trade.date
                          ? format(parseISO(trade.date), "HH:mm")
                          : "N/A"}{" "}
                        | Direction: {trade.direction || "N/A"} | RR:{" "}
                        {trade.rr || 0}
                      </div>
                      <div
                        className={`text-sm font-medium ${
                          trade.pnl >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        PnL: ${trade.pnl?.toFixed(2) || 0}
                      </div>
                      {trade.notes && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          📝 {trade.notes.substring(0, 50)}
                          {trade.notes.length > 50 ? "..." : ""}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewTrade(trade)}
                      >
                        <Eye size={16} className="mr-1" /> View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTrade(trade.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* TRADE DETAILS MODAL */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Trade Details
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTrade(null)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Pair:</strong> {selectedTrade.pair}
                </div>
                <div>
                  <strong>Direction:</strong> {selectedTrade.direction}
                </div>
                <div>
                  <strong>Entry:</strong> ${selectedTrade.entry}
                </div>
                <div>
                  <strong>Exit:</strong> ${selectedTrade.exit}
                </div>
                <div>
                  <strong>Stop Loss:</strong> ${selectedTrade.stopLoss || "N/A"}
                </div>
                <div>
                  <strong>Take Profit:</strong> $
                  {selectedTrade.takeProfit || "N/A"}
                </div>
                <div>
                  <strong>Risk/Reward:</strong> {selectedTrade.rr || 0}
                </div>
                <div>
                  <strong>PnL:</strong> ${selectedTrade.pnl?.toFixed(2)}
                </div>
              </div>
              {selectedTrade.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded whitespace-pre-wrap">
                    {selectedTrade.notes}
                  </p>
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Date: {format(parseISO(selectedTrade.date), "PPPp")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
