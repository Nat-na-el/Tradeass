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
  isSameDay,
} from "date-fns";
import { Plus } from "lucide-react";
import { Card } from "../components/ui/card";
import AddTrade from "@/components/ui/AddTrade";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4001/api/trades";

export default function Dashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const navigate = useNavigate();

  // 🔄 Fetch trades with backend fallback
  useEffect(() => {
    let cancelled = false;

    async function loadTrades() {
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Backend not reachable");
        const data = await res.json();
        if (!cancelled) {
          setTrades(data);
          localStorage.setItem("dj_trades", JSON.stringify(data));
        }
      } catch (err) {
        console.warn("⚠️ Using localStorage fallback:", err);
        const local = JSON.parse(localStorage.getItem("dj_trades") || "[]");
        if (!cancelled) setTrades(local);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTrades();
    const interval = setInterval(loadTrades, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function refreshTrades() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("No backend");
      const data = await res.json();
      setTrades(data);
      localStorage.setItem("dj_trades", JSON.stringify(data));
    } catch {
      const raw = localStorage.getItem("dj_trades");
      setTrades(raw ? JSON.parse(raw) : []);
    }
  }

  // 📆 Helpers for calendar
  const prevMonth = () => setViewDate((d) => subMonths(d, 1));
  const nextMonth = () => setViewDate((d) => addMonths(d, 1));
  const jumpTo = (y, m) => setViewDate(new Date(y, m - 1, 1));

  // 📊 Derived metrics for full account
  const overallStats = useMemo(() => {
    if (!trades.length)
      return { totalPnL: 0, winRate: 0, profitFactor: 0, expectancy: 0 };

    const profits = trades
      .filter((t) => t.pnl > 0)
      .reduce((a, b) => a + Number(b.pnl), 0);
    const losses = trades
      .filter((t) => t.pnl < 0)
      .reduce((a, b) => a + Math.abs(Number(b.pnl)), 0);
    const profitFactor = losses ? (profits / losses).toFixed(2) : "∞";

    const wins = trades.filter((t) => t.pnl > 0).length;
    const total = trades.length;
    const winRate = ((wins / total) * 100).toFixed(1);

    const expectancy =
      trades.reduce((a, b) => a + Number(b.pnl), 0) / total || 0;

    return {
      totalPnL: profits - losses,
      winRate,
      profitFactor,
      expectancy: expectancy.toFixed(2),
    };
  }, [trades]);

  // 🔥 Current streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (const t of trades.slice().reverse()) {
      if (t.pnl > 0) streak = streak >= 0 ? streak + 1 : 1;
      else if (t.pnl < 0) streak = streak <= 0 ? streak - 1 : -1;
      else break;
    }
    return streak;
  }, [trades]);

  // Group trades by date
  const tradesByDate = useMemo(() => {
    return trades.reduce((acc, t) => {
      const d = t.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
      if (!acc[d]) acc[d] = [];
      acc[d].push(t);
      return acc;
    }, {});
  }, [trades]);

  // Day summary
  function daySummary(dateObj) {
    const key = format(dateObj, "yyyy-MM-dd");
    const list = tradesByDate[key] || [];
    if (!list.length) return null;
    const pnl = list.reduce((s, t) => s + Number(t.pnl || 0), 0);
    const count = list.length;
    const wins = list.filter((t) => t.pnl > 0).length;
    const winRate = Math.round((wins / count) * 100);
    const rrAvg =
      list.reduce((s, t) => s + (Number(t.rr) || 0), 0) / count || 0;
    return { date: key, pnl, count, winRate, rrAvg };
  }

  // Week summary
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

  // Calendar weeks
  const calendarWeeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    const allDays = eachDayOfInterval({ start, end });
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7)
      weeks.push(allDays.slice(i, i + 7));
    return weeks;
  }, [viewDate]);

  // Click a day → navigate to trades page
  const openDay = (dateObj) => {
    const key = format(dateObj, "yyyy-MM-dd");
    navigate(`/trades?date=${key}`);
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500 dark:text-slate-400">
        Loading your dashboard...
      </div>
    );

  return (
    <div className="flex flex-col gap-6 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Top Stats */}
      <div className="rounded-2xl p-5 bg-white/70 dark:bg-[#0f1724]/50 border border-slate-300 dark:border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Net PnL */}
          <div className="rounded-xl p-4 bg-slate-100 dark:bg-[#1a2336]/70 shadow-inner">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Net PnL
            </div>
            <div className="text-2xl font-bold text-green-500 dark:text-green-400">
              ${overallStats.totalPnL.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Total Trades: {trades.length}
            </div>
          </div>

          {/* Profit Factor */}
          <div className="rounded-xl p-4 bg-slate-100 dark:bg-[#1b2538]/70 shadow-inner">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Profit Factor
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {overallStats.profitFactor}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Efficiency Metric
            </div>
          </div>

          {/* Winrate */}
          <div className="rounded-xl p-4 bg-slate-100 dark:bg-[#1a2532]/70 shadow-inner">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Win Rate
            </div>
            <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
              {overallStats.winRate}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Expectancy: ${overallStats.expectancy}
            </div>
          </div>

          {/* Current Streak */}
          <div className="rounded-xl p-4 bg-slate-100 dark:bg-[#1c2839]/70 shadow-inner">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Current Streak
            </div>
            <div
              className={`text-2xl font-bold ${
                currentStreak > 0
                  ? "text-green-500"
                  : currentStreak < 0
                  ? "text-red-500"
                  : "text-yellow-500"
              }`}
            >
              {currentStreak > 0
                ? `+${currentStreak} Wins`
                : currentStreak < 0
                ? `${Math.abs(currentStreak)} Losses`
                : "—"}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Consecutive Trades
            </div>
          </div>

          {/* Add shortcut */}
          <div className="rounded-xl p-4 bg-slate-50 dark:bg-[#1b273a]/70 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/5 transition">
            <Plus className="w-6 h-6 text-slate-400 dark:text-slate-300" />
          </div>
        </div>
      </div>

      {/* Calendar + Right Summary */}
      <div className="grid grid-cols-[70%_30%] gap-6">
        {/* Left: Calendar */}
        <Card className="p-5 h-[720px] overflow-y-auto">
          {/* Month controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className="px-3 py-1 rounded-md bg-slate-100 dark:bg-[#0f1724]"
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
                className="px-3 py-1 rounded-md bg-white dark:bg-[#0f1724] border border-slate-200 dark:border-white/10"
              >
                {format(viewDate, "MMMM yyyy")}
              </button>
              <button
                onClick={nextMonth}
                className="px-3 py-1 rounded-md bg-slate-100 dark:bg-[#0f1724]"
              >
                ▶
              </button>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Click a day to view trades
            </div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-[repeat(8,1fr)] gap-3 items-start">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center"
              >
                {d}
              </div>
            ))}
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center">
              Weekly
            </div>

            {calendarWeeks.map((week, wi) => {
              const wSum = weekSummary(week);
              return (
                <React.Fragment key={wi}>
                  {week.map((dayObj, di) => {
                    const ds = daySummary(dayObj);
                    const isCur = dayObj.getMonth() === viewDate.getMonth();
                    return (
                      <div
                        key={di}
                        onClick={() => openDay(dayObj)}
                        className={`cursor-pointer min-h-[90px] rounded-lg p-3 flex flex-col justify-between border transition-all ${
                          isCur
                            ? "bg-white dark:bg-[#0f1724] border-slate-200 dark:border-white/10"
                            : "bg-transparent border-dashed border-slate-300/30 dark:border-white/10"
                        } hover:shadow-md`}
                      >
                        <div className="text-[10px] text-slate-500">
                          {format(dayObj, "d")}
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                          {ds ? (
                            <>
                              <div
                                className={`font-bold text-sm ${
                                  ds.pnl >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                ${Math.abs(ds.pnl).toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {ds.count}t • {ds.winRate}%
                              </div>
                            </>
                          ) : (
                            <div className="text-[10px] text-slate-400">—</div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Weekly summary column */}
                  <div className="rounded-lg p-3 flex flex-col justify-center border bg-slate-50 dark:bg-[#141c2b]/60 border-slate-200 dark:border-white/10">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Week {wi + 1}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        wSum.pnl >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ${wSum.pnl.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {wSum.count} trades • {wSum.winRate}%
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
