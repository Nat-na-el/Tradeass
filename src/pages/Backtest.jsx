// src/pages/Backtest.jsx
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Settings, 
  AlertTriangle,
  BarChart3,
  LineChart,
  Table
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTheme } from '../Theme-provider';

// ────────────────────────────────────────────────
//  Chart.js setup (you need to install chart.js + react-chartjs-2)
//  npm install chart.js react-chartjs-2
// ────────────────────────────────────────────────
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
// Fake historical data generator (replace with real data later)
// ────────────────────────────────────────────────
const generateFakeOHLCV = (days = 500) => {
  const data = [];
  let price = 100;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    price += (Math.random() - 0.5) * 4; // random walk
    price = Math.max(10, price); // prevent negative prices

    const open = price;
    const close = price + (Math.random() - 0.5) * 3;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.floor(Math.random() * 1000000) + 100000;

    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });
  }

  return data;
};

// ────────────────────────────────────────────────
// Simple MA Crossover Strategy
// ────────────────────────────────────────────────
const runBacktest = (data, fastPeriod, slowPeriod, initialCapital = 10000) => {
  if (!data || data.length < slowPeriod) {
    return { trades: [], equity: [], stats: {} };
  }

  const closes = data.map(d => d.close);
  const dates = data.map(d => d.date);

  // Calculate moving averages
  const fastMA = [];
  const slowMA = [];
  const signals = [];
  const equityCurve = [{ date: dates[0], equity: initialCapital }];
  let position = 0; // 0 = flat, 1 = long
  let entryPrice = 0;
  let capital = initialCapital;
  const trades = [];

  for (let i = slowPeriod; i < closes.length; i++) {
    // Fast MA
    let fastSum = 0;
    for (let j = 0; j < fastPeriod; j++) {
      fastSum += closes[i - j];
    }
    fastMA[i] = fastSum / fastPeriod;

    // Slow MA
    let slowSum = 0;
    for (let j = 0; j < slowPeriod; j++) {
      slowSum += closes[i - j];
    }
    slowMA[i] = slowSum / slowPeriod;

    // Generate signals
    if (i > slowPeriod) {
      const prevFast = fastMA[i-1];
      const prevSlow = slowMA[i-1];
      const currFast = fastMA[i];
      const currSlow = slowMA[i];

      if (prevFast <= prevSlow && currFast > currSlow) {
        signals[i] = 'buy';
      } else if (prevFast >= prevSlow && currFast < currSlow) {
        signals[i] = 'sell';
      } else {
        signals[i] = null;
      }
    }

    // Execute trades
    if (signals[i] === 'buy' && position === 0) {
      position = 1;
      entryPrice = closes[i];
      trades.push({
        type: 'BUY',
        date: dates[i],
        price: entryPrice,
        capitalBefore: capital,
      });
    } else if (signals[i] === 'sell' && position === 1) {
      position = 0;
      const exitPrice = closes[i];
      const pnl = (exitPrice - entryPrice) / entryPrice * capital;
      capital += pnl;

      trades[trades.length - 1] = {
        ...trades[trades.length - 1],
        exitDate: dates[i],
        exitPrice,
        pnl,
        capitalAfter: capital,
      };

      equityCurve.push({ date: dates[i], equity: capital });
    }

    // Update equity curve every step
    if (position === 1) {
      const currentValue = capital * (closes[i] / entryPrice);
      equityCurve.push({ date: dates[i], equity: currentValue });
    } else {
      equityCurve.push({ date: dates[i], equity: capital });
    }
  }

  // Close open position at the end
  if (position === 1) {
    const exitPrice = closes[closes.length - 1];
    const pnl = (exitPrice - entryPrice) / entryPrice * capital;
    capital += pnl;

    trades[trades.length - 1] = {
      ...trades[trades.length - 1],
      exitDate: dates[dates.length - 1],
      exitPrice,
      pnl,
      capitalAfter: capital,
    };
  }

  // Calculate statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0;
  const totalPnL = capital - initialCapital;
  const returnPercent = ((capital / initialCapital - 1) * 100).toFixed(2);

  return {
    trades,
    equityCurve,
    stats: {
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
      winRate,
      totalPnL: totalPnL.toFixed(2),
      returnPercent,
      finalCapital: capital.toFixed(2),
      maxDrawdown: "0.00" // can be calculated later
    }
  };
};

export default function Backtest() {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({
    fastPeriod: 9,
    slowPeriod: 21,
    initialCapital: 10000,
    symbol: 'EURUSD',
    timeframe: 'D1',
  });
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  // Load fake data on mount
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const fakeData = generateFakeOHLCV(600);
      setData(fakeData);
      setLoading(false);
    }, 800);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: name === 'initialCapital' ? Number(value) : value
    }));
  };

  const runBacktestHandler = () => {
    if (!data.length) return;

    setRunning(true);
    setTimeout(() => {
      const backtestResult = runBacktest(
        data,
        Number(params.fastPeriod),
        Number(params.slowPeriod),
        Number(params.initialCapital)
      );
      setResults(backtestResult);
      setRunning(false);
    }, 400);
  };

  const exportToCSV = () => {
    if (!results?.trades?.length) return;

    const headers = ['Type', 'Entry Date', 'Entry Price', 'Exit Date', 'Exit Price', 'PnL', 'Capital After'];
    const rows = results.trades.map(t => [
      t.type,
      t.date,
      t.price,
      t.exitDate || '',
      t.exitPrice || '',
      t.pnl ? t.pnl.toFixed(2) : '',
      t.capitalAfter ? t.capitalAfter.toFixed(2) : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backtest_${params.symbol}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartData = results ? {
    labels: results.equityCurve.map(e => e.date),
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
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Equity ($)' } },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-amber-900 dark:text-gray-300">Loading historical data...</p>
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
              Test trading strategies on historical data
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runBacktestHandler}
              disabled={running}
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

            <Button 
              variant="outline"
              className="border-amber-300 dark:border-gray-700 hover:bg-amber-100 dark:hover:bg-gray-800"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Parameters Panel */}
          <Card className="lg:col-span-1 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800 shadow-md">
            <div className="p-5 border-b border-amber-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Strategy Parameters
              </h2>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <Label htmlFor="symbol" className="text-sm text-amber-800 dark:text-gray-300">
                  Symbol
                </Label>
                <Select 
                  value={params.symbol}
                  onValueChange={(v) => setParams(p => ({...p, symbol: v}))}
                >
                  <SelectTrigger id="symbol" className="mt-1.5">
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EURUSD">EUR/USD</SelectItem>
                    <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                    <SelectItem value="XAUUSD">Gold (XAU/USD)</SelectItem>
                    <SelectItem value="BTCUSD">Bitcoin (BTC/USD)</SelectItem>
                    <SelectItem value="SPX500">S&P 500</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeframe" className="text-sm text-amber-800 dark:text-gray-300">
                  Timeframe
                </Label>
                <Select 
                  value={params.timeframe}
                  onValueChange={(v) => setParams(p => ({...p, timeframe: v}))}
                >
                  <SelectTrigger id="timeframe" className="mt-1.5">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M5">5 Minutes</SelectItem>
                    <SelectItem value="M15">15 Minutes</SelectItem>
                    <SelectItem value="H1">1 Hour</SelectItem>
                    <SelectItem value="H4">4 Hours</SelectItem>
                    <SelectItem value="D1">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fastPeriod" className="text-sm text-amber-800 dark:text-gray-300">
                  Fast MA Period
                </Label>
                <Input
                  id="fastPeriod"
                  name="fastPeriod"
                  type="number"
                  value={params.fastPeriod}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="slowPeriod" className="text-sm text-amber-800 dark:text-gray-300">
                  Slow MA Period
                </Label>
                <Input
                  id="slowPeriod"
                  name="slowPeriod"
                  type="number"
                  value={params.slowPeriod}
                  onChange={handleInputChange}
                  min="1"
                  max="200"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="initialCapital" className="text-sm text-amber-800 dark:text-gray-300">
                  Initial Capital ($)
                </Label>
                <Input
                  id="initialCapital"
                  name="initialCapital"
                  type="number"
                  value={params.initialCapital}
                  onChange={handleInputChange}
                  min="1000"
                  step="1000"
                  className="mt-1.5"
                />
              </div>
            </div>
          </Card>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary Cards */}
            {results && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                  <p className="text-xs text-amber-700 dark:text-gray-400">Final Capital</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-white mt-1">
                    ${results.stats.finalCapital}
                  </p>
                </Card>

                <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                  <p className="text-xs text-amber-700 dark:text-gray-400">Total Return</p>
                  <p className={`text-xl font-bold mt-1 ${
                    results.stats.returnPercent >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {results.stats.returnPercent}%
                  </p>
                </Card>

                <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                  <p className="text-xs text-amber-700 dark:text-gray-400">Total Trades</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-white mt-1">
                    {results.stats.totalTrades}
                  </p>
                </Card>

                <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                  <p className="text-xs text-amber-700 dark:text-gray-400">Win Rate</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-white mt-1">
                    {results.stats.winRate}%
                  </p>
                </Card>

                <Card className="p-4 bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
                  <p className="text-xs text-amber-700 dark:text-gray-400">Net Profit</p>
                  <p className={`text-xl font-bold mt-1 ${
                    results.stats.totalPnL >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    ${results.stats.totalPnL}
                  </p>
                </Card>
              </div>
            )}

            {/* Chart & Results Tabs */}
            <Card className="bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800">
              <Tabs defaultValue="chart" className="w-full">
                <div className="border-b border-amber-200 dark:border-gray-800 px-5 pt-4">
                  <TabsList className="bg-amber-100/50 dark:bg-gray-800">
                    <TabsTrigger value="chart" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                      <LineChart className="h-4 w-4 mr-2" />
                      Equity Curve
                    </TabsTrigger>
                    <TabsTrigger value="trades" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                      <Table className="h-4 w-4 mr-2" />
                      Trade List
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="chart" className="p-5">
                  {results ? (
                    <div className="h-96">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      Run backtest to see equity curve
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="trades" className="p-5">
                  {results && results.trades.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-amber-100/50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Entry Date</th>
                            <th className="px-4 py-3">Entry Price</th>
                            <th className="px-4 py-3">Exit Date</th>
                            <th className="px-4 py-3">Exit Price</th>
                            <th className="px-4 py-3">PnL ($)</th>
                            <th className="px-4 py-3">Capital After</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.trades.map((trade, idx) => (
                            <tr key={idx} className="border-b border-amber-100 dark:border-gray-800 hover:bg-amber-50/50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-3 font-medium">
                                <span className={trade.type === 'BUY' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  {trade.type}
                                </span>
                              </td>
                              <td className="px-4 py-3">{trade.date}</td>
                              <td className="px-4 py-3">{trade.price.toFixed(2)}</td>
                              <td className="px-4 py-3">{trade.exitDate || '-'}</td>
                              <td className="px-4 py-3">{trade.exitPrice ? trade.exitPrice.toFixed(2) : '-'}</td>
                              <td className="px-4 py-3 font-medium">
                                {trade.pnl ? (
                                  <span className={trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3">{trade.capitalAfter ? trade.capitalAfter.toFixed(2) : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      No trades yet — run backtest first
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>

            {/* Stats Summary */}
            {results && (
              <Card className="bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800 p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Backtest Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Total Trades</p>
                    <p className="text-xl font-bold">{results.stats.totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Win Rate</p>
                    <p className="text-xl font-bold">{results.stats.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Net Profit</p>
                    <p className={`text-xl font-bold ${results.stats.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ${results.stats.totalPnL}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Return</p>
                    <p className={`text-xl font-bold ${results.stats.returnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {results.stats.returnPercent}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Final Capital</p>
                    <p className="text-xl font-bold">${results.stats.finalCapital}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
