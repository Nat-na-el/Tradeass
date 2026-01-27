
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Toaster } from "react-hot-toast";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { useTheme } from "../Theme-provider";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

const seed = [];

export default function BacktestJournal() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState(loadEntries().length ? loadEntries() : seed);
  const [editing, setEditing] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
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

  const grouped = useMemo(() => {
    const g = {};
    derived.forEach((tr) => {
      const d = new Date(tr.date || new Date());
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
        borderColor: "#4B5EAA", // Deep Indigo
        backgroundColor: "#4B5EAA33", // Indigo with transparency
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

  const save = () => {
    const newEntry = {
      ...form,
      id: editing || `loc-${Date.now()}`,
    };
    if (editing) {
      setEntries(entries.map((e) => (e.id === editing ? newEntry : e)));
    } else {
      setEntries([...entries, newEntry]);
    }
    setShowAddDialog(false);
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
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-100",
        theme === "dark" ? "dark" : ""
      )}
    >
      <Toaster />
      <div className="flex flex-1 overflow-hidden pt-20">
        <main className="flex-1 overflow-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 shadow-lg">
              <div className="text-sm text-gray-700 dark:text-gray-100">Net P&L</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ${netPnL.toFixed(2)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 shadow-lg">
              <div className="text-sm text-gray-700 dark:text-gray-100">Profit Factor</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {profitFactor.toFixed(2)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 shadow-lg">
              <div className="text-sm text-gray-700 dark:text-gray-100">R-Multiple</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {derived[derived.length - 1]?.rr?.toFixed(2) ?? "0"}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 shadow-lg">
              <div className="text-sm text-gray-700 dark:text-gray-100">Win %</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {winRate}%
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-4 bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 rounded-xl shadow-lg">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-gray-700 dark:text-gray-100">Calendar</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={equityPeriod === "daily" ? "default" : "outline"}
                      onClick={() => setEquityPeriod("daily")}
                      className="bg-gray-100 dark:bg-indigo-700 text-gray-700 dark:text-gray-100"
                    >
                      Daily
                    </Button>
                    <Button
                      variant={equityPeriod === "weekly" ? "default" : "outline"}
                      onClick={() => setEquityPeriod("weekly")}
                      className="bg-gray-100 dark:bg-indigo-700 text-gray-700 dark:text-gray-100"
                    >
                      Weekly
                    </Button>
                    <Button
                      variant={equityPeriod === "monthly" ? "default" : "outline"}
                      onClick={() => setEquityPeriod("monthly")}
                      className="bg-gray-100 dark:bg-indigo-700 text-gray-700 dark:text-gray-100"
                    >
                      Monthly
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-sm text-gray-700 dark:text-gray-100 font-semibold">
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-2 rounded-lg border border-gray-200 dark:border-gray-400/20",
                          i % 7 === 0
                            ? "text-red-600 dark:text-red-400"
                            : i % 7 === 6
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-100"
                        )}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="row-span-2">
              <Card className="p-4 h-[720px] bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-700 dark:text-gray-100">Equity Curve</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <Line data={equityChart} options={equityOptions} />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card className="p-4 h-[720px] bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 rounded-xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-700 dark:text-gray-100">Stats Panel</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-100">Win Rate</span>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{winRate}%</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-100">Total P&L</span>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${netPnL.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-100">Profit Factor</span>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{profitFactor.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-100">Expectancy</span>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${expectancy.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-100">Trades</span>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{derived.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-100">Zella Score</span>
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{round2(0)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:col-span-1">
            <Card className="p-4 bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-700 dark:text-gray-100">Trade Expectancy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${expectancy.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="p-4 bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-700 dark:text-gray-100">Account Balance & P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${derived[derived.length - 1]?.balance?.toFixed(2) ?? startingBalance}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-100">
                  P&L: ${netPnL.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="p-4 bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-700 dark:text-gray-100">Zella Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-indigo-600 dark:text-indigo-400">{round2(0)}</div>
                <div className="flex justify-between text-xs mt-2 text-gray-700 dark:text-gray-100">
                  <span>Win %</span>
                  <span>Avg win/loss</span>
                  <span>Profit factor</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-white dark:bg-indigo-600 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-400/20 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-700 dark:text-gray-100">{editing ? "Edit" : "Add"} Trade</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-100">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-100">Pair</Label>
                <Input
                  value={form.pair}
                  onChange={(e) =>
                    setForm({ ...form, pair: e.target.value.toUpperCase() })
                  }
                  className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-100">Direction</Label>
                <Select
                  value={form.direction}
                  onValueChange={(v) => setForm({ ...form, direction: v })}
                >
                  <SelectTrigger className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20">
                    <SelectItem value="Long">Long</SelectItem>
                    <SelectItem value="Short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-100">Size</Label>
                <Input
                  type="number"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-100">Entry</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.entry}
                  onChange={(e) => setForm({ ...form, entry: e.target.value })}
                  className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-100">Stop</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.stop}
                  onChange={(e) => setForm({ ...form, stop: e.target.value })}
                  className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-100">TP</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.tp}
                  onChange={(e) => setForm({ ...form, tp: e.target.value })}
                  className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-100">Exit</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.exit}
                  onChange={(e) => setForm({ ...form, exit: e.target.value })}
                  className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-100">Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-white dark:bg-indigo-600 border border-gray-200 dark:border-gray-400/20"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border border-gray-200 dark:border-gray-400/20 text-gray-700 dark:text-gray-100 bg-white dark:bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 dark:bg-indigo-400 text-white"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}