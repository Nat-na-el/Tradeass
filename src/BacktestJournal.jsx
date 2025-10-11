import React, { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import ChartJS from "chart.js/auto";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { useTheme } from "./components/ui/theme-provider";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./components/ui/select";
import { Label } from "./components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/ui/dialog";
import { Separator } from "./components/ui/separator";
import { Progress } from "./components/ui/progress";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Sun, Moon } from "lucide-react";
import { cn } from "./lib/utils";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

// Common forex pairs
const commonPairs = [
  "EURUSD",
  "USDJPY",
  "GBPUSD",
  "USDCHF",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "EURGBP",
  "EURJPY",
  "GBPJPY",
  "AUDJPY",
  "CHFJPY",
  "EURCAD",
  "EURAUD",
  "GBPCAD",
  "GBPAUD",
  "CADJPY",
  "NZDJPY",
  "AUDCAD",
  "AUDCHF",
  "CADCHF",
  "EURCHF",
  "GBPCHF",
  "NZDCAD",
  "NZDCHF",
];

// Utility functions
function uid(prefix = "e") {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

function parseNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function calculateProfitFactor(trades) {
  const grossProfit = trades
    .filter((t) => t.pl > 0)
    .reduce((sum, t) => sum + t.pl, 0);
  const grossLoss = Math.abs(
    trades.filter((t) => t.pl < 0).reduce((sum, t) => sum + t.pl, 0)
  );
  return grossLoss === 0 ? Infinity : round2(grossProfit / grossLoss);
}

function calculateExpectancy(trades) {
  if (!trades.length) return 0;
  const avgWin =
    trades.filter((t) => t.pl > 0).reduce((sum, t) => sum + t.pl, 0) /
      trades.filter((t) => t.pl > 0).length || 0;
  const avgLoss = Math.abs(
    trades.filter((t) => t.pl < 0).reduce((sum, t) => sum + t.pl, 0) /
      trades.filter((t) => t.pl < 0).length || 0
  );
  const winRate = trades.filter((t) => t.pl > 0).length / trades.length || 0;
  return round2(avgWin * winRate - avgLoss * (1 - winRate));
}

function calculateAvgWinLoss(trades) {
  const avgWin =
    trades.filter((t) => t.pl > 0).reduce((sum, t) => sum + t.pl, 0) /
      trades.filter((t) => t.pl > 0).length || 0;
  const avgLoss = Math.abs(
    trades.filter((t) => t.pl < 0).reduce((sum, t) => sum + t.pl, 0) /
      trades.filter((t) => t.pl < 0).length || 0
  );
  return avgLoss === 0 ? Infinity : round2(avgWin / avgLoss);
}

function calculateZellaScore(winRate, avgWinLoss, profitFactor) {
  return round2(winRate * 0.4 + avgWinLoss * 0.3 + profitFactor * 0.3);
}

function groupTradesByDate(trades, period) {
  const grouped = {};
  trades.forEach((trade) => {
    const date = new Date(trade.date);
    let key =
      period === "daily"
        ? format(date, "yyyy-MM-dd")
        : period === "weekly"
        ? format(
            new Date(date.setDate(date.getDate() - date.getDay())),
            "yyyy-MM-dd"
          )
        : format(date, "yyyy-MM");
    if (!grouped[key]) grouped[key] = { pl: 0, trades: 0 };
    grouped[key].pl += trade.pl;
    grouped[key].trades += 1;
  });
  return grouped;
}

// Local storage helpers
const STORAGE_KEY = "shadcn_bt_v1";
function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}
function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error(e);
  }
}

// Seed data
const seed = [
  {
    id: uid("s"),
    date: "2025-09-01",
    pair: "EURUSD",
    direction: "Long",
    entry: "1.0800",
    stop: "1.0750",
    tp: "1.0900",
    exit: "1.0900",
    size: "10000",
    notes: "Mean reversion entry around support.",
  },
  {
    id: uid("s"),
    date: "2025-08-14",
    pair: "GBPUSD",
    direction: "Short",
    entry: "1.2700",
    stop: "1.2750",
    tp: "1.2550",
    exit: "1.2550",
    size: "5000",
    notes: "Breakout failure - trend continuation.",
  },
];

// Main Component
export default function BacktestJournal() {
  const [entries, setEntries] = useState(() =>
    loadEntries().length ? loadEntries() : seed
  );
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [startingBalance, setStartingBalance] = useState(() =>
    Number(localStorage.getItem("bt_start_balance") || 10000)
  );
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState({
    id: null,
    date: new Date().toISOString().slice(0, 10),
    pair: "",
    direction: "Long",
    entry: "",
    stop: "",
    tp: "",
    exit: "",
    size: "",
    notes: "",
  });
  const [equityPeriod, setEquityPeriod] = useState("daily");

  useEffect(() => saveEntries(entries), [entries]);
  useEffect(
    () => localStorage.setItem("bt_start_balance", startingBalance),
    [startingBalance]
  );

  const suggestedPairs = useMemo(
    () =>
      form.pair
        ? commonPairs.filter((p) => p.startsWith(form.pair.toUpperCase()))
        : [],
    [form.pair]
  );

  function calcTrade(trade) {
    const entry = parseNum(trade.entry),
      stop = parseNum(trade.stop),
      tp = parseNum(trade.tp),
      exit = parseNum(trade.exit || tp),
      size = parseNum(trade.size);
    let rr =
      entry && stop && tp && entry !== stop
        ? trade.direction.toLowerCase() === "long"
          ? (tp - entry) / (entry - stop)
          : (entry - tp) / (stop - entry)
        : 0;
    let pl =
      trade.direction.toLowerCase() === "long"
        ? (exit - entry) * size
        : (entry - exit) * size;
    return {
      ...trade,
      rr: round2(rr),
      pl: round2(pl),
      result: pl > 0 ? "Win" : pl < 0 ? "Loss" : "BreakEven",
    };
  }

  const derived = useMemo(() => {
    const t = entries.map(calcTrade);
    let totalRR = 0;
    const result = []; // temporary array to store mapped entries

    t.forEach((tr, i) => {
      if (i === 0)
        totalRR =
          tr.result === "Win"
            ? tr.rr
            : tr.result === "Loss"
            ? -1 / (tr.rr || 1)
            : 0;
      else
        totalRR +=
          tr.result === "Win"
            ? tr.rr
            : tr.result === "Loss"
            ? -1 / (tr.rr || 1)
            : 0;

      const avgRR = i + 1 > 0 ? totalRR / (i + 1) : 0;
      const previousBalance = i === 0 ? startingBalance : result[i - 1].balance;

      result.push({
        ...tr,
        totalRR: round2(totalRR),
        avgRR: round2(avgRR),
        balance: Number((previousBalance + tr.pl).toFixed(6)),
      });
    });

    return result;
  }, [entries, startingBalance]);

  const wins = derived.filter((t) => t.result === "Win").length;
  const losses = derived.filter((t) => t.result === "Loss").length;
  const winRate = derived.length ? round2((wins / derived.length) * 100) : 0;
  const finalBalance = derived.length
    ? derived[derived.length - 1].balance
    : startingBalance;
  const totalPnL = round2(finalBalance - startingBalance);
  const profitFactor = calculateProfitFactor(derived);
  const expectancy = calculateExpectancy(derived);
  const avgWinLoss = calculateAvgWinLoss(derived);
  const zellaScore = calculateZellaScore(
    winRate / 100,
    avgWinLoss,
    profitFactor
  );
  const groupedTrades = groupTradesByDate(derived, equityPeriod);

  const chartLabels = useMemo(
    () => Object.keys(groupedTrades),
    [groupedTrades]
  );
  const chartDataPoints = useMemo(
    () => chartLabels.map((key) => groupedTrades[key].pl),
    [groupedTrades]
  );

  const equityData = {
    labels: chartLabels,
    datasets: [
      {
        label: "P&L",
        data: chartDataPoints,
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderColor: "rgba(16,185,129,1)", // Vibrant green
        backgroundColor:
          "linear-gradient(180deg, rgba(16,185,129,0.12), rgba(6,95,70,0.02))",
      },
    ],
  };
  const equityOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
      title: {
        display: true,
        text: `Equity Curve (${
          equityPeriod.charAt(0).toUpperCase() + equityPeriod.slice(1)
        })`,
      },
    },
    scales: { y: { beginAtZero: false } },
  };
  const zellaTriangleData = {
    labels: ["Win %", "Avg win/loss", "Profit factor"],
    datasets: [
      {
        data: [winRate / 100, avgWinLoss, profitFactor],
        backgroundColor: "rgba(139, 92, 246, 0.2)", // Rich purple
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
      },
    ],
  };
  const zellaTriangleOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Zella Score" },
    },
  };

  function openNew() {
    setEditing(null);
    setForm({
      id: null,
      date: new Date().toISOString().slice(0, 10),
      pair: "",
      direction: "Long",
      entry: "",
      stop: "",
      tp: "",
      exit: "",
      size: "",
      notes: "",
    });
    setShowDialog(true);
  }

  function openEdit(entry) {
    setEditing(entry.id);
    setForm({ ...entry });
    setShowDialog(true);
  }

  function saveForm(e) {
    e.preventDefault();
    const entryN = parseNum(form.entry),
      stopN = parseNum(form.stop),
      tpN = parseNum(form.tp),
      sizeN = parseNum(form.size);
    if (!form.pair) return alert("Please enter a pair");
    if (entryN <= 0 || stopN <= 0 || tpN <= 0 || sizeN <= 0)
      return alert("Numeric fields must be > 0");
    if (entryN === stopN) return alert("Entry and stop cannot be same");
    const payload = {
      ...form,
      id: form.id || uid(),
      entry: String(form.entry),
      stop: String(form.stop),
      tp: String(form.tp),
      exit: String(form.exit || form.tp),
      size: String(form.size),
    };
    setEntries((prev) => prev.map((p) => (p.id === editing ? payload : p)));
    if (!editing) setEntries((prev) => [payload, ...prev]);
    alert(editing ? "Entry updated" : "Entry added");
    setShowDialog(false);
  }

  function removeEntry(id) {
    if (window.confirm("Delete this entry?")) {
      setEntries((prev) => prev.filter((p) => p.id !== id));
      alert("Entry removed");
    }
  }

  function clearAll() {
    if (window.confirm("Clear all entries?")) {
      setEntries([]);
      alert("All entries cleared");
    }
  }

  function exportTSV() {
    const headers = [
      "Date",
      "Pair",
      "Direction",
      "Entry",
      "Stop",
      "TP",
      "Exit",
      "Size",
      "Result",
      "RR",
      "P/L",
      "Balance",
      "Notes",
      "TotalRR",
      "AvgRR",
    ];
    const rows = derived.map((r) => [
      r.date,
      r.pair,
      r.direction,
      r.entry,
      r.stop,
      r.tp,
      r.exit,
      r.size,
      r.result,
      r.rr,
      r.pl,
      r.balance,
      r.notes,
      r.totalRR,
      r.avgRR,
    ]);
    const csv = [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backtest-journal.tsv";
    a.click();
    URL.revokeObjectURL(url);
    alert("Exported TSV");
  }

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col",
        theme === "dark" ? "dark" : ""
      )}
    >
      <header className="w-full p-4 bg-gray-800 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">TradeZella</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </header>
      <div className="flex flex-1">
        <aside
          className={cn(
            "p-4 bg-indigo-950 text-white transition-all duration-300",
            sidebarOpen ? "w-64" : "w-20"
          )}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              {sidebarOpen && <span className="font-bold">Menu</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "<" : ">"}
            </Button>
          </div>
          <nav className="space-y-1">
            {["Dashboard", "Daily Journal", "Trades"].map((label) => (
              <Button
                key={label}
                variant={activeTab === label ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start bg-primary hover:bg-primary/90",
                  !sidebarOpen && "justify-center"
                )}
                onClick={() => setActiveTab(label)}
              >
                {sidebarOpen && label}
              </Button>
            ))}
          </nav>
          <Separator className="my-4" />
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>TQ</AvatarFallback>
            </Avatar>
            {sidebarOpen && <span>Trading Queen</span>}
          </div>
        </aside>
        <main className="flex-1 p-6 bg-gray-900 dark:bg-gray-900 overflow-auto text-white">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{activeTab}</h1>
            <div className="flex gap-2">
              <Button
                onClick={openNew}
                className="bg-primary hover:bg-primary/90"
              >
                Add Trade
              </Button>
              <Button
                onClick={clearAll}
                className="bg-destructive hover:bg-destructive/90"
              >
                Clear All
              </Button>
              <Button
                onClick={exportTSV}
                className="bg-blue-600 hover:bg-blue-500"
              >
                Export TSV
              </Button>
            </div>
          </header>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 bg-gray-800">
              <TabsTrigger value="Dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="Daily Journal">Daily Journal</TabsTrigger>
              <TabsTrigger value="Trades">Trades</TabsTrigger>
            </TabsList>
            <TabsContent value="Dashboard">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border">
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>Total P&L: ${totalPnL}</p>
                      <p>Win Rate: {winRate}%</p>
                      <p>Profit Factor: {profitFactor}</p>
                      <p>Expectancy: {expectancy}</p>
                      <p>Zella Score: {zellaScore}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border">
                  <CardHeader>
                    <CardTitle>Equity Curve</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={equityPeriod}
                      onValueChange={setEquityPeriod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="mt-4">
                      <Line data={equityData} options={equityOptions} />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border">
                  <CardHeader>
                    <CardTitle>Zella Score Triangle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Line
                      data={zellaTriangleData}
                      options={zellaTriangleOptions}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="Daily Journal">
              <Card className="border">
                <CardHeader>
                  <CardTitle>Trade Journal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Filter by pair..."
                    value={form.pair}
                    onChange={(e) => setForm({ ...form, pair: e.target.value })}
                    className="mb-4"
                  />
                  {suggestedPairs.length > 0 && (
                    <div className="mb-4">
                      {suggestedPairs.map((pair) => (
                        <Button
                          key={pair}
                          variant="ghost"
                          onClick={() => setForm({ ...form, pair })}
                        >
                          <Badge>{pair}</Badge>
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className="space-y-4">
                    {derived.map((trade) => (
                      <Card key={trade.id} className="border">
                        <CardContent className="pt-4">
                          <p>Date: {trade.date}</p>
                          <p>Pair: {trade.pair}</p>
                          <p>Direction: {trade.direction}</p>
                          <p>P&L: ${trade.pl}</p>
                          <p>Notes: {trade.notes}</p>
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              onClick={() => openEdit(trade)}
                              className="mr-2"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => removeEntry(trade.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="Trades">
              <Card className="border">
                <CardHeader>
                  <CardTitle>All Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {derived.map((trade) => (
                      <Card key={trade.id} className="border">
                        <CardContent className="pt-4">
                          <p>Date: {trade.date}</p>
                          <p>Pair: {trade.pair}</p>
                          <p>Direction: {trade.direction}</p>
                          <p>Entry: {trade.entry}</p>
                          <p>Stop: {trade.stop}</p>
                          <p>TP: {trade.tp}</p>
                          <p>Exit: {trade.exit}</p>
                          <p>Size: {trade.size}</p>
                          <p>Result: {trade.result}</p>
                          <p>R:R: {trade.rr}</p>
                          <p>P&L: ${trade.pl}</p>
                          <p>Balance: ${trade.balance}</p>
                          <p>Notes: {trade.notes}</p>
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              onClick={() => openEdit(trade)}
                              className="mr-2"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => removeEntry(trade.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="border">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Trade" : "Add Trade"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveForm} className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Pair</Label>
              <Input
                value={form.pair}
                onChange={(e) => setForm({ ...form, pair: e.target.value })}
                placeholder="e.g., EURUSD"
              />
              {suggestedPairs.length > 0 && (
                <div className="mt-2">
                  {suggestedPairs.map((pair) => (
                    <Button
                      key={pair}
                      variant="ghost"
                      onClick={() => setForm({ ...form, pair })}
                    >
                      <Badge>{pair}</Badge>
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Direction</Label>
              <Select
                value={form.direction}
                onValueChange={(value) => {
                  console.log("Selected direction:", value);
                  setForm({ ...form, direction: value });
                }}
              >
                <SelectTrigger className="text-white">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Long">Long</SelectItem>
                  <SelectItem value="Short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Entry</Label>
              <Input
                type="number"
                value={form.entry}
                onChange={(e) => setForm({ ...form, entry: e.target.value })}
                placeholder="e.g., 1.0800"
              />
            </div>
            <div>
              <Label>Stop Loss</Label>
              <Input
                type="number"
                value={form.stop}
                onChange={(e) => setForm({ ...form, stop: e.target.value })}
                placeholder="e.g., 1.0750"
              />
            </div>
            <div>
              <Label>Take Profit</Label>
              <Input
                type="number"
                value={form.tp}
                onChange={(e) => setForm({ ...form, tp: e.target.value })}
                placeholder="e.g., 1.0900"
              />
            </div>
            <div>
              <Label>Exit</Label>
              <Input
                type="number"
                value={form.exit}
                onChange={(e) => setForm({ ...form, exit: e.target.value })}
                placeholder="e.g., 1.0900"
              />
            </div>
            <div>
              <Label>Size</Label>
              <Input
                type="number"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder="e.g., 10000"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Enter trade notes"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
