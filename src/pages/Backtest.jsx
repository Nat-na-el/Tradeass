// src/pages/Backtest.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Settings, 
  BarChart3,
  LineChart,
  Table,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTheme } from '../Theme-provider';

// Chart.js setup
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ────────────────────────────────────────────────
// 1. Synthetic Data Generator (per symbol)
// ────────────────────────────────────────────────
const generateSymbolData = (symbol, days = 200) => {
  const data = [];
  let price = symbol === 'UK100' ? 7500 : symbol === 'NAS100' ? 15000 : 28000; // approximate levels
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day);
    
    // Generate 288 five‑minute candles
    for (let candle = 0; candle < 288; candle++) {
      const time = new Date(date);
      time.setMinutes(candle * 5);
      
      const hour = time.getUTCHours();
      let volatility = 1.5;
      if (hour >= 8 && hour < 16) volatility = 3.0;
      if (hour >= 13 && hour < 21) volatility = 3.5;
      if (hour >= 21 || hour < 1) volatility = 1.0;
      
      const change = (Math.random() - 0.5) * volatility;
      price += change;
      price = Math.max(price, 1000);
      
      const open = price;
      const close = price + (Math.random() - 0.5) * volatility * 0.5;
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;
      
      data.push({
        datetime: time.toISOString(),
        date: time.toISOString().split('T')[0],
        time: time.toTimeString().slice(0,5),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });
    }
  }
  return data;
};

// ────────────────────────────────────────────────
// 2. Strategy Definitions
// ────────────────────────────────────────────────
const strategies = {
  UK100: [
    {
      id: 'asian-breakout',
      name: 'Asian Breakout',
      description: 'Enter on breakout of Asian session high/low with half‑range stop and 1:2 target.',
      defaultParams: {
        sessionStart: 0,
        sessionEnd: 8,
        breakoutBuffer: 5,
        stopType: 'rangeHalf',
        stopValue: 0.5, // half of range if rangeHalf
        riskReward: 2,
        direction: 'both', // long, short, both
      },
      paramFields: [
        { name: 'sessionStart', label: 'Asian Start (UTC)', type: 'number', min: 0, max: 23 },
        { name: 'sessionEnd', label: 'Asian End (UTC)', type: 'number', min: 1, max: 24 },
        { name: 'breakoutBuffer', label: 'Breakout Buffer (points)', type: 'number', min: 0, step: 0.1 },
        { 
          name: 'stopType', 
          label: 'Stop Loss Type', 
          type: 'select',
          options: [
            { value: 'rangeHalf', label: 'Half of Asian Range' },
            { value: 'fixed', label: 'Fixed Points' },
            { value: 'atr', label: 'ATR (not implemented)' },
          ]
        },
        { name: 'stopValue', label: 'Stop Value (if fixed)', type: 'number', min: 0, step: 0.1, dependsOn: { stopType: 'fixed' } },
        { name: 'riskReward', label: 'Risk:Reward Ratio', type: 'number', min: 0.1, step: 0.1 },
        { 
          name: 'direction', 
          label: 'Trade Direction', 
          type: 'select',
          options: [
            { value: 'long', label: 'Long Only' },
            { value: 'short', label: 'Short Only' },
            { value: 'both', label: 'Both' },
          ]
        },
      ],
    },
    // Add more strategies for UK100 later
  ],
  NAS100: [
    {
      id: 'asian-breakout',
      name: 'Asian Breakout',
      description: 'Enter on breakout of Asian session high/low with half‑range stop and 1:2 target.',
      defaultParams: {
        sessionStart: 0,
        sessionEnd: 8,
        breakoutBuffer: 5,
        stopType: 'rangeHalf',
        stopValue: 0.5,
        riskReward: 2,
        direction: 'both',
      },
      paramFields: [ /* same as above but copy for simplicity */ ],
    },
  ],
  JAP225: [
    {
      id: 'asian-breakout',
      name: 'Asian Breakout',
      defaultParams: { sessionStart: 0, sessionEnd: 8, breakoutBuffer: 5, stopType: 'rangeHalf', stopValue: 0.5, riskReward: 2, direction: 'both' },
      paramFields: [ /* same */ ],
    },
  ],
};

// ────────────────────────────────────────────────
// 3. Backtest Engine
// ────────────────────────────────────────────────
const runBacktest = (data, strategy, params, initialCapital) => {
  const {
    sessionStart,
    sessionEnd,
    breakoutBuffer,
    stopType,
    stopValue,
    riskReward,
    direction,
  } = params;

  const trades = [];
  const equityCurve = [];
  let capital = initialCapital;
  let inTrade = false;
  let entryPrice = 0, stopLoss = 0, takeProfit = 0, tradeDirection = null;
  let asianHigh = null, asianLow = null, currentDay = null, asianRange = 0;

  // Group by day
  const dailyGroups = {};
  data.forEach(c => { if (!dailyGroups[c.date]) dailyGroups[c.date] = []; dailyGroups[c.date].push(c); });

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    const hour = new Date(candle.datetime).getUTCHours();
    const date = candle.date;

    // New day reset
    if (date !== currentDay) {
      currentDay = date;
      asianHigh = null;
      asianLow = null;
    }

    // Track Asian session
    if (hour >= sessionStart && hour < sessionEnd) {
      if (asianHigh === null || candle.high > asianHigh) asianHigh = candle.high;
      if (asianLow === null || candle.low < asianLow) asianLow = candle.low;
    }

    // After Asian session, check for breakout if not in trade
    if (hour >= sessionEnd && !inTrade && asianHigh !== null && asianLow !== null) {
      asianRange = asianHigh - asianLow;
      const longBreakout = asianHigh + breakoutBuffer;
      const shortBreakout = asianLow - breakoutBuffer;

      if ((direction === 'long' || direction === 'both') && candle.close > longBreakout) {
        // Enter long
        entryPrice = candle.close;
        tradeDirection = 'long';
        // Calculate stop
        if (stopType === 'rangeHalf') {
          stopLoss = entryPrice - (asianRange * stopValue); // stopValue = 0.5
        } else if (stopType === 'fixed') {
          stopLoss = entryPrice - stopValue;
        } else {
          stopLoss = entryPrice - (asianRange * 0.5); // fallback
        }
        takeProfit = entryPrice + (entryPrice - stopLoss) * riskReward;
        inTrade = true;
        trades.push({
          entryDate: candle.datetime,
          entryPrice,
          stopLoss,
          takeProfit,
          type: 'LONG',
        });
      }
      else if ((direction === 'short' || direction === 'both') && candle.close < shortBreakout) {
        // Enter short
        entryPrice = candle.close;
        tradeDirection = 'short';
        if (stopType === 'rangeHalf') {
          stopLoss = entryPrice + (asianRange * stopValue);
        } else if (stopType === 'fixed') {
          stopLoss = entryPrice + stopValue;
        } else {
          stopLoss = entryPrice + (asianRange * 0.5);
        }
        takeProfit = entryPrice - (stopLoss - entryPrice) * riskReward;
        inTrade = true;
        trades.push({
          entryDate: candle.datetime,
          entryPrice,
          stopLoss,
          takeProfit,
          type: 'SHORT',
        });
      }
    }

    // Manage trade
    if (inTrade) {
      const lastTrade = trades[trades.length - 1];
      let exit = false;
      let exitPrice = null;
      let reason = '';

      if (tradeDirection === 'long') {
        if (candle.low <= stopLoss) {
          exitPrice = stopLoss;
          reason = 'Stop Loss';
          exit = true;
        } else if (candle.high >= takeProfit) {
          exitPrice = takeProfit;
          reason = 'Take Profit';
          exit = true;
        }
      } else { // short
        if (candle.high >= stopLoss) {
          exitPrice = stopLoss;
          reason = 'Stop Loss';
          exit = true;
        } else if (candle.low <= takeProfit) {
          exitPrice = takeProfit;
          reason = 'Take Profit';
          exit = true;
        }
      }

      if (exit) {
        const pnl = tradeDirection === 'long'
          ? (exitPrice - entryPrice) / entryPrice * capital
          : (entryPrice - exitPrice) / entryPrice * capital;
        capital += pnl;
        lastTrade.exitDate = candle.datetime;
        lastTrade.exitPrice = exitPrice;
        lastTrade.pnl = pnl;
        lastTrade.capitalAfter = capital;
        lastTrade.reason = reason;
        inTrade = false;
      }
    }

    // Record equity
    let equity = capital;
    if (inTrade) {
      const floating = tradeDirection === 'long'
        ? (candle.close - entryPrice) / entryPrice * capital
        : (entryPrice - candle.close) / entryPrice * capital;
      equity = capital + floating;
    }
    equityCurve.push({ datetime: candle.datetime, equity: Number(equity.toFixed(2)) });
  }

  // Close any open trade at end
  if (inTrade) {
    const lastCandle = data[data.length - 1];
    const lastTrade = trades[trades.length - 1];
    const exitPrice = lastCandle.close;
    const pnl = tradeDirection === 'long'
      ? (exitPrice - entryPrice) / entryPrice * capital
      : (entryPrice - exitPrice) / entryPrice * capital;
    capital += pnl;
    lastTrade.exitDate = lastCandle.datetime;
    lastTrade.exitPrice = exitPrice;
    lastTrade.pnl = pnl;
    lastTrade.capitalAfter = capital;
    lastTrade.reason = 'End of Data';
  }

  // Statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = trades.filter(t => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0;
  const totalPnL = capital - initialCapital;
  const returnPercent = ((capital / initialCapital - 1) * 100).toFixed(2);

  let maxDrawdown = 0;
  let peak = equityCurve[0]?.equity || initialCapital;
  equityCurve.forEach(p => {
    if (p.equity > peak) peak = p.equity;
    const dd = ((peak - p.equity) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  });

  return {
    trades,
    equityCurve,
    stats: {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalPnL: totalPnL.toFixed(2),
      returnPercent,
      finalCapital: capital.toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(2),
    }
  };
};

export default function Backtest({ currentAccount }) {
  const { theme } = useTheme();
  const [symbol, setSymbol] = useState('UK100');
  const [strategyId, setStrategyId] = useState('asian-breakout');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({});
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  // Load data when symbol changes
  useEffect(() => {
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      const newData = generateSymbolData(symbol, 200);
      setData(newData);
      setLoading(false);
    }, 800);
  }, [symbol]);

  // Initialize params when symbol or strategy changes
  useEffect(() => {
    const strategy = strategies[symbol]?.find(s => s.id === strategyId);
    if (strategy) {
      setParams(strategy.defaultParams);
    }
  }, [symbol, strategyId]);

  const currentStrategy = strategies[symbol]?.find(s => s.id === strategyId);
  const paramFields = currentStrategy?.paramFields || [];

  const handleParamChange = (name, value) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const runBacktestHandler = () => {
    if (!data.length || !currentStrategy) return;
    setRunning(true);
    setTimeout(() => {
      const result = runBacktest(
        data,
        currentStrategy,
        params,
        currentAccount?.starting_balance || 10000
      );
      setResults(result);
      setRunning(false);
    }, 400);
  };

  const exportToCSV = () => {
    if (!results?.trades?.length) return;
    const headers = ['Type', 'Entry Date', 'Entry', 'Stop', 'Target', 'Exit Date', 'Exit', 'PnL', 'Reason'];
    const rows = results.trades.map(t => [
      t.type,
      t.entryDate,
      t.entryPrice.toFixed(2),
      t.stopLoss.toFixed(2),
      t.takeProfit.toFixed(2),
      t.exitDate || '',
      t.exitPrice?.toFixed(2) || '',
      t.pnl ? t.pnl.toFixed(2) : '',
      t.reason || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${symbol}_backtest_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartData = results ? {
    labels: results.equityCurve.map(e => e.datetime.slice(5,16)),
    datasets: [{
      label: 'Equity Curve',
      data: results.equityCurve.map(e => e.equity),
      borderColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      backgroundColor: theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      tension: 0.1,
      fill: true,
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Equity Curve' },
    },
    scales: {
      x: { title: { display: true, text: 'Date/Time' }, ticks: { maxTicksLimit: 10 } },
      y: { title: { display: true, text: 'Equity ($)' } },
    },
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 dark:bg-gray-950">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Account Selected</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select an account from the sidebar to use its starting balance.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-amber-900 dark:text-gray-300">Generating {symbol} data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-950 text-amber-950 dark:text-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Strategy Backtester</h1>
            <p className="text-amber-700 dark:text-gray-400 mt-1">
              Test your trading strategies on synthetic data
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runBacktestHandler}
              disabled={running || !currentStrategy}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
            >
              {running ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Run Backtest
                </>
              )}
            </Button>

            {results && (
              <Button 
                onClick={exportToCSV}
                variant="outline"
                className="border-amber-300 dark:border-gray-700 hover:bg-amber-100 dark:hover:bg-gray-800"
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Parameters Panel */}
          <Card className="lg:col-span-1 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800 shadow-md">
            <div className="p-5 border-b border-amber-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Strategy Settings
              </h2>
            </div>

            <div className="p-5 space-y-5">
              {/* Symbol Selector */}
              <div>
                <Label htmlFor="symbol" className="text-sm text-amber-800 dark:text-gray-300">Symbol</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger id="symbol" className="mt-1.5">
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UK100">UK100</SelectItem>
                    <SelectItem value="NAS100">NAS100</SelectItem>
                    <SelectItem value="JAP225">JAP225</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Strategy Selector */}
              {strategies[symbol] && (
                <div>
                  <Label htmlFor="strategy" className="text-sm text-amber-800 dark:text-gray-300">Strategy</Label>
                  <Select value={strategyId} onValueChange={setStrategyId}>
                    <SelectTrigger id="strategy" className="mt-1.5">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies[symbol].map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {currentStrategy?.description && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">{currentStrategy.description}</p>
                  )}
                </div>
              )}

              {/* Dynamic Parameters */}
              {paramFields.map(field => {
                const isVisible = !field.dependsOn || params[field.dependsOn.field] === field.dependsOn.value;
                if (!isVisible) return null;

                if (field.type === 'select') {
                  return (
                    <div key={field.name}>
                      <Label htmlFor={field.name} className="text-sm text-amber-800 dark:text-gray-300">{field.label}</Label>
                      <Select 
                        value={params[field.name] || ''} 
                        onValueChange={(v) => handleParamChange(field.name, v)}
                      >
                        <SelectTrigger id={field.name} className="mt-1.5">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                return (
                  <div key={field.name}>
                    <Label htmlFor={field.name} className="text-sm text-amber-800 dark:text-gray-300">{field.label}</Label>
                    <Input
                      id={field.name}
                      type={field.type}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={params[field.name] || ''}
                      onChange={(e) => handleParamChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                );
              })}

              <div className="pt-2 text-sm text-amber-700 dark:text-gray-400 border-t border-amber-200 dark:border-gray-700">
                <p>Initial Capital: ${currentAccount?.starting_balance?.toLocaleString() || '10,000'}</p>
              </div>
            </div>
          </Card>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-6">
            {results ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                    <p className="text-xs text-amber-700 dark:text-gray-400">Final Capital</p>
                    <p className="text-xl font-bold text-amber-900 dark:text-white mt-1">${results.stats.finalCapital}</p>
                  </Card>
                  <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                    <p className="text-xs text-amber-700 dark:text-gray-400">Total Return</p>
                    <p className={`text-xl font-bold mt-1 ${results.stats.returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.stats.returnPercent}%
                    </p>
                  </Card>
                  <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                    <p className="text-xs text-amber-700 dark:text-gray-400">Total Trades</p>
                    <p className="text-xl font-bold text-amber-900 dark:text-white mt-1">{results.stats.totalTrades}</p>
                  </Card>
                  <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                    <p className="text-xs text-amber-700 dark:text-gray-400">Win Rate</p>
                    <p className="text-xl font-bold text-amber-900 dark:text-white mt-1">{results.stats.winRate}%</p>
                  </Card>
                  <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                    <p className="text-xs text-amber-700 dark:text-gray-400">Max DD</p>
                    <p className="text-xl font-bold text-amber-900 dark:text-white mt-1">{results.stats.maxDrawdown}%</p>
                  </Card>
                </div>

                {/* Chart & Trades */}
                <Card className="bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                  <Tabs defaultValue="chart">
                    <div className="border-b border-amber-200 dark:border-gray-800 px-5 pt-4">
                      <TabsList className="bg-amber-100/50 dark:bg-gray-800">
                        <TabsTrigger value="chart"><LineChart className="h-4 w-4 mr-2" />Equity Curve</TabsTrigger>
                        <TabsTrigger value="trades"><Table className="h-4 w-4 mr-2" />Trade List</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="chart" className="p-5">
                      <div className="h-96"><Line data={chartData} options={chartOptions} /></div>
                    </TabsContent>
                    <TabsContent value="trades" className="p-5">
                      {results.trades.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-sm">
                            <thead className="bg-amber-100/50 dark:bg-gray-800 sticky top-0">
                              <tr><th>Type</th><th>Entry</th><th>Stop</th><th>Target</th><th>Exit</th><th>PnL</th><th>Reason</th></tr>
                            </thead>
                            <tbody>
                              {results.trades.map((t, i) => (
                                <tr key={i} className="border-b border-amber-100 dark:border-gray-800">
                                  <td className="px-2 py-2 font-medium">{t.type}</td>
                                  <td className="px-2 py-2">{t.entryDate?.slice(5,16)}<br/>{t.entryPrice.toFixed(2)}</td>
                                  <td className="px-2 py-2">{t.stopLoss.toFixed(2)}</td>
                                  <td className="px-2 py-2">{t.takeProfit.toFixed(2)}</td>
                                  <td className="px-2 py-2">{t.exitDate?.slice(5,16)}<br/>{t.exitPrice?.toFixed(2)}</td>
                                  <td className={`px-2 py-2 font-medium ${t.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.pnl >= 0 ? '+' : ''}{t.pnl?.toFixed(2)}
                                  </td>
                                  <td className="px-2 py-2">{t.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center">No trades</div>
                      )}
                    </TabsContent>
                  </Tabs>
                </Card>

                {/* Detailed Stats */}
                <Card className="bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800 p-5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-600" /> Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="text-xs text-amber-700 dark:text-gray-400">Total Trades</p><p className="text-xl font-bold">{results.stats.totalTrades}</p></div>
                    <div><p className="text-xs text-amber-700 dark:text-gray-400">Winning / Losing</p><p className="text-xl font-bold">{results.stats.winningTrades} / {results.stats.losingTrades}</p></div>
                    <div><p className="text-xs text-amber-700 dark:text-gray-400">Win Rate</p><p className="text-xl font-bold">{results.stats.winRate}%</p></div>
                    <div><p className="text-xs text-amber-700 dark:text-gray-400">Max DD</p><p className="text-xl font-bold">{results.stats.maxDrawdown}%</p></div>
                    <div><p className="text-xs text-amber-700 dark:text-gray-400">Net Profit</p><p className={`text-xl font-bold ${results.stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>${results.stats.totalPnL}</p></div>
                    <div><p className="text-xs text-amber-700 dark:text-gray-400">Return %</p><p className={`text-xl font-bold ${results.stats.returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{results.stats.returnPercent}%</p></div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="h-96 flex items-center justify-center bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                <p className="text-amber-600 dark:text-amber-400">Configure strategy and click Run Backtest</p>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-6 text-xs text-amber-600 dark:text-amber-400 text-center">
          * Synthetic data – replace with real data for accurate backtesting.
        </div>
      </div>
    </div>
  );
}
