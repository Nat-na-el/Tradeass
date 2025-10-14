// src/pages/Trades.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const filterDate = searchParams.get("date") || null;

  useEffect(() => {
    let cancelled = false;

    async function loadTrades() {
      try {
        const res = await fetch("http://localhost:4001/api/trades");
        if (!res.ok) throw new Error("Backend unreachable");
        const data = await res.json();

        if (!cancelled) {
          setTrades(data);
          localStorage.setItem("dj_trades", JSON.stringify(data));
          setLoading(false);
        }
      } catch (err) {
        console.warn("⚠️ Using localStorage fallback:", err);
        const local = JSON.parse(localStorage.getItem("dj_trades") || "[]");
        if (!cancelled) {
          setTrades(local);
          setLoading(false);
        }
      }
    }

    loadTrades();

    // optional auto-sync every 30s
    const interval = setInterval(loadTrades, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const grouped = useMemo(() => {
    return trades.reduce((acc, trade) => {
      const d =
        trade.date?.slice(0, 10) || new Date().toISOString().slice(0, 10);
      if (!acc[d]) acc[d] = [];
      acc[d].push(trade);
      return acc;
    }, {});
  }, [trades]);

  const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
  const shownDates = filterDate ? [filterDate] : dates;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Trades Journal
      </h2>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <>
          <div className="space-y-6">
            {shownDates.length === 0 ? (
              <div className="p-6 border rounded-md bg-white/80 dark:bg-[#0f1724]">
                No trades yet.
              </div>
            ) : (
              shownDates.map((date) => {
                const dayTrades = grouped[date] || [];
                const profit = dayTrades
                  .reduce((a, b) => a + Number(b.pnl || 0), 0)
                  .toFixed(2);
                const winRate = Math.round(
                  (dayTrades.filter((t) => Number(t.pnl || 0) > 0).length /
                    (dayTrades.length || 1)) *
                    100
                );
                return (
                  <div
                    key={date}
                    className="border rounded-lg p-4 bg-white/90 dark:bg-[#0f1724]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {date}
                        </div>
                        <div className="text-lg font-semibold">
                          {dayTrades.length} trades • {winRate}% WR • ${profit}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dayTrades.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 rounded-md border border-slate-200 dark:border-white/10 flex justify-between items-start bg-white dark:bg-[#071018]"
                        >
                          <div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {t.pair} • {t.direction}
                            </div>
                            <div className="font-semibold">
                              Entry: {t.entry} → Exit: {t.exit ?? "—"}
                            </div>
                            <div className="text-sm mt-1">
                              Risk: ${t.risk ?? "—"} • Reward: $
                              {t.reward ?? "—"} • R:R {t.rr ?? "—"}
                            </div>
                            {t.notes && (
                              <div className="flex gap-2 flex-wrap mt-2">
                                {t.notes.split(",").map((n, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs"
                                  >
                                    {n.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div
                            className={`font-bold ${
                              t.pnl >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {t.pnl >= 0
                              ? `+$${Number(t.pnl).toFixed(2)}`
                              : `-$${Math.abs(Number(t.pnl)).toFixed(2)}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
