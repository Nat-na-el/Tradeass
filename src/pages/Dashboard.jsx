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
import { useTheme } from "../Theme-provider";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Percent,
  Zap,
  BarChart3,
  Plus,
} from "lucide-react";

// Animated counter hook
const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(end * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

export default function Dashboard({ currentAccount }) {
  const { theme } = useTheme();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const navigate = useNavigate();

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

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyTrades = useMemo(() => {
    return trades
      .filter((t) => {
        const td = new Date(t.date);
        return td >= weekStart && td <= weekEnd;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [trades]);

  const monthlyStats = useMemo(() => {
    if (!monthlyTrades.length) {
      return {
        totalPnL: 0,
        winRate: 0,
        profitFactor: 0,
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
    const winRate = total ? ((wins / total) * 100).toFixed(1) : 0;
    const expectancy = monthlyTrades.reduce((a, b) => a + Number(b.pnl), 0) / total || 0;

    const dailyPnL = {};
    monthlyTrades.forEach((t) => {
      const day = format(new Date(t.date), "yyyy-MM-dd");
      dailyPnL[day] = (dailyPnL[day] || 0) + Number(t.pnl || 0);
    });

    const dailyValues = Object.values(dailyPnL);
    const bestDayPnL = dailyValues.length ? Math.max(...dailyValues) : 0;
    const worstDayPnL = dailyValues.length ? Math.min(...dailyValues) : 0;

    const totalRR = monthlyTrades.reduce((sum, t) => sum + (Number(t.rr) || 0), 0);
    const avgRR = total ? (totalRR / total).toFixed(2) : 0;

    return {
      totalPnL: profits - losses,
      winRate,
      profitFactor,
      expectancy: expectancy.toFixed(2),
      winCount: wins,
      lossCount: total - wins,
      totalTrades: total,
      avgPnL: (monthlyTrades.reduce((a, b) => a + Number(b.pnl), 0) / total).toFixed(2),
      bestDayPnL: bestDayPnL.toFixed(2),
      worstDayPnL: worstDayPnL.toFixed(2),
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

  // Animated counters — all called at top level (this fixes the hook error)
  const animatedPnL = useCountUp(Math.abs(monthlyStats.totalPnL));
  const animatedWinRate = useCountUp(Number(monthlyStats.winRate));
  const animatedTrades = useCountUp(monthlyStats.totalTrades);
  const animatedBestDay = useCountUp(Math.abs(monthlyStats.bestDayPnL));
  const animatedWorstDay = useCountUp(Math.abs(monthlyStats.worstDayPnL));

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
        {[
          {
            title: "Monthly P&L",
            value: Math.abs(monthlyStats.totalPnL),
            prefix: monthlyStats.totalPnL >= 0 ? "+" : "-",
            color: monthlyStats.totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
            icon: monthlyStats.totalPnL >= 0 ? TrendingUp : TrendingDown,
          },
          {
            title: "Win Rate",
            value: Number(monthlyStats.winRate),
            suffix: "%",
            color: "text-indigo-600 dark:text-indigo-400",
            icon: Percent,
          },
          {
            title: "Profit Factor",
            value: monthlyStats.profitFactor,
            color: "text-cyan-600 dark:text-cyan-400",
            icon: Activity,
          },
          {
            title: "Streak",
            value: currentStreak.count > 0 ? `${currentStreak.type} ${currentStreak.count}` : "None",
            color:
              currentStreak.type === "Win"
                ? "text-emerald-600 dark:text-emerald-400"
                : currentStreak.type === "Loss"
                ? "text-rose-600 dark:text-rose-400"
                : "text-gray-500 dark:text-gray-400",
            icon: Zap,
          },
          {
            title: "Avg R:R",
            value: monthlyStats.avgRR,
            color: "text-violet-600 dark:text-violet-400",
            icon: BarChart3,
          },
        ].map((stat, i) => {
          // Use pre-computed animated values instead of calling hook here
          let animatedValue;
          if (stat.title === "Monthly P&L") animatedValue = animatedPnL;
          else if (stat.title === "Win Rate") animatedValue = animatedWinRate;
          else if (stat.title === "Total Trades") animatedValue = animatedTrades;
          else animatedValue = stat.value; // non-animated for others

          return (
            <Card
              key={i}
              className="relative overflow-hidden bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-medium text-amber-700/80 dark:text-gray-400 group-hover:text-amber-900 dark:group-hover:text-gray-200 transition-colors">
                    {stat.title}
                  </div>
                  <stat.icon className="h-5 w-5 text-amber-500/40 dark:text-gray-500/40 group-hover:text-amber-500 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
                <div className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>
                  {stat.prefix || ""}
                  {typeof animatedValue === "number" ? animatedValue.toFixed(stat.suffix ? 1 : 2) : animatedValue}
                  {stat.suffix || ""}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent dark:from-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Card>
          );
        })}
      </div>

      {/* Quick Recent Trades + Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-5 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Recent Trades
            </h3>
            <button
              onClick={() => navigate("/trades")}
              className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              View All <span aria-hidden="true">→</span>
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
                  key={trade.id || i}
                  onClick={() => navigate(`/trades?date=${format(new Date(trade.date), "yyyy-MM-dd")}`)}
                  className="flex items-center justify-between p-4 bg-amber-50/50 dark:bg-gray-800/50 rounded-xl border border-amber-100 dark:border-gray-700 hover:bg-amber-100/50 dark:hover:bg-gray-700/50 transition-all cursor-pointer group"
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
                      <div className="font-semibold text-amber-950 dark:text-gray-200 group-hover:text-amber-900 dark:group-hover:text-white transition-colors">
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

        {/* Highlights Panel */}
        <Card className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-5 lg:p-6">
          <h3 className="text-lg font-semibold mb-5 text-amber-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Monthly Highlights
          </h3>

          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-800 dark:text-gray-300">Best Day</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +${animatedBestDay.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-800 dark:text-gray-300">Worst Day</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                -${animatedWorstDay.toFixed(2)}
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
                  {animatedWinRate}%
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
      <Card className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-amber-200/50 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-5 lg:p-6">
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

                  {/* Weekly Summary */}
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
