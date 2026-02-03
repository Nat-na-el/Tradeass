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
} from "date-fns";
import { Card } from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../Theme-provider";

export default function Dashboard({ currentAccount }) {
  const { theme } = useTheme();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const navigate = useNavigate();

  // DATABASE FETCH + ACCOUNT FILTER (unchanged)
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
    if (!monthlyTrades.length)
      return {
        totalPnL: 0,
        winRate: 0,
        profitFactor: 0,
        expectancy: 0,
        winCount: 0,
        lossCount: 0,
        totalTrades: 0,
      };
    const profits = monthlyTrades
      .filter((t) => t.pnl > 0)
      .reduce((a, b) => a + Number(b.pnl), 0);
    const losses = monthlyTrades
      .filter((t) => t.pnl < 0)
      .reduce((a, b) => a + Math.abs(Number(b.pnl)), 0);
    const profitFactor = losses ? (profits / losses).toFixed(2) : "∞";
    const wins = monthlyTrades.filter((t) => t.pnl > 0).length;
    const total = monthlyTrades.length;
    const winRate = total ? ((wins / total) * 100).toFixed(1) : 0;
    const expectancy =
      monthlyTrades.reduce((a, b) => a + Number(b.pnl), 0) / total || 0;
    return {
      totalPnL: profits - losses,
      winRate,
      profitFactor,
      expectancy: expectancy.toFixed(2),
      winCount: wins,
      lossCount: total - wins,
      totalTrades: total,
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
    const rrAvg =
      list.reduce((s, t) => s + (Number(t.rr) || 0), 0) / count || 0;
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

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden p-3 sm:p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-100">
        Dashboard
      </h2>

      {/* Top stats – scrollable on very small screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto pb-2">
        {[
          {
            label: "Monthly PnL",
            value: `$${monthlyStats.totalPnL.toFixed(2)}`,
            color:
              monthlyStats.totalPnL >= 0
                ? "text-[#00CC00] dark:text-[#00CC00]"
                : "text-[#CC0000] dark:text-[#CC0000]",
          },
          {
            label: "Profit Factor",
            value: monthlyStats.profitFactor,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Win Rate",
            value: `${monthlyStats.winRate}%`,
            color:
              monthlyStats.totalTrades === 0 || monthlyStats.winRate >= 50
                ? "text-[#00CC00] dark:text-[#00CC00]"
                : "text-[#CC0000] dark:text-[#CC0000]",
          },
          {
            label: "Current Week Streak",
            value:
              currentStreak.count > 0
                ? `${currentStreak.type} ${currentStreak.count}`
                : "None",
            color:
              currentStreak.type === "Win"
                ? "text-[#00CC00] dark:text-[#00CC00]"
                : currentStreak.type === "Loss"
                ? "text-[#CC0000] dark:text-[#CC0000]"
                : "text-gray-600 dark:text-gray-400",
          },
          {
            label: "",
            value: "+",
            color: "text-blue-600 dark:text-blue-400",
            onClick: addQuantitativeAnalysis,
          },
        ].map((stat, i) => (
          <Card
            key={i}
            onClick={stat.onClick}
            className={`flex flex-col justify-center items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 sm:p-3 md:p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer min-w-[140px] sm:min-w-0 ${
              stat.onClick ? "hover:bg-blue-50 dark:hover:bg-blue-950/30" : ""
            }`}
          >
            {stat.label && (
              <div className="text-[10px] sm:text-xs mb-1 text-gray-600 dark:text-gray-400 text-center">
                {stat.label}
              </div>
            )}
            <div
              className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center ${stat.color}`}
            >
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Main content – stacks on mobile */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Calendar – takes full width on mobile, 75% on large screens */}
        <div className="w-full lg:w-[75%] order-1 lg:order-1">
          <Card className="p-3 sm:p-4 md:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden">
            {/* Header – more compact on mobile */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={prevMonth}
                  className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
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
                  className="px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex-1 sm:flex-none text-center min-h-[44px] touch-manipulation"
                >
                  {format(viewDate, "MMMM yyyy")}
                </button>

                <button
                  onClick={nextMonth}
                  className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                >
                  ▶
                </button>
              </div>

              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                Tap a day to view trades
              </span>
            </div>

            {/* Calendar – horizontal scroll on very small screens */}
            <div className="overflow-x-auto -mx-2 sm:-mx-0 pb-2">
              <div className="grid grid-cols-8 min-w-[640px] sm:min-w-full gap-1 sm:gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Weekly"].map((d) => (
                  <div
                    key={d}
                    className="text-[10px] sm:text-xs font-medium text-center text-gray-600 dark:text-gray-400 py-1 sm:py-2"
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
                        const isCur = dayObj.getMonth() === viewDate.getMonth();
                        return (
                          <div
                            key={di}
                            onClick={() => openDay(dayObj)}
                            className={`cursor-pointer aspect-square min-h-[50px] sm:min-h-[70px] rounded-lg p-1 sm:p-2 flex flex-col justify-between border transition-all touch-manipulation ${
                              isCur
                                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                : "bg-transparent border-dashed border-gray-300 dark:border-gray-600"
                            } hover:shadow-lg hover:border-blue-600 dark:hover:border-blue-400 active:scale-95`}
                          >
                            <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">
                              {format(dayObj, "d")}
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                              {ds ? (
                                <>
                                  <div
                                    className={`font-medium text-[9px] sm:text-sm ${
                                      ds.pnl >= 0
                                        ? "text-[#00CC00] dark:text-[#00CC00]"
                                        : "text-[#CC0000] dark:text-[#CC0000]"
                                    }`}
                                  >
                                    ${Math.abs(ds.pnl).toFixed(2)}
                                  </div>
                                  <div className="text-[8px] sm:text-xs text-gray-600 dark:text-gray-400 leading-tight">
                                    {ds.count}t • {ds.winRate}%
                                  </div>
                                </>
                              ) : (
                                <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">
                                  —
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Weekly summary */}
                      <div className="aspect-square min-h-[50px] sm:min-h-[70px] rounded-lg p-1 sm:p-2 flex flex-col justify-center items-center border bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <div className="text-[9px] sm:text-sm text-gray-600 dark:text-gray-400 mb-0.5 sm:mb-1">
                          W{wi + 1}
                        </div>
                        <div
                          className={`text-[11px] sm:text-base font-bold ${
                            wSum.pnl >= 0
                              ? "text-[#00CC00] dark:text-[#00CC00]"
                              : "text-[#CC0000] dark:text-[#CC0000]"
                          }`}
                        >
                          ${wSum.pnl.toFixed(2)}
                        </div>
                        <div className="text-[8px] sm:text-xs text-gray-600 dark:text-gray-400">
                          {wSum.count}t • {wSum.winRate}%
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Right sidebar – hidden on mobile, appears on lg+ */}
        <div className="hidden lg:block w-[25%] order-2 lg:order-2">
          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full flex flex-col gap-4 items-center justify-center rounded-xl shadow-md">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              v1.0 – {new Date().toLocaleDateString()}
            </div>
          </Card>
        </div>
      </div>

      {/* Extra bottom spacing – reduced */}
      <div className="mt-4 sm:mt-6" style={{ height: "10px" }}></div>
    </div>
  );
}
