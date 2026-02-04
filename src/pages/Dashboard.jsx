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

  // Consistency Score (0–100)
  const consistencyScore = useMemo(() => {
    if (!monthlyTrades.length) return 0;

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const tradingDays = new Set(monthlyTrades.map(t => format(new Date(t.date), "yyyy-MM-dd"))).size;
    const frequencyScore = Math.min(100, Math.round((tradingDays / daysInMonth) * 100));

    const streakBonus = currentStreak.count * 6;
    const finalScore = Math.min(100, Math.round(frequencyScore * 0.6 + streakBonus * 0.4));

    return finalScore;
  }, [monthlyTrades, currentStreak.count, viewDate]);

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
          <div className={`p-6 rounded-2xl border shadow-inner ${isDark ? "bg-gray-900/70 border-gray-700" : "bg-white/90 border-gray-200"}`}>
            <div className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Win Rate</div>
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

          <div className={`p-6 rounded-2xl border shadow-inner ${isDark ? "bg-gray-900/70 border-gray-700" : "bg-white/90 border-gray-200"}`}>
            <div className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Net Result</div>
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

          <div className={`p-6 rounded-2xl border shadow-inner ${isDark ? "bg-gray-900/70 border-gray-700" : "bg-white/90 border-gray-200"}`}>
            <div className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Average R:R</div>
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

        <div className={`p-6 rounded-2xl border shadow-inner ${isDark ? "bg-gradient-to-br from-gray-950 to-gray-900 border-gray-700" : "bg-gradient-to-br from-gray-50 to-white border-gray-200"}`}>
          <h4 className={`text-xl font-semibold mb-5 flex items-center gap-3 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            <Lightbulb size={22} className="text-yellow-400" />
            Instant Coaching Insights
          </h4>

          <div className="space-y-4 text-sm leading-relaxed">
            {totalTrades < 15 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-400 mt-1 shrink-0" size={18} />
                <p>Sample size still small ({totalTrades} trades). Aim for 20–30 trades before strong conclusions.</p>
              </div>
            )}
            {monthlyStats.winRate < 50 && (
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
      {/* Very subtle background animation */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950 animate-gradient-slow"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(79,70,229,0.06)_0%,transparent_70%)] animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.04)_0%,transparent_80%)] animate-pulse-slower"></div>
      </div>

      <div className={`relative min-h-screen w-full p-4 sm:p-6 lg:p-8 overflow-y-auto ${isDark ? "text-gray-200 bg-gray-950" : "text-gray-900 bg-gray-50"}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 mb-10">
          {/* Monthly P&L */}
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

          {/* Win Rate + tooltip */}
          <div className="group relative">
            <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
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
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end justify-center pb-4 z-20">
              <div className={`px-4 py-2.5 rounded-lg text-sm max-w-xs text-center shadow-xl border ${
                isDark ? "bg-gray-900/95 border-gray-700 text-gray-300" : "bg-white/95 border-gray-200 text-gray-700"
              }`}>
                Percentage of winning trades this month (higher = more consistent strategy)
              </div>
            </div>
          </div>

          {/* Profit Factor + tooltip */}
          <div className="group relative">
            <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
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
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end justify-center pb-4 z-20">
              <div className={`px-4 py-2.5 rounded-lg text-sm max-w-xs text-center shadow-xl border ${
                isDark ? "bg-gray-900/95 border-gray-700 text-gray-300" : "bg-white/95 border-gray-200 text-gray-700"
              }`}>
                Gross profit ÷ gross loss — >1.5 is good, >2 is excellent
              </div>
            </div>
          </div>

          {/* Consistency Score */}
          <div className="group relative">
            <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
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
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-end justify-center pb-4 z-20">
              <div className={`px-4 py-2.5 rounded-lg text-sm max-w-xs text-center shadow-xl border ${
                isDark ? "bg-gray-900/95 border-gray-700 text-gray-300" : "bg-white/95 border-gray-200 text-gray-700"
              }`}>
                Combines trading frequency + streak strength — higher means more disciplined
              </div>
            </div>
          </div>

          {/* Total Trades */}
          <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
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

          {/* Expectancy */}
          <Card className={`relative overflow-hidden backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
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

        {/* Recent Trades + Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <Card className={`lg:col-span-2 backdrop-blur-md rounded-2xl shadow-lg p-5 lg:p-6 hover:shadow-2xl transition-all duration-300 ${
            isDark ? "bg-gray-900/70 border-indigo-500/20" : "bg-white/90 border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                <Activity className="h-5 w-5 text-indigo-400" />
                Recent Trades
              </h3>
              <button
                onClick={() => navigate("/trades")}
                className={`text-sm flex items-center gap-1 transition-colors ${
                  isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
                }`}
              >
                View All →
              </button>
            </div>

            {recentTrades.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${isDark ? "text-gray-400 bg-gray-800/30" : "text-gray-600 bg-gray-100/50"}`}>
                No recent trades yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentTrades.map((trade, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/trades?date=${format(new Date(trade.date), "yyyy-MM-dd")}`)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      isDark
                        ? "bg-gray-800/40 border-gray-700 hover:bg-gray-700/60"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shadow-sm ${
                          trade.pnl >= 0
                            ? "bg-emerald-900/40 text-emerald-300"
                            : "bg-rose-900/40 text-rose-300"
                        }`}
                      >
                        {trade.pair?.slice(0, 2) || "T"}
                      </div>
                      <div>
                        <div className={`font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                          {trade.pair} {trade.direction}
                        </div>
                        <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {format(new Date(trade.date), "dd MMM yyyy • HH:mm")}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-bold text-lg ${
                        trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {trade.pnl >= 0 ? "+" : ""}${Math.abs(Number(trade.pnl || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Monthly Highlights */}
          <Card className={`backdrop-blur-md rounded-2xl shadow-lg p-5 lg:p-6 ${isDark ? "bg-gray-900/70 border-indigo-500/20" : "bg-white/90 border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              Monthly Highlights
            </h3>

            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Best Day</span>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">
                    +${monthlyStats.bestDayPnL}
                  </div>
                  <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                    {monthlyStats.bestDayDate}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Worst Day</span>
                <div className="text-right">
                  <div className="font-bold text-rose-400">
                    ${monthlyStats.worstDayPnL}
                  </div>
                  <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                    {monthlyStats.worstDayDate}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Avg R:R</span>
                <span className="font-bold text-purple-300">
                  {monthlyStats.avgRR}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>Win Rate</span>
                  <span className="text-xl font-bold text-indigo-300">
                    <AnimatedNumber value={Number(monthlyStats.winRate)} decimals={1} />%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-1000 ease-out"
                    style={{ width: `${monthlyStats.winRate}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar */}
        <Card className={`backdrop-blur-md rounded-2xl shadow-lg p-5 lg:p-6 ${isDark ? "bg-gray-900/70 border-indigo-500/20" : "bg-white/90 border-gray-200"}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className={`p-3 rounded-xl transition-all shadow-sm hover:shadow-md ${
                  isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
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
                className={`px-5 py-3 rounded-xl border transition-all shadow-sm hover:shadow-md ${
                  isDark ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700" : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {format(viewDate, "MMMM yyyy")}
              </button>
              <button
                onClick={nextMonth}
                className={`p-3 rounded-xl transition-all shadow-sm hover:shadow-md ${
                  isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ▶
              </button>
            </div>
            <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Tap a day to view trades
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 min-w-[640px] gap-1.5 sm:gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Wk"].map((d) => (
                <div
                  key={d}
                  className={`text-xs font-medium text-center py-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}
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
                              ? isDark
                                ? "bg-gray-900/70 border-indigo-500/30"
                                : "bg-white/80 border-gray-200"
                              : isDark
                              ? "bg-transparent border-dashed border-gray-700/40"
                              : "bg-transparent border-dashed border-gray-300"}
                            hover:shadow-xl hover:scale-[1.03] hover:border-indigo-400
                          `}
                          style={{
                            backgroundColor: pnl > 0
                              ? `rgba(34, 197, 94, ${intensity})`
                              : pnl < 0
                              ? `rgba(239, 68, 68, ${intensity})`
                              : undefined,
                          }}
                        >
                          <div className={`text-xs text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {format(dayObj, "d")}
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center text-center">
                            {ds ? (
                              <>
                                <div
                                  className={`font-bold text-xs sm:text-sm ${
                                    pnl >= 0
                                      ? "text-emerald-400"
                                      : "text-rose-400"
                                  }`}
                                >
                                  {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
                                </div>
                                <div className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                  {ds.count}t • {ds.winRate}%
                                </div>
                              </>
                            ) : (
                              <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>—</div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Weekly Summary */}
                    <div className={`aspect-square rounded-xl p-1.5 sm:p-2 flex flex-col justify-center items-center border ${
                      isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-100/50 border-gray-200"
                    }`}>
                      <div className={`text-xs mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        W{wi + 1}
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          wSum.pnl >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {wSum.pnl >= 0 ? "+" : ""}${Math.abs(wSum.pnl).toFixed(2)}
                      </div>
                      <div className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
          className={`fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95 ${
            isDark
              ? "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white hover:shadow-purple-500/40"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:shadow-indigo-500/40"
          }`}
          aria-label="Add New Trade"
        >
          <span className="text-3xl font-bold leading-none">+</span>
        </button>

        {/* Quick Analysis Modal */}
        {showQuickAnalysis && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4 backdrop-blur-md">
            <div className={`border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-gray-900/95 border-indigo-500/30" : "bg-white/95 border-gray-200"
            }`}>
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Quick Analysis
                  </h2>
                  <button
                    onClick={() => setShowQuickAnalysis(false)}
                    className={`p-2 rounded-full transition-colors ${
                      isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <X size={28} />
                  </button>
                </div>

                {quickAnalysisContent()}

                <div className="mt-8 pt-6 border-t flex justify-end">
                  <button
                    onClick={() => setShowQuickAnalysis(false)}
                    className={`px-6 py-3 rounded-xl transition-all ${
                      isDark ? "bg-gray-800 hover:bg-gray-700 border-gray-700" : "bg-gray-100 hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
