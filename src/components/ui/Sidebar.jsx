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
  Activity,
  Percent,
  Zap,
  BarChart3,
  DollarSign,
  X,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Animated number component
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
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [showQuickAnalysis, setShowQuickAnalysis] = useState(false);

  // Fetch trades
  const refreshTrades = async () => {
    setLoading(true);
    try {
      const currentId = localStorage.getItem("currentAccountId") || "default";
      const res = await fetch(
        `https://tradeass-backend.onrender.com/api/trades?accountId=${currentId}`
      );
      const data = await res.json();
      setTrades(data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
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
        winRate: "0.0",
        profitFactor: "—",
        expectancy: "0.00",
        winCount: 0,
        lossCount: 0,
        totalTrades: 0,
        avgPnL: "0.00",
        bestDayPnL: 0,
        bestDayDate: "—",
        worstDayPnL: 0,
        worstDayDate: "—",
        avgRR: "0.00",
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

    let bestDayPnL = 0;
    let bestDayDate = "—";
    let worstDayPnL = 0;
    let worstDayDate = "—";

    if (Object.keys(dailyPnL).length > 0) {
      const entries = Object.entries(dailyPnL);
      const bestEntry = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
      const worstEntry = entries.reduce((min, curr) => (curr[1] < min[1] ? curr : min));

      bestDayPnL = bestEntry[1].toFixed(2);
      bestDayDate = format(new Date(bestEntry[0]), "dd MMM");
      worstDayPnL = worstEntry[1].toFixed(2);
      worstDayDate = format(new Date(worstEntry[0]), "dd MMM");
    }

    const totalRR = monthlyTrades.reduce((sum, t) => sum + (Number(t.rr) || 0), 0);
    const avgRR = total ? (totalRR / total).toFixed(2) : "0.00";

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
      bestDayDate,
      worstDayPnL,
      worstDayDate,
      avgRR,
    };
  }, [monthlyTrades]);

  // ─── Consistency Score = (Best daily win rate / Overall win rate) × 100 ──────
  const consistencyScore = useMemo(() => {
    if (!monthlyTrades.length) return 0;

    const dailyWinRates = {};
    monthlyTrades.forEach((t) => {
      const day = format(new Date(t.date), "yyyy-MM-dd");
      if (!dailyWinRates[day]) {
        dailyWinRates[day] = { wins: 0, total: 0 };
      }
      dailyWinRates[day].total += 1;
      if (t.pnl > 0) dailyWinRates[day].wins += 1;
    });

    let bestDailyWinRate = 0;
    Object.values(dailyWinRates).forEach(({ wins, total }) => {
      const rate = total > 0 ? (wins / total) * 100 : 0;
      if (rate > bestDailyWinRate) bestDailyWinRate = rate;
    });

    const overallWinRate = Number(monthlyStats.winRate);
    if (overallWinRate === 0) return 0;

    const score = Math.min(100, Math.round((bestDailyWinRate / overallWinRate) * 100));
    return score;
  }, [monthlyTrades, monthlyStats.winRate]);

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

  const recentTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [trades]);

  // All-time total PnL (not monthly)
  const allTimePnL = useMemo(() => {
    if (!trades.length) return 0;
    return trades.reduce((sum, t) => sum + Number(t.pnl || 0), 0).toFixed(2);
  }, [trades]);

  // Placeholder values - in real app you should store these when account is created
  const initialBalance = 10000; // example - replace with real value from account
  const accountCreatedAt = currentAccount?.createdAt || new Date("2024-01-01");

  // Account growth %
  const accountGrowth = useMemo(() => {
    if (initialBalance <= 0) return 0;
    return ((allTimePnL / initialBalance) * 100).toFixed(1);
  }, [allTimePnL]);

  const quickAnalysisContent = () => {
    if (!monthlyTrades.length) {
      return (
        <div className="text-center py-10 px-4">
          <AlertCircle size={64} className="mx-auto text-indigo-400 mb-6 opacity-80" />
          <h3 className="text-2xl font-semibold mb-4 text-gray-200">No trades recorded this month</h3>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
            Add some trades to unlock real-time performance insights, pattern detection, and personalized trading suggestions.
          </p>
          <button
            onClick={() => {
              setShowQuickAnalysis(false);
              navigate("/trades/new");
            }}
            className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-800 hover:to-purple-900 text-white rounded-xl shadow-lg transition-all"
          >
            Add Your First Trade
          </button>
        </div>
      );
    }

    const winRate = Number(monthlyStats.winRate);
    const totalPnL = Number(monthlyStats.totalPnL);
    const avgRR = Number(monthlyStats.avgRR);
    const totalTrades = monthlyStats.totalTrades;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-900/70 rounded-2xl border border-gray-700 shadow-inner">
            <div className="text-sm text-gray-400 mb-2">Win Rate</div>
            <div className="text-4xl font-bold text-indigo-300">{winRate}%</div>
            <div className="mt-3 text-sm opacity-80 flex items-center gap-2">
              {winRate >= 60 ? (
                <CheckCircle className="text-emerald-400" size={18} />
              ) : winRate >= 45 ? (
                <AlertCircle className="text-amber-400" size={18} />
              ) : (
                <AlertCircle className="text-rose-400" size={18} />
              )}
              {winRate >= 60
                ? "Strong performance — protect your edge"
                : winRate >= 45
                ? "Solid base — improve reward:risk"
                : "Needs attention — focus on high-probability entries"}
            </div>
          </div>

          <div className="p-6 bg-gray-900/70 rounded-2xl border border-gray-700 shadow-inner">
            <div className="text-sm text-gray-400 mb-2">Net Result</div>
            <div
              className={`text-4xl font-bold ${
                totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {totalPnL >= 0 ? "+" : ""}${Math.abs(totalPnL).toFixed(2)}
            </div>
            <div className="mt-3 text-sm opacity-80 flex items-center gap-2">
              {totalPnL >= 0 ? (
                <ArrowUpRight className="text-emerald-400" size={18} />
              ) : (
                <ArrowDownRight className="text-rose-400" size={18} />
              )}
              {totalPnL >= 0 ? "Positive month — manage greed" : "Drawdown — tighten risk now"}
            </div>
          </div>

          <div className="p-6 bg-gray-900/70 rounded-2xl border border-gray-700 shadow-inner">
            <div className="text-sm text-gray-400 mb-2">Average R:R</div>
            <div className="text-4xl font-bold text-purple-300">{avgRR}</div>
            <div className="mt-3 text-sm opacity-80 flex items-center gap-2">
              {avgRR >= 2.5 ? (
                <CheckCircle className="text-emerald-400" size={18} />
              ) : (
                <AlertCircle className="text-amber-400" size={18} />
              )}
              {avgRR >= 2.5
                ? "Excellent asymmetry — keep hunting"
                : "Can improve — aim for 1:3+ setups"}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl border border-gray-700 shadow-inner">
          <h4 className="text-xl font-semibold mb-5 flex items-center gap-3 text-gray-200">
            <Lightbulb size={22} className="text-yellow-400" />
            Instant Coaching Insights
          </h4>

          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            {totalTrades < 15 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-400 mt-1 shrink-0" size={18} />
                <p>Sample size still small ({totalTrades} trades). Aim for 20–30 trades before strong conclusions.</p>
              </div>
            )}
            {winRate < 50 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="text-rose-400 mt-1 shrink-0" size={18} />
                <p>Win rate below 50% — be extra selective. Only A+ setups. Avoid revenge/FOMO trades.</p>
              </div>
            )}
            {avgRR < 2 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-400 mt-1 shrink-0" size={18} />
                <p>Average R:R low ({avgRR}). Target minimum 1:2.5. Avoid 1:1 or break-even trades.</p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <CheckCircle className="text-emerald-400 mt-1 shrink-0" size={18} />
              <p>Review last 5 losing trades — identify one repeating mistake (timing, sizing, stop, emotion).</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-emerald-400 mt-1 shrink-0" size={18} />
              <p>Maintain ≤1% risk per trade until win rate consistently >55%.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-emerald-400 mt-1 shrink-0" size={18} />
              <p>Journal emotion & confidence (1–10) for every trade — psychology drives results more than you think.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Subtle striped background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gray-950">
          <div className="absolute inset-0 opacity-[0.04] bg-gradient-to-r from-transparent via-indigo-950/30 to-transparent" style={{ transform: "rotate(-45deg)", backgroundSize: "40px 40px" }} />
          <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-r from-transparent via-purple-950/20 to-transparent" style={{ transform: "rotate(45deg)", backgroundSize: "60px 60px" }} />
        </div>
      </div>

      <div className={`relative min-h-screen w-full p-4 sm:p-6 lg:p-8 overflow-y-auto ${isDark ? "text-gray-200 bg-transparent" : "text-gray-900 bg-gray-50"}`}>
        {/* Header + Account Details */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className={`mt-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {format(viewDate, "MMMM yyyy")} • {currentAccount?.name || "Account"}
              </p>
            </div>

            <button
              onClick={() => setShowQuickAnalysis(true)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-medium transform hover:scale-[1.03] active:scale-95 ${
                isDark
                  ? "bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-800 hover:to-purple-900 text-white"
                  : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white"
              }`}
            >
              <Zap size={18} />
              Quick Analysis
            </button>
          </div>

          {/* Account Details Card */}
          <Card className={`p-6 rounded-2xl shadow-xl border ${isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90 border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
              <DollarSign className="h-5 w-5 text-indigo-400" />
              Account Overview
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total PnL (All Time)</div>
                <div className={`text-2xl font-bold mt-1 ${allTimePnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {allTimePnL >= 0 ? "+" : ""}${Math.abs(allTimePnL)}
                </div>
              </div>

              <div>
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Initial Balance</div>
                <div className="text-2xl font-bold text-indigo-300 mt-1">
                  ${initialBalance.toLocaleString()}
                </div>
              </div>

              <div>
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Account Growth</div>
                <div className={`text-2xl font-bold mt-1 ${accountGrowth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {accountGrowth}%
                </div>
              </div>

              <div>
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Created</div>
                <div className="text-xl font-medium text-gray-300 mt-1">
                  {format(new Date(accountCreatedAt), "dd MMM yyyy")}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 mb-10">
          <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group ${
            isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90 border-gray-200"
          }`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`text-sm font-medium ${isDark ? "text-gray-400 group-hover:text-indigo-300" : "text-gray-600 group-hover:text-indigo-700"}`}>
                  Monthly P&L
                </div>
                <TrendingUp className={`h-5 w-5 ${isDark ? "text-gray-600 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-indigo-600"}`} />
              </div>
              <div className={`text-3xl font-extrabold ${monthlyStats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {monthlyStats.totalPnL >= 0 ? "+" : "-"}${Math.abs(monthlyStats.totalPnL)}
              </div>
            </div>
          </Card>

          <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group ${
            isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90 border-gray-200"
          }`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`text-sm font-medium ${isDark ? "text-gray-400 group-hover:text-indigo-300" : "text-gray-600 group-hover:text-indigo-700"}`}>
                  Win Rate
                </div>
                <Percent className={`h-5 w-5 ${isDark ? "text-gray-600 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-indigo-600"}`} />
              </div>
              <div className="text-3xl font-extrabold text-indigo-300">
                <AnimatedNumber value={Number(monthlyStats.winRate)} decimals={1} />%
              </div>
            </div>
          </Card>

          <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group ${
            isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90 border-gray-200"
          }`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`text-sm font-medium ${isDark ? "text-gray-400 group-hover:text-indigo-300" : "text-gray-600 group-hover:text-indigo-700"}`}>
                  Profit Factor
                </div>
                <Activity className={`h-5 w-5 ${isDark ? "text-gray-600 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-indigo-600"}`} />
              </div>
              <div className="text-3xl font-extrabold text-cyan-300">
                {monthlyStats.profitFactor}
              </div>
            </div>
          </Card>

          <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group ${
            isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90 border-gray-200"
          }`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`text-sm font-medium ${isDark ? "text-gray-400 group-hover:text-indigo-300" : "text-gray-600 group-hover:text-indigo-700"}`}>
                  Consistency Score
                </div>
                <Zap className={`h-5 w-5 ${isDark ? "text-gray-600 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-indigo-600"}`} />
              </div>
              <div className="text-3xl font-extrabold text-violet-300">
                {consistencyScore}/100
              </div>
            </div>
          </Card>

          <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group ${
            isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90 border-gray-200"
          }`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`text-sm font-medium ${isDark ? "text-gray-400 group-hover:text-indigo-300" : "text-gray-600 group-hover:text-indigo-700"}`}>
                  Total Trades
                </div>
                <BarChart3 className={`h-5 w-5 ${isDark ? "text-gray-600 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-indigo-600"}`} />
              </div>
              <div className="text-3xl font-extrabold text-violet-300">
                <AnimatedNumber value={monthlyStats.totalTrades} decimals={0} />
              </div>
            </div>
          </Card>

          <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group ${
            isDark ? "bg-gray-900/80 border-gray-700" : "bg-white/90 border-gray-200"
          }`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`text-sm font-medium ${isDark ? "text-gray-400 group-hover:text-indigo-300" : "text-gray-600 group-hover:text-indigo-700"}`}>
                  Expectancy
                </div>
                <DollarSign className={`h-5 w-5 ${isDark ? "text-gray-600 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-indigo-600"}`} />
              </div>
              <div className="text-3xl font-extrabold text-teal-300">
                ${monthlyStats.expectancy}
              </div>
            </div>
          </Card>
        </div>

        {/* Rest of dashboard (Recent Trades, Highlights, Calendar, Floating Button, Quick Analysis Modal) */}
        {/* ... you can paste your original code for these sections here ... */}
        {/* They remain unchanged except for color adjustments where needed */}
      </div>
    </>
  );
}
