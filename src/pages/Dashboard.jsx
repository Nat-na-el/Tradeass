import React, { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
} from "date-fns";
import { Card } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../Theme-provider"; // ← Try this path first
// If the above still fails, try one of these:
// import { useTheme } from "../Theme-provider";
// import { useTheme } from "../../contexts/Theme-provider";
// import { useTheme } from "../contexts/Theme-provider";

import {
  TrendingUp,
  TrendingDown,
  Activity,
  Percent,
  Zap,
  BarChart3,
} from "lucide-react";

// Safe animated number component (no custom hook issues)
const AnimatedNumber = ({ value, duration = 1500, decimals = 2 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(value * progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{Number(display).toFixed(decimals)}</>;
};

export default function Dashboard({ currentAccount }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());

  // Fetch trades
  const refreshTrades = async () => {
    setLoading(true);
    try {
      const currentId = localStorage.getItem("currentAccountId") || "default";
      console.log("🚀 DASHBOARD FETCHING FROM DB - ACCOUNT:", currentId);
      const res = await fetch(
        `https://tradeass-backend.onrender.com/api/trades?accountId=${currentId}`
      );
      const data = await res.json();
      console.log("✅ DASHBOARD TRADES:", data);
      setTrades(data || []);
    } catch (err) {
      console.error("❌ DASHBOARD ERROR:", err);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTrades();
    const interval = setInterval(refreshTrades, 30000);
    return () => clearInterval(interval);
  }, []);

  // Month navigation
  const prevMonth = () => setViewDate((d) => subMonths(d, 1));
  const nextMonth = () => setViewDate((d) => addMonths(d, 1));
  const jumpTo = (y, m) => setViewDate(new Date(y, m - 1, 1));

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);

  const monthlyTrades = useMemo(() => {
    return trades
      .filter((t) => {
        const td = new Date(t.date);
        return td >= monthStart && td <= monthEnd;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [trades, viewDate]);

  const weeklyTrades = useMemo(() => {
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
    const we = endOfWeek(new Date(), { weekStartsOn: 1 });
    return trades
      .filter((t) => {
        const td = new Date(t.date);
        return td >= ws && td <= we;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [trades]);

  const monthlyStats = useMemo(() => {
    if (!monthlyTrades.length) {
      return {
        totalPnL: 0,
        winRate: 0,
        profitFactor: "—",
        expectancy: 0,
        winCount: 0,
        lossCount: 0,
        totalTrades: 0,
        avgPnL: 0,
        bestDayPnL: 0,
        worstDayPnL: 0,
        avgRR: 0,
      };
    }

    const profits = monthlyTrades.filter((t) => t.pnl > 0).reduce((a, b) => a + Number(b.pnl), 0);
    const losses = monthlyTrades.filter((t) => t.pnl < 0).reduce((a, b) => a + Math.abs(Number(b.pnl)), 0);
    const profitFactor = losses ? (profits / losses).toFixed(2) : "∞";

    const wins = monthlyTrades.filter((t) => t.pnl > 0).length;
    const total = monthlyTrades.length;
    const winRate = ((wins / total) * 100).toFixed(1);
    const expectancy = (monthlyTrades.reduce((a, b) => a + Number(b.pnl), 0) / total).toFixed(2);

    const dailyPnL = {};
    monthlyTrades.forEach((t) => {
      const day = format(new Date(t.date), "yyyy-MM-dd");
      dailyPnL[day] = (dailyPnL[day] || 0) + Number(t.pnl || 0);
    });

    const dailyValues = Object.values(dailyPnL);
    const bestDayPnL = dailyValues.length ? Math.max(...dailyValues).toFixed(2) : 0;
    const worstDayPnL = dailyValues.length ? Math.min(...dailyValues).toFixed(2) : 0;

    const totalRR = monthlyTrades.reduce((sum, t) => sum + (Number(t.rr) || 0), 0);
    const avgRR = total ? (totalRR / total).toFixed(2) : 0;

    return {
      totalPnL: (profits - losses).toFixed(2),
      winRate,
      profitFactor,
      expectancy,
      winCount: wins,
      lossCount: total - wins,
      totalTrades: total,
      avgPnL: (monthlyTrades.reduce((a, b) => a + Number(b.pnl), 0) / total).toFixed(2),
      bestDayPnL,
      worstDayPnL,
      avgRR,
    };
  }, [monthlyTrades]);

  const currentStreak = useMemo(() => {
    let streak = { type: "None", count: 0 };
    let current = null;
    for (const trade of [...weeklyTrades].reverse()) {
      const pnl = Number(trade.pnl) || 0;
      if (pnl === 0) continue;
      if (current === null) {
        current = pnl > 0 ? "Win" : "Loss";
        streak = { type: current, count: 1 };
      } else if ((pnl > 0 && current === "Win") || (pnl < 0 && current === "Loss")) {
        streak.count += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [weeklyTrades]);

  const tradesByDate = useMemo(() => {
    return monthlyTrades.reduce((acc, t) => {
      const d = t.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
      if (!acc[d]) acc[d] = [];
      acc[d].push(t);
      return acc;
    }, {});
  }, [monthlyTrades]);

  function daySummary(dateObj) {
    const key = format(dateObj, "yyyy-MM-dd");
    const list = tradesByDate[key] || [];
    if (!list.length) return null;
    const pnl = list.reduce((s, t) => s + Number(t.pnl || 0), 0);
    const count = list.length;
    const wins = list.filter((t) => t.pnl > 0).length;
    const winRate = Math.round((wins / count) * 100) || 0;
    const rrAvg = list.reduce((s, t) => s + (Number(t.rr) || 0), 0) / count || 0;
    return { date: key, pnl, count, winRate, rrAvg };
  }

  function weekSummary(weekArray) {
    const sums = weekArray.reduce(
      (acc, d) => {
        const ds = daySummary(d);
        if (!ds) return acc;
        acc.count += ds.count;
        acc.pnl += ds.pnl;
        acc.wins += Math.round((ds.winRate / 100) * ds.count);
        return acc;
      },
      { pnl: 0, count: 0, wins: 0 }
    );
    const winRate = sums.count ? Math.round((sums.wins / sums.count) * 100) : 0;
    return { pnl: +sums.pnl.toFixed(2), count: sums.count, winRate };
  }

  const calendarWeeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
  }, [viewDate]);

  const openDay = (dayObj) => {
    const formattedDate = format(dayObj, "yyyy-MM-dd");
    navigate("/trades?date=" + formattedDate);
  };

  const addQuantitativeAnalysis = () => {
    const label = prompt("Enter new stat label:") || `Custom Stat ${5}`;
    const value = prompt("Enter value (e.g., 100 or stats.totalPnL):") || "0";
    navigate("/quantitative-analysis", {
      state: { monthlyTrades, monthlyStats, newLabel: label, newValue: value },
    });
  };

  const recentTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [trades]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-amber-900 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 
        bg-gradient-to-br from-amber-50/90 via-white/80 to-amber-50/70 
        dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
        text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-y-auto`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-700 to-amber-500 dark:from-amber-300 dark:to-amber-200 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-amber-700/80 dark:text-gray-400 mt-1">
            {format(viewDate, "MMMM yyyy")} • {currentAccount?.name || "Account"}
          </p>
        </div>

        <button
          onClick={addQuantitativeAnalysis}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium transform hover:scale-[1.03]"
        >
          <Zap size={18} />
          Quick Analysis
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs sm:text-sm font-medium text-amber-700/80 dark:text-gray-400">
                Monthly P&L
              </div>
              <TrendingUp className="h-5 w-5 text-amber-500/40 dark:text-gray-500/40" />
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold ${monthlyStats.totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {monthlyStats.totalPnL >= 0 ? "+" : "-"}${Math.abs(monthlyStats.totalPnL).toFixed(2)}
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs sm:text-sm font-medium text-amber-700/80 dark:text-gray-400">
                Win Rate
              </div>
              <Percent className="h-5 w-5 text-amber-500/40 dark:text-gray-500/40" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              <AnimatedNumber value={Number(monthlyStats.winRate)} decimals={1} />%
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs sm:text-sm font-medium text-amber-700/80 dark:text-gray-400">
                Profit Factor
              </div>
              <Activity className="h-5 w-5 text-amber-500/40 dark:text-gray-500/40" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
              {monthlyStats.profitFactor}
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs sm:text-sm font-medium text-amber-700/80 dark:text-gray-400">
                Streak
              </div>
              <Zap className="h-5 w-5 text-amber-500/40 dark:text-gray-500/40" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-600 dark:text-gray-300">
              {currentStreak.count > 0 ? `${currentStreak.type} ${currentStreak.count}` : "None"}
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs sm:text-sm font-medium text-amber-700/80 dark:text-gray-400">
                Avg R:R
              </div>
              <BarChart3 className="h-5 w-5 text-amber-500/40 dark:text-gray-500/40" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400">
              {monthlyStats.avgRR}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Trades + Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg p-5 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Recent Trades
            </h3>
            <button
              onClick={() => navigate("/trades")}
              className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              View All →
            </button>
          </div>

          {recentTrades.length === 0 ? (
            <div className="text-center py-12 text-amber-700/70 dark:text-gray-400 bg-amber-50/30 dark:bg-gray-800/30 rounded-xl">
              No recent trades yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/trades?date=${format(new Date(trade.date), "yyyy-MM-dd")}`)}
                  className="flex items-center justify-between p-4 bg-amber-50/50 dark:bg-gray-800/50 rounded-xl border border-amber-100 dark:border-gray-700 hover:bg-amber-100/50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shadow-sm ${
                        trade.pnl >= 0
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      }`}
                    >
                      {trade.pair?.slice(0, 2) || "T"}
                    </div>
                    <div>
                      <div className="font-semibold text-amber-950 dark:text-gray-200">
                        {trade.pair} {trade.direction}
                      </div>
                      <div className="text-xs text-amber-700/80 dark:text-gray-400">
                        {format(new Date(trade.date), "dd MMM yyyy • HH:mm")}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-lg ${
                      trade.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}${Math.abs(Number(trade.pnl || 0)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg p-5 lg:p-6">
          <h3 className="text-lg font-semibold mb-5 text-amber-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Monthly Highlights
          </h3>

          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-800 dark:text-gray-300">Best Day</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +${Math.abs(monthlyStats.bestDayPnL).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-800 dark:text-gray-300">Worst Day</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                -${Math.abs(monthlyStats.worstDayPnL).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-800 dark:text-gray-300">Avg R:R</span>
              <span className="font-bold text-violet-600 dark:text-violet-400">
                {monthlyStats.avgRR || "—"}
              </span>
            </div>
            <div className="pt-4 border-t border-amber-200/50 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-amber-800 dark:text-gray-300">Win Rate</span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  <AnimatedNumber value={Number(monthlyStats.winRate)} decimals={1} />%
                </span>
              </div>
              <div className="w-full bg-amber-200/30 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000 ease-out"
                  style={{ width: `${monthlyStats.winRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="p-3 rounded-xl bg-amber-100 dark:bg-gray-800 text-amber-800 dark:text-gray-200 hover:bg-amber-200 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
            >
              ◀
            </button>
            <button
              onClick={() => {
                const res = prompt("Enter month (YYYY-MM)");
                if (res && /^\d{4}-\d{2}$/.test(res)) {
                  const [y, m] = res.split("-").map(Number);
                  jumpTo(y, m);
                }
              }}
              className="px-5 py-3 rounded-xl bg-amber-100 dark:bg-gray-800 border border-amber-200 dark:border-gray-700 text-amber-900 dark:text-gray-200 hover:bg-amber-200 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
            >
              {format(viewDate, "MMMM yyyy")}
            </button>
            <button
              onClick={nextMonth}
              className="p-3 rounded-xl bg-amber-100 dark:bg-gray-800 text-amber-800 dark:text-gray-200 hover:bg-amber-200 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
            >
              ▶
            </button>
          </div>
          <span className="text-sm text-amber-700 dark:text-gray-400 font-medium">
            Tap a day to view trades
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 min-w-[640px] gap-1.5 sm:gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Wk"].map((d) => (
              <div
                key={d}
                className="text-xs font-medium text-center text-amber-700/80 dark:text-gray-400 py-3"
              >
                {d}
              </div>
            ))}

            {calendarWeeks.map((week, wi) => {
              const wSum = weekSummary(week);
              return (
                <React.Fragment key={wi}>
                  {week.map((dayObj, di) => {
                    const ds = daySummary(dayObj);
                    const isCur = isSameMonth(dayObj, viewDate);
                    const pnl = ds?.pnl || 0;
                    const intensity = Math.min(Math.abs(pnl) / 1500, 0.6);

                    return (
                      <div
                        key={di}
                        onClick={() => openDay(dayObj)}
                        className={`
                          cursor-pointer aspect-square rounded-xl p-1.5 sm:p-2 flex flex-col justify-between border transition-all duration-300
                          ${isCur 
                            ? "bg-white/80 dark:bg-gray-800/80 border-amber-200/60 dark:border-gray-700" 
                            : "bg-transparent border-dashed border-amber-200/40 dark:border-gray-700/40"}
                          hover:shadow-xl hover:scale-[1.03] hover:border-amber-400 dark:hover:border-indigo-500
                        `}
                        style={{
                          backgroundColor: pnl > 0 
                            ? `rgba(16, 185, 129, ${intensity})` 
                            : pnl < 0 
                            ? `rgba(239, 68, 68, ${intensity})` 
                            : undefined,
                        }}
                      >
                        <div className="text-xs text-center text-amber-800/80 dark:text-gray-400">
                          {format(dayObj, "d")}
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                          {ds ? (
                            <>
                              <div
                                className={`font-bold text-xs sm:text-sm ${
                                  pnl >= 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                              </div>
                              <div className="text-[10px] text-amber-700/70 dark:text-gray-400">
                                {ds.count}t • {ds.winRate}%
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-amber-700/50 dark:text-gray-500">—</div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="aspect-square rounded-xl p-1.5 sm:p-2 flex flex-col justify-center items-center border bg-amber-100/50 dark:bg-gray-800/60 border-amber-200/60 dark:border-gray-700">
                    <div className="text-xs text-amber-700/80 dark:text-gray-400 mb-1">
                      W{wi + 1}
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        wSum.pnl >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {wSum.pnl >= 0 ? "+" : ""}${Math.abs(wSum.pnl).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-amber-700/70 dark:text-gray-400">
                      {wSum.count}t • {wSum.winRate}%
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Floating Quick Add Button */}
      <button
        onClick={() => navigate("/trades/new")}
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-400/40"
        aria-label="Add New Trade"
      >
        <span className="text-3xl font-bold leading-none">+</span>
      </button>
    </div>
  );
}
