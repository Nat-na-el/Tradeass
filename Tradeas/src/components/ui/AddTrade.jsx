import React, { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, X } from "lucide-react";

const API_BASE = "/api/trades";

const forexPairs = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "AUDUSD",
  "USDCAD",
  "USDCHF",
  "NZDUSD",
  "XAUUSD",
  "XAGUSD",
  "NAS100",
  "SPX500",
  "BTCUSD",
  "ETHUSD",
];

export default function AddTrade({ onSaved }) {
  const [open, setOpen] = useState(false);
  const [showDir, setShowDir] = useState(false);
  const [pairSuggestions, setPairSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({
    date: "",
    pair: "",
    direction: "",
    entry: "",
    stopLoss: "",
    takeProfit: "",
    positionSize: "",
    leverage: "",
    exit: "",
    notesInput: "",
  });

  const [calc, setCalc] = useState({
    risk: 0,
    reward: 0,
    rr: 0,
    pnl: 0,
  });

  const [tags, setTags] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "pair") {
      if (value.length > 0) {
        const matches = forexPairs.filter((p) =>
          p.toLowerCase().includes(value.toLowerCase())
        );
        setPairSuggestions(matches);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  };

  const addTag = () => {
    const newTag = form.notesInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setForm((f) => ({ ...f, notesInput: "" }));
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleNoteKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // 🧮 Auto calculations
  useEffect(() => {
    const entry = parseFloat(form.entry);
    const stop = parseFloat(form.stopLoss);
    const tp = parseFloat(form.takeProfit);
    const size = parseFloat(form.positionSize);
    const leverage = parseFloat(form.leverage) || 1;
    const exit = parseFloat(form.exit);
    if (!entry || !stop || !tp || !size) return;

    const direction = form.direction || "Long";
    const riskPerUnit = direction === "Long" ? entry - stop : stop - entry;
    const rewardPerUnit = direction === "Long" ? tp - entry : entry - tp;

    const risk = riskPerUnit * size * leverage;
    const reward = rewardPerUnit * size * leverage;
    const rr = risk !== 0 ? (reward / Math.abs(risk)).toFixed(2) : 0;

    let pnl = 0;
    if (exit) {
      const pnlPerUnit = direction === "Long" ? exit - entry : entry - exit;
      pnl = (pnlPerUnit * size * leverage).toFixed(2);
    }

    setCalc({
      risk: risk.toFixed(2),
      reward: reward.toFixed(2),
      rr,
      pnl,
    });
  }, [
    form.entry,
    form.stopLoss,
    form.takeProfit,
    form.exit,
    form.positionSize,
    form.leverage,
    form.direction,
  ]);

  async function saveTrade() {
    const today = new Date().toISOString().slice(0, 10);
    const tradeData = {
      ...form,
      date: form.date || today,
      notes: tags.join(", "),
      ...calc,
    };

    try {
      const res = await fetch("http://localhost:4001/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
      });
      const saved = await res.json();

      // ✅ keep backend + localStorage in sync
      const local = JSON.parse(localStorage.getItem("dj_trades") || "[]");
      local.unshift(saved);
      localStorage.setItem("dj_trades", JSON.stringify(local));

      if (onSaved) onSaved(saved);
      setOpen(false);
    } catch (err) {
      console.warn("Backend unavailable:", err);
      const local = JSON.parse(localStorage.getItem("dj_trades") || "[]");
      const newTrade = { id: Date.now(), ...tradeData };
      local.unshift(newTrade);
      localStorage.setItem("dj_trades", JSON.stringify(local));
      if (onSaved) onSaved(newTrade);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ✅ Add Trade button (always visible) */}
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 px-4 py-2 rounded-md shadow-md border border-emerald-700 transition-all">
          + Add Trade
        </Button>
      </DialogTrigger>

      {/* ✅ Modal (white for day, dark for night) */}
      <DialogContent className="max-w-2xl bg-white text-slate-900 dark:bg-[#0f1724] dark:text-white border border-slate-300 dark:border-white/10 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Add Trade</h2>

        {/* 💰 Net PnL */}
        <div className="border-t pt-4 mt-2 mb-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Net P&L
          </div>
          <div
            className={`text-2xl font-bold ${
              calc.pnl < 0
                ? "text-red-500"
                : calc.pnl > 0
                ? "text-green-500"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {calc.pnl
              ? calc.pnl >= 0
                ? `+$${calc.pnl}`
                : `-$${Math.abs(calc.pnl)}`
              : "$0.00"}
          </div>
        </div>

        {/* 📅 Date + Pair */}
        <div className="grid grid-cols-2 gap-4 relative">
          <div>
            <Label>Date</Label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-slate-300 dark:border-white/10
              bg-white text-slate-900 dark:bg-[#1a2135] dark:text-white
              focus:ring-2 focus:ring-emerald-500 focus:outline-none
              [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          <div className="relative">
            <Label>Pair</Label>
            <Input
              name="pair"
              placeholder="e.g. EURUSD"
              value={form.pair}
              onChange={handleChange}
              onFocus={() => form.pair && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="bg-white text-slate-900 dark:bg-[#1a2135] dark:text-white border border-slate-300 dark:border-white/10"
            />
            {showSuggestions && pairSuggestions.length > 0 && (
              <div className="absolute z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg w-full mt-1 max-h-40 overflow-y-auto">
                {pairSuggestions.map((p) => (
                  <div
                    key={p}
                    onClick={() => {
                      setForm((f) => ({ ...f, pair: p }));
                      setShowSuggestions(false);
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🔽 Direction dropdown */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <Label>Direction</Label>
            <button
              type="button"
              onClick={() => setShowDir((v) => !v)}
              className="w-full flex justify-between items-center px-3 py-2 mt-1 h-[40px] rounded-md border border-slate-300 dark:border-white/10 
      bg-white text-slate-900 dark:bg-[#1a2135] dark:text-white shadow-sm hover:shadow-md transition text-sm"
            >
              {form.direction || "Select Direction"}
              <ChevronDown className="w-4 h-4 opacity-60" />
            </button>

            {showDir && (
              <div className="absolute z-50 bg-white/95 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg w-full mt-1 animate-fade-in">
                <div
                  onClick={() => {
                    setForm((f) => ({ ...f, direction: "Long" }));
                    setShowDir(false);
                  }}
                  className="px-3 py-2 text-sm cursor-pointer text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/40 transition"
                >
                  🟩 Long
                </div>
                <div
                  onClick={() => {
                    setForm((f) => ({ ...f, direction: "Short" }));
                    setShowDir(false);
                  }}
                  className="px-3 py-2 text-sm cursor-pointer text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/40 transition"
                >
                  🟥 Short
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Position Size</Label>
            <Input
              name="positionSize"
              placeholder="30"
              value={form.positionSize}
              onChange={handleChange}
              className="h-[40px]"
            />
          </div>
          <div>
            <Label>Leverage</Label>
            <Input
              name="leverage"
              placeholder="10"
              value={form.leverage}
              onChange={handleChange}
              className="h-[40px]"
            />
          </div>
        </div>

        {/* 📈 Entry / SL / TP */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { name: "entry", label: "Entry", placeholder: "1.0800" },
            { name: "stopLoss", label: "Stop Loss", placeholder: "1.0750" },
            { name: "takeProfit", label: "Take Profit", placeholder: "1.0900" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <Label>{label}</Label>
              <Input
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        {/* 📊 Auto Calculations */}
        <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-4">
          <div>
            <Label>Risk</Label>
            <div className="text-red-500 font-semibold">${calc.risk}</div>
          </div>
          <div>
            <Label>Reward</Label>
            <div className="text-green-500 font-semibold">${calc.reward}</div>
          </div>
          <div>
            <Label>R:R</Label>
            <div className="text-blue-500 font-semibold">{calc.rr}</div>
          </div>
        </div>

        {/* 📝 Exit + Confluences */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Exit (optional)</Label>
            <Input
              name="exit"
              placeholder="1.0850"
              value={form.exit}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Confluences</Label>
            <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10">
              {tags.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md text-xs font-medium"
                >
                  {t}
                  <X
                    size={12}
                    className="cursor-pointer"
                    onClick={() => removeTag(t)}
                  />
                </div>
              ))}
              <input
                type="text"
                name="notesInput"
                value={form.notesInput}
                onChange={handleChange}
                onKeyDown={handleNoteKeyDown}
                placeholder="Type and press comma..."
                className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* ✅ Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border border-slate-400 dark:border-white/20 text-slate-900 dark:text-white bg-white dark:bg-transparent"
          >
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
            onClick={saveTrade}
          >
            Save Trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
