// src/pages/Dashboard.jsx
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
  parseISO,
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
import { db, auth } from "../firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";

// ────────────────────────────────────────────────
// Animated number component (unchanged)
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// Main Dashboard Component – Forgex
// ────────────────────────────────────────────────
export default function Dashboard({ currentAccount }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [trades, setTrades] = useState([]);
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [showQuickAnalysis, setShowQuickAnalysis] = useState(false);

  // Fetch trades from Firestore for selected account
  const refreshData = async () => {
    const user = auth.currentUser;
    if (!user || !currentAccount?.id) {
      setTrades([]);
      setAccountData(null);
      setLoading(false);
      setError("Please select an account to view dashboard data");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get account metadata (starting balance, createdAt)
      const accountRef = doc(db, "users", user.uid, "accounts", currentAccount.id);
      const accountSnap = await getDoc(accountRef);
      if (accountSnap.exists()) {
        setAccountData(accountSnap.data());
      } else {
        setAccountData(null);
      }

      // Get trades from account subcollection
      const tradesRef = collection(accountRef, "trades");
      const q = query(tradesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const loadedTrades = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrades(loadedTrades);
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      setError("Failed to load trades. " + (err.message || "Check connection"));
      setTrades([]);
      setAccountData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        refreshData();
      } else {
        setTrades([]);
        setAccountData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [currentAccount]);

  // ─── Calendar month navigation ───────────────────────────────
  const prevMonth = () => setViewDate((d) => subMonths(d, 1));
  const nextMonth = () => setViewDate((d) => addMonths(d, 1));
  const jumpTo = (y, m) => setViewDate(new Date(y, m - 1, 1));
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);

  // ─── Monthly trades filtering & sorting ─────────────────────
  const monthlyTrades = useMemo(() => {
    return trades
      .filter((t) => {
        const td = new Date(t.date);
        return td >= monthStart && td <= monthEnd;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [trades, viewDate]);

  // ─── Weekly trades for streak calculation ────────────────────
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

  // ─── Current streak calculation ──────────────────────────────
  const currentStreak = useMemo(() => {
    let streak = { type: "None", count: 0 };
    let current = null;
    for (const trade of [...weeklyTrades].reverse()) {
      const pnl = Number(trade.pnl) || 0;
      if (pnl === 0) continue;
      if (current === null) {
        current = pnl > 0 ? "Win" : "Loss";
        streak = { type: current, count: 1 };
      } else if (
        (pnl > 0 && current === "Win") ||
        (pnl < 0 && current === "Loss")
      ) {
        streak.count += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [weeklyTrades]);

  // ─── Monthly stats calculation (core metrics) ────────────────
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
    const profits = monthlyTrades
      .filter((t) => Number(t.pnl || 0) > 0)
      .reduce((a, b) => a + Number(b.pnl || 0), 0);
    const losses = monthlyTrades
      .filter((t) => Number(t.pnl || 0) < 0)
      .reduce((a, b) => a + Math.abs(Number(b.pnl || 0)), 0);
    const profitFactor = losses ? (profits / losses).toFixed(2) : "∞";
    const wins = monthlyTrades.filter((t) => Number(t.pnl || 0) > 0).length;
    const total = monthlyTrades.length;
    const winRate = ((wins / total) * 100).toFixed(1);
    const expectancy = (
      monthlyTrades.reduce((a, b) => a + Number(b.pnl || 0), 0) / total
    ).toFixed(2);
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
      const bestEntry = entries.reduce((max, curr) =>
        curr[1] > max[1] ? curr : max
      );
      const worstEntry = entries.reduce((min, curr) =>
        curr[1] < min[1] ? curr : min
      );
      bestDayPnL = bestEntry[1].toFixed(2);
      bestDayDate = format(new Date(bestEntry[0]), "dd MMM");
      worstDayPnL = worstEntry[1].toFixed(2);
      worstDayDate = format(new Date(worstEntry[0]), "dd MMM");
    }
    const totalRR = monthlyTrades.reduce(
      (sum, t) => sum + (Number(t.rr) || 0),
      0
    );
    const avgRR = total ? (totalRR / total).toFixed(2) : "0.00";
    return {
      totalPnL: (profits - losses).toFixed(2),
      winRate,
      profitFactor,
      expectancy,
      winCount: wins,
      lossCount: total - wins,
      totalTrades: total,
      avgPnL: (
        monthlyTrades.reduce((a, b) => a + Number(b.pnl || 0), 0) / total
      ).toFixed(2),
      bestDayPnL,
      bestDayDate,
      worstDayPnL,
      worstDayDate,
      avgRR,
    };
  }, [monthlyTrades]);

  // ─── Consistency Score (highest winning day PNL / total profit × 100%) ────────
  const consistencyScore = useMemo(() => {
    if (!monthlyTrades.length) return 0;

    const dailyPnL = {};
    monthlyTrades.forEach((t) => {
      const day = format(new Date(t.date), "yyyy-MM-dd");
      dailyPnL[day] = (dailyPnL[day] || 0) + Number(t.pnl || 0);
    });

    const totalProfit = monthlyTrades.reduce((sum, t) => sum + Math.max(0, Number(t.pnl || 0)), 0);
    const highestWinningDay = Math.max(...Object.values(dailyPnL), 0);

    return totalProfit > 0 ? ((highestWinningDay / totalProfit) * 100).toFixed(1) : 0;
  }, [monthlyTrades]);

  // ─── Weekly wins / losses / breakeven ────────────────────────
  const weeklyStats = useMemo(() => {
    const weekly = {};
    trades.forEach((t) => {
      if (t.date) {
        const date = new Date(t.date);
        const weekKey = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-'W'ww");
        if (!weekly[weekKey]) weekly[weekKey] = { wins: 0, losses: 0, breakeven: 0 };
        const pnl = Number(t.pnl || 0);
        if (pnl > 0) weekly[weekKey].wins++;
        else if (pnl < 0) weekly[weekKey].losses++;
        else weekly[weekKey].breakeven++;
      }
    });
    return Object.entries(weekly)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([week, data]) => ({ week, ...data }));
  }, [trades]);

  // ─── Trades grouped by date for calendar ─────────────────────
  const tradesByDate = useMemo(() => {
    return monthlyTrades.reduce((acc, t) => {
      const d = t.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
      if (!acc[d]) acc[d] = [];
      acc[d].push(t);
      return acc;
    }, {});
  }, [monthlyTrades]);

  // ─── Day summary helper ──────────────────────────────────────
  function daySummary(dateObj) {
    const key = format(dateObj, "yyyy-MM-dd");
    const list = tradesByDate[key] || [];
    if (!list.length) return null;
    const pnl = list.reduce((s, t) => s + Number(t.pnl || 0), 0);
    const count = list.length;
    const wins = list.filter((t) => Number(t.pnl || 0) > 0).length;
    const winRate = Math.round((wins / count) * 100) || 0;
    const rrAvg = list.reduce((s, t) => s + (Number(t.rr) || 0), 0) / count || 0;
    return { date: key, pnl, count, winRate, rrAvg };
  }

  // ─── Week summary helper ─────────────────────────────────────
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

  // ─── Calendar weeks generation ───────────────────────────────
  const calendarWeeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [viewDate]);

  // ─── Open day detail ─────────────────────────────────────────
  const openDay = (dayObj) => {
    const formattedDate = format(dayObj, "yyyy-MM-dd");
    navigate("/trades?date=" + formattedDate);
  };

  // ─── Recent trades preview ───────────────────────────────────
  const recentTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [trades]);

  // ─── All-time total PnL ──────────────────────────────────────
  const allTimePnL = useMemo(() => {
    if (!trades.length) return 0;
    return trades.reduce((sum, t) => sum + Number(t.pnl || 0), 0).toFixed(2);
  }, [trades]);

  // ─── Account info from Firestore ─────────────────────────────
  const accountCreatedAt = accountData?.createdAt?.toDate?.() || new Date("2024-01-01");
  const startingBalance = accountData?.starting_balance || 10000;

  // ─── Account growth percentage ───────────────────────────────
  const accountGrowth = useMemo(() => {
    if (startingBalance <= 0) return 0;
    return ((allTimePnL / startingBalance) * 100).toFixed(1);
  }, [allTimePnL, startingBalance]);

  // ─── Quick Analysis Modal Content ────────────────────────────
  const quickAnalysisContent = () => {
    if (!monthlyTrades.length) {
      return (
        <div className="text-center py-10 px-4">
          <AlertCircle size={64} className="mx-auto text-indigo-400 mb-6 opacity-80" />
          <h3 className="text-2xl font-semibold mb-4 text-gray-200">
            No trades recorded this month
          </h3>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
            Add some trades to unlock real-time performance insights, pattern detection,
            and personalized trading suggestions.
          </p>
          <button
            onClick={() => {
              setShowQuickAnalysis(false);
              navigate("/trades/new");
            }}
            className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all"
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
        {/* Performance Snapshot */}
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

        {/* Personalized Suggestions */}
        <div className="p-6 bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl border border-gray-700 shadow-inner">
          <h4 className="text-xl font-semibold mb-5 flex items-center gap-3 text-gray-200">
            <Lightbulb size={22} className="text-yellow-400" />
            Instant Coaching Insights
          </h4>
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            {totalTrades < 15 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-400 mt-1 shrink-0" size={18} />
                <p>
                  Sample size still small ({totalTrades} trades). Aim for at least 20–30 trades before drawing strong conclusions about strategy effectiveness.
                </p>
              </div>
            )}
            {winRate < 50 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="text-rose-400 mt-1 shrink-0" size={18} />
                <p>
                  Win rate below 50% — be extra selective this week. Only take A+ setups that match your proven edge. Avoid revenge or FOMO trades.
                </p>
              </div>
            )}
            {avgRR < 2 && (
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-400 mt-1 shrink-0" size={18} />
                <p>
                  Average reward:risk is low ({avgRR}). Focus on trades with minimum 1:2.5 or better. Avoid break-even or 1:1 targets unless extremely high probability.
                </p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <CheckCircle className="text-emerald-400 mt-1 shrink-0" size={18} />
              <p>
                Review your last 5 losing trades in detail. Look for one repeating mistake (entry timing, sizing, stop placement, emotion). Fix that pattern first.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-emerald-400 mt-1 shrink-0" size={18} />
              <p>
                Maintain risk at ≤1% per trade until win rate consistently exceeds 55%. Protect capital while you refine your edge.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="text-emerald-400 mt-1 shrink-0" size={18} />
              <p>
                Journal every trade’s emotion and confidence level (1–10). Patterns in psychology often explain results more than technicals.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative min-h-screen w-full p-4 sm:p-6 lg:p-8 text-gray-100 ${isDark ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-100"}`}>
      {/* Header + Account Details */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Forgex Dashboard
            </h1>
            <p className="mt-1.5 text-gray-400">
              {format(viewDate, "MMMM yyyy")} • {currentAccount?.name || "Account"}
            </p>
          </div>
          <button
            onClick={() => setShowQuickAnalysis(true)}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all duration-200"
          >
            <Zap size={18} />
            Quick Analysis
          </button>
        </div>

        {/* Account Overview Card */}
        <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <DollarSign className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            Account Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Starting Balance</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                ${startingBalance.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Created On</div>
              <div className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-1">
                {format(accountCreatedAt, "dd MMM yyyy")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total PnL (All Time)</div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  allTimePnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {allTimePnL >= 0 ? "+" : ""}${Math.abs(allTimePnL)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Consistency Score</div>
              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1">
                {consistencyScore}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-rose-400">
          {error}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5 mb-8">
            {[
              {
                title: "Monthly P&L",
                value: Number(monthlyStats.totalPnL),
                prefix: Number(monthlyStats.totalPnL) >= 0 ? "+" : "-",
                color: Number(monthlyStats.totalPnL) >= 0 ? "emerald" : "rose",
                icon: TrendingUp,
              },
              {
                title: "Win Rate",
                value: Number(monthlyStats.winRate),
                suffix: "%",
                color: "indigo",
                icon: Percent,
                animated: true,
              },
              {
                title: "Profit Factor",
                value: monthlyStats.profitFactor,
                color: "cyan",
                icon: Activity,
              },
              {
                title: "Consistency Score",
                value: consistencyScore,
                suffix: "/100",
                color: "violet",
                icon: Zap,
              },
              {
                title: "Total Trades",
                value: monthlyStats.totalTrades,
                color: "violet",
                icon: BarChart3,
                animated: true,
              },
              {
                title: "Expectancy",
                value: Number(monthlyStats.expectancy),
                prefix: "$",
                color: "teal",
                icon: DollarSign,
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {stat.title}
                  </div>
                  <stat.icon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-extrabold ${
                    stat.color === "emerald"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : stat.color === "rose"
                      ? "text-rose-600 dark:text-rose-400"
                      : stat.color === "indigo"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : stat.color === "cyan"
                      ? "text-cyan-600 dark:text-cyan-400"
                      : stat.color === "violet"
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-teal-600 dark:text-teal-400"
                  }`}
                >
                  {stat.animated ? (
                    <AnimatedNumber value={stat.value} decimals={stat.decimals || 0} />
                  ) : (
                    <>
                      {stat.prefix || ""}
                      {stat.value}
                      {stat.suffix || ""}
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Weekly Stats Card */}
          <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg mb-8">
            <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Weekly Wins / Losses / Breakeven
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyStats.length > 0 ? (
                weeklyStats.map((week, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-100/50 dark:bg-gray-900/40">
                    <div className="text-sm font-medium mb-2">Week {week.week}</div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        Wins: <span className="font-bold text-emerald-600">{week.wins}</span>
                      </div>
                      <div>
                        Losses: <span className="font-bold text-rose-600">{week.losses}</span>
                      </div>
                      <div>
                        Breakeven: <span className="font-bold text-gray-500">{week.breakeven}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-6">
                  No weekly data available yet
                </div>
              )}
            </div>
          </Card>

          {/* Recent Trades + Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <Card className="lg:col-span-2 p-5 lg:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Activity className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  Recent Trades
                </h3>
                <button
                  onClick={() => navigate("/trades")}
                  className="text-sm flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  View All →
                </button>
              </div>
              {recentTrades.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                  No recent trades yet
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTrades.map((trade, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(`/trades?date=${format(new Date(trade.date), "yyyy-MM-dd")}`)}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/60 transition-all cursor-pointer"
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
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {trade.pair} {trade.direction}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
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

            {/* Monthly Highlights */}
            <Card className="p-5 lg:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BarChart3 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Monthly Highlights
              </h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Best Day</span>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      +${monthlyStats.bestDayPnL}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {monthlyStats.bestDayDate}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Worst Day</span>
                  <div className="text-right">
                    <div className="font-bold text-rose-600 dark:text-rose-400">
                      ${monthlyStats.worstDayPnL}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {monthlyStats.worstDayDate}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg R:R</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {monthlyStats.avgRR}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      <AnimatedNumber value={Number(monthlyStats.winRate)} decimals={1} />%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000 ease-out"
                      style={{ width: `${monthlyStats.winRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Calendar */}
          <Card className="p-5 lg:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
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
              <span className="text-sm font-medium text-gray-400 dark:text-gray-400">
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
                      <div
                        className={`aspect-square rounded-xl p-1.5 sm:p-2 flex flex-col justify-center items-center border ${
                          isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-100/50 border-gray-200"
                        }`}
                      >
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
            className="fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all duration-200 flex items-center justify-center transform hover:scale-110 active:scale-95"
            aria-label="Add New Trade"
          >
            <span className="text-3xl font-bold leading-none">+</span>
          </button>

          {/* Quick Analysis Modal */}
          {showQuickAnalysis && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] p-4">
              <div className="w-full max-w-3xl rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                      Quick Analysis
                    </h2>
                    <button
                      onClick={() => setShowQuickAnalysis(false)}
                      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X size={28} />
                    </button>
                  </div>

                  {quickAnalysisContent()}

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button
                      onClick={() => setShowQuickAnalysis(false)}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
