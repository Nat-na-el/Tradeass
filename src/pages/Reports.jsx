import React, { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Percent,
  DollarSign,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function Reports() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("this-month"); // this-month, last-30, this-year, all, custom
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Fetch trades from backend
  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      try {
        const currentId = localStorage.getItem("currentAccountId") || "default";
        const res = await fetch(
          `https://tradeass-backend.onrender.com/api/trades?accountId=${currentId}`
        );
        if (!res.ok) throw new Error("Failed to load trades");
        const data = await res.json();
        setTrades(data || []);
      } catch (err) {
        console.error("Reports fetch error:", err);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  // Filtered trades based on selected period
  const filteredTrades = useMemo(() => {
    const now = new Date();

    let startDate, endDate;

    if (period === "this-month") {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (period === "last-30") {
      startDate = subMonths(now, 1);
      endDate = now;
    } else if (period === "this-year") {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
    } else if (period === "all") {
      startDate = new Date(2000, 0, 1); // far past
      endDate = now;
    } else if (period === "custom" && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      return trades;
    }

    return trades.filter((trade) => {
      const tradeDate = new Date(trade.date);
      return isWithinInterval(tradeDate, { start: startDate, end: endDate });
    });
  }, [trades, period, customStart, customEnd]);

  // Calculate report statistics
  const stats = useMemo(() => {
    if (!filteredTrades.length) {
      return {
        totalPnL: 0,
        winRate: 0,
        totalTrades: 0,
        avgRR: 0,
        avgPnL: 0,
        bestTrade: 0,
        worstTrade: 0,
        topPairs: [],
      };
    }

    const totalTrades = filteredTrades.length;
    const wins = filteredTrades.filter((t) => Number(t.pnl || 0) > 0).length;
    const totalPnL = filteredTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
    const totalRR = filteredTrades.reduce((sum, t) => sum + Number(t.rr || 0), 0);

    const pnlValues = filteredTrades.map((t) => Number(t.pnl || 0));
    const bestTrade = Math.max(...pnlValues);
    const worstTrade = Math.min(...pnlValues);

    // Top pairs by PnL
    const pairsMap = {};
    filteredTrades.forEach((t) => {
      if (!t.pair) return;
      if (!pairsMap[t.pair]) {
        pairsMap[t.pair] = { pnl: 0, count: 0 };
      }
      pairsMap[t.pair].pnl += Number(t.pnl || 0);
      pairsMap[t.pair].count += 1;
    });

    const topPairs = Object.entries(pairsMap)
      .map(([pair, data]) => ({
        pair,
        pnl: data.pnl,
        avgPnL: data.count ? (data.pnl / data.count).toFixed(2) : 0,
        trades: data.count,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5);

    return {
      totalPnL: totalPnL.toFixed(2),
      winRate: totalTrades ? Math.round((wins / totalTrades) * 100) : 0,
      totalTrades,
      avgRR: totalTrades ? (totalRR / totalTrades).toFixed(2) : 0,
      avgPnL: totalTrades ? (totalPnL / totalTrades).toFixed(2) : 0,
      bestTrade: bestTrade.toFixed(2),
      worstTrade: worstTrade.toFixed(2),
      topPairs,
    };
  }, [filteredTrades]);

  const exportReport = () => {
    if (!filteredTrades.length) return;

    const headers = [
      "Date",
      "Pair",
      "Direction",
      "Entry",
      "Exit",
      "PnL",
      "R:R",
      "Notes",
    ];

    const rows = filteredTrades.map((t) => [
      t.date ? format(new Date(t.date), "yyyy-MM-dd HH:mm") : "",
      t.pair || "",
      t.direction || "",
      t.entry || "",
      t.exit || "",
      t.pnl || 0,
      t.rr || "",
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trading-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Trading Reports
          </h1>
          <p className="mt-2 opacity-80">
            Analyze performance, identify patterns, improve your edge
          </p>
        </div>

        <Button
          onClick={exportReport}
          disabled={!filteredTrades.length || loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
        >
          <Download size={18} className="mr-2" /> Export Report
        </Button>
      </div>

      {/* Period Filter */}
      <Card className="p-5 mb-8 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500" />
            <span className="font-medium">Time Period:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={period === "this-month" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("this-month")}
              className={period === "this-month" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              This Month
            </Button>

            <Button
              variant={period === "last-30" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("last-30")}
              className={period === "last-30" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              Last 30 Days
            </Button>

            <Button
              variant={period === "this-year" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("this-year")}
              className={period === "this-year" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              This Year
            </Button>

            <Button
              variant={period === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("all")}
              className={period === "all" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              All Time
            </Button>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setPeriod("custom");
                }}
                className={`p-2 rounded-lg border text-sm ${
                  isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                }`}
              />
              <span>to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setPeriod("custom");
                }}
                className={`p-2 rounded-lg border text-sm ${
                  isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredTrades.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-dashed">
          <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No data for selected period</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try changing the time filter or add some trades first.
          </p>
        </Card>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
            <Card className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
              <div className="text-xs font-medium opacity-70 mb-1">Net P&L</div>
              <div
                className={`text-2xl lg:text-3xl font-bold ${
                  Number(stats.totalPnL) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {Number(stats.totalPnL) >= 0 ? "+" : "-"}${Math.abs(Number(stats.totalPnL)).toFixed(2)}
              </div>
            </Card>

            <Card className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
              <div className="text-xs font-medium opacity-70 mb-1">Win Rate</div>
              <div className="text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.winRate}%
              </div>
            </Card>

            <Card className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
              <div className="text-xs font-medium opacity-70 mb-1">Total Trades</div>
              <div className="text-2xl lg:text-3xl font-bold text-violet-600 dark:text-violet-400">
                {stats.totalTrades}
              </div>
            </Card>

            <Card className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
              <div className="text-xs font-medium opacity-70 mb-1">Avg R:R</div>
              <div className="text-2xl lg:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                {stats.avgRR}
              </div>
            </Card>

            <Card className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
              <div className="text-xs font-medium opacity-70 mb-1">Avg Trade</div>
              <div className="text-2xl lg:text-3xl font-bold text-teal-600 dark:text-teal-400">
                ${stats.avgPnL}
              </div>
            </Card>
          </div>

          {/* Top Pairs */}
          <Card className="p-6 mb-8 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <BarChart3 size={20} /> Top Performing Pairs
            </h3>

            {stats.topPairs.length === 0 ? (
              <p className="text-center opacity-70 py-8">No pair data available</p>
            ) : (
              <div className="space-y-4">
                {stats.topPairs.map((item, index) => (
                  <div key={item.pair} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.pair}</div>
                        <div className="text-sm opacity-70">{item.trades} trades</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${item.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {item.pnl >= 0 ? "+" : ""}${Math.abs(item.pnl).toFixed(2)}
                      </div>
                      <div className="text-sm opacity-70">Avg: ${item.avgPnL}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Visuals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* PnL Trend */}
            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <TrendingUp size={20} /> Monthly PnL Trend
              </h3>

              <div className="h-64 flex items-end gap-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${
                          height > 50 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-center mt-1 opacity-70">
                        {format(subMonths(new Date(), 11 - i), "MMM")}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-center mt-4 opacity-70">
                (Simplified preview – real data coming soon)
              </p>
            </Card>

            {/* Win/Loss Distribution */}
            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Percent size={20} /> Win / Loss Distribution
              </h3>

              <div className="flex justify-center items-center h-64 relative">
                <div className="w-48 h-48 rounded-full border-8 border-emerald-500 relative flex items-center justify-center">
                  <div
                    className="absolute w-full h-full rounded-full border-8 border-rose-500"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`,
                      transform: `rotate(${stats.winRate * 3.6}deg)`,
                    }}
                  ></div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                      {stats.winRate}%
                    </div>
                    <div className="text-sm opacity-70">Win Rate</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  Wins: {stats.winRate}%
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-rose-500"></div>
                  Losses: {100 - stats.winRate}%
                </div>
              </div>
            </Card>
          </div>

          {/* Best & Worst */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight size={20} /> Best Trade
              </h3>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                +${Math.abs(stats.bestTrade)}
              </div>
              <p className="opacity-70">Highest single trade profit in period</p>
            </Card>

            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ArrowDownRight size={20} /> Worst Trade
              </h3>
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-2">
                -${Math.abs(stats.worstTrade)}
              </div>
              <p className="opacity-70">Largest single trade loss in period</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
