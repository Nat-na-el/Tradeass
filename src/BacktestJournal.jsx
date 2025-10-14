// ✅ All imports go here, nothing else above them
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/ui/dialog";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Separator } from "./components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./components/ui/popover";
import { cn } from "./lib/utils";
import React, { useState, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import { Toaster } from "react-hot-toast";
import { Settings } from "lucide-react";
import { Sun, Moon } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ✅ Your local imports after libraries

/* ------------------------------------------------------------------ */
/* ---------------------------- UTILITIES --------------------------- */
/* ------------------------------------------------------------------ */
const parseNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const STORAGE_KEY = "btjournal_entries";
const loadEntries = () => {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
};
const saveEntries = (e) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
  } catch {
    console.error("save error");
  }
};

const seed = [
  /* …your seed data… */
];

/* ------------------------------------------------------------------ */
/* ---------------------------- COMPONENT --------------------------- */
/* ------------------------------------------------------------------ */
export default function BacktestJournal() {
  /* -------------------------- STATE -------------------------- */
  const [entries, setEntries] = useState(
    loadEntries().length ? loadEntries() : seed
  );
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [themeDark, setThemeDark] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const zellaScore = 0;
  const save = () => {};
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
  const [startingBalance] = useState(32032.5);
  const [equityPeriod, setEquityPeriod] = useState("daily");

  useEffect(() => saveEntries(entries), [entries]);

  /* -------------------------- CALCS -------------------------- */
  const calcTrade = (t) => {
    const e = parseNum(t.entry),
      s = parseNum(t.stop),
      tp = parseNum(t.tp),
      ex = parseNum(t.exit || tp),
      sz = parseNum(t.size);
    const rr =
      e && s && tp && e !== s
        ? t.direction.toLowerCase() === "long"
          ? (tp - e) / (e - s)
          : (e - tp) / (s - e)
        : 0;
    const pl =
      t.direction.toLowerCase() === "long" ? (ex - e) * sz : (e - ex) * sz;
    return {
      ...t,
      rr: round2(rr),
      pl: round2(pl),
      result: pl > 0 ? "Win" : pl < 0 ? "Loss" : "BE",
    };
  };

  const derived = useMemo(() => {
    const t = entries.map(calcTrade);
    let bal = startingBalance;
    return t.map((tr) => {
      bal = round2(bal + tr.pl);
      return { ...tr, balance: bal };
    });
  }, [entries, startingBalance]);

  const wins = derived.filter((t) => t.result === "Win").length;
  const winRate = derived.length ? round2((wins / derived.length) * 100) : 0;
  const netPnL = round2(
    derived[derived.length - 1]?.balance - startingBalance || 0
  );
  const profitFactor = round2(
    (derived.filter((t) => t.pl > 0).reduce((a, b) => a + b.pl, 0) || 0) /
      (Math.abs(
        derived.filter((t) => t.pl < 0).reduce((a, b) => a + b.pl, 0)
      ) || 1)
  );
  const expectancy = round2(netPnL / derived.length || 0);

  /* -------------------------- CHART DATA -------------------------- */
  const grouped = useMemo(() => {
    const g = {};
    derived.forEach((tr) => {
      const d = new Date(tr.date);
      const key =
        equityPeriod === "daily"
          ? format(d, "yyyy-MM-dd")
          : equityPeriod === "weekly"
          ? format(new Date(d.setDate(d.getDate() - d.getDay())), "yyyy-MM-dd")
          : format(d, "yyyy-MM");
      if (!g[key]) g[key] = 0;
      g[key] = round2(g[key] + tr.pl);
    });
    return g;
  }, [derived, equityPeriod]);

  const equityLabels = Object.keys(grouped);
  const equityDataset = Object.values(grouped);

  const equityChart = {
    labels: equityLabels,
    datasets: [
      {
        label: "Equity",
        data: equityDataset,
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const equityOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: false } },
  };

  /* -------------------------- HANDLERS -------------------------- */
  // Handler functions should be properly declared here if needed

  /* ---------------------------------------------------------------- */
  /* ---------------------------- UI -------------------------------- */
  /* ---------------------------------------------------------------- */
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-gray-950 text-gray-100",
        themeDark ? "dark" : ""
      )}
    >
      <Toaster />
      {/* ---------- HEADER ---------- */}

      <div className="flex flex-1 overflow-hidden">
        {/* ---------- SIDEBAR ---------- */}

        {/* ---------- MAIN CONTENT ---------- */}
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="kpi-card">
              <div className="kpi-title">Net P&L</div>
              <div className="kpi-value text-green-400">
                ${netPnL.toFixed(2)}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Profit Factor</div>
              <div className="kpi-value">{profitFactor.toFixed(2)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">R-Multiple</div>
              <div className="kpi-value">
                {derived[derived.length - 1]?.rr?.toFixed(2) ?? "0"}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Win %</div>
              <div className="kpi-value">{winRate}%</div>
            </div>
          </div>

          {/* Calendar + Equity + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card className="calendar-wrapper">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Calendar</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={equityPeriod === "daily" ? "default" : "outline"}
                      onClick={() => setEquityPeriod("daily")}
                    >
                      Daily
                    </Button>
                    <Button
                      variant={
                        equityPeriod === "weekly" ? "default" : "outline"
                      }
                      onClick={() => setEquityPeriod("weekly")}
                    >
                      Weekly
                    </Button>
                    <Button
                      variant={
                        equityPeriod === "monthly" ? "default" : "outline"
                      }
                      onClick={() => setEquityPeriod("monthly")}
                    >
                      Monthly
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Simple calendar UI – replace with @shadcn/ui calendar if you added it */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (d) => (
                        <div key={d} className="font-semibold text-gray-400">
                          {d}
                        </div>
                      )
                    )}
                    {/* Example days */}
                    {Array.from({ length: 35 }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-2 rounded",
                          i % 7 === 0
                            ? "text-red-400"
                            : i % 7 === 6
                            ? "text-blue-400"
                            : ""
                        )}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Equity Curve */}
            <div className="row-span-2">
              <Card className="chart-wrapper h-full">
                <CardHeader>
                  <CardTitle>Equity Curve</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <Line data={equityChart} options={equityOptions} />
                </CardContent>
              </Card>
            </div>

            {/* Stats panel */}
            <div className="lg:col-span-2">
              <Card className="widget">
                <CardHeader>
                  <CardTitle>Stats Panel</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="kpi-title">Win Rate</span>
                    <div className="kpi-value">{winRate}%</div>
                  </div>
                  <div>
                    <span className="kpi-title">Total P&L</span>
                    <div className="kpi-value">${netPnL.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="kpi-title">Profit Factor</span>
                    <div className="kpi-value">{profitFactor.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="kpi-title">Expectancy</span>
                    <div className="kpi-value">${expectancy.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="kpi-title">Trades</span>
                    <div className="kpi-value">{derived.length}</div>
                  </div>
                  <div>
                    <span className="kpi-title">Zella Score</span>
                    <div className="kpi-value">{round2(zellaScore)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right-hand widget column */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-1">
            <Card className="widget">
              <CardHeader>
                <CardTitle>Trade Expectancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="widget-value">${expectancy.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="widget">
              <CardHeader>
                <CardTitle>Account Balance & P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="widget-value">
                  $
                  {derived[derived.length - 1]?.balance?.toFixed(2) ??
                    startingBalance}
                </div>
                <div className="text-sm text-gray-400">
                  P&L: ${netPnL.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="widget">
              <CardHeader>
                <CardTitle>Zella Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold">{round2(zellaScore)}</div>
                <div className="flex justify-between text-xs mt-2">
                  <span>Win %</span>
                  <span>Avg win/loss</span>
                  <span>Profit factor</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* ---------- ADD / EDIT DIALOG ---------- */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Trade</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  onChange={(e) =>
                    setForm({ ...form, pair: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div>
                <Label>Direction</Label>
                <Select
                  value={form.direction}
                  onValueChange={(v) => setForm({ ...form, direction: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Long">Long</SelectItem>
                    <SelectItem value="Short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Size</Label>
                <Input
                  type="number"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                />
              </div>
              <div>
                <Label>Entry</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.entry}
                  onChange={(e) => setForm({ ...form, entry: e.target.value })}
                />
              </div>
              <div>
                <Label>Stop</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.stop}
                  onChange={(e) => setForm({ ...form, stop: e.target.value })}
                />
              </div>
              <div>
                <Label>TP</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.tp}
                  onChange={(e) => setForm({ ...form, tp: e.target.value })}
                />
              </div>
              <div>
                <Label>Exit</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.exit}
                  onChange={(e) => setForm({ ...form, exit: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
