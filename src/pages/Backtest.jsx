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
// 1. Synthetic UK100 Data Generator (5‑minute candles)
// ────────────────────────────────────────────────
const generateUK100Data = (days = 200) => {
  const data = [];
  let price = 7500; // UK100 around 7500
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  for (let day = 0; day < days; day++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + day);
    
    // Generate 288 five‑minute candles per day (24h * 12)
    for (let candle = 0; candle < 288; candle++) {
      const time = new Date(date);
      time.setMinutes(candle * 5);
      
      // Random walk with volatility that varies by session
      const hour = time.getUTCHours(); // using UTC for simplicity
      let volatility = 1.5; // base volatility in points
      
      // Higher volatility during London (08-16) and NY (13-21)
      if (hour >= 8 && hour < 16) volatility = 3.0; // London
      if (hour >= 13 && hour < 21) volatility = 3.5; // NY overlap
      if (hour >= 21 || hour < 1) volatility = 1.0; // quiet Asian
      
      const change = (Math.random() - 0.5) * volatility;
      price += change;
      price = Math.max(price, 1000); // floor
      
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
// 2. Strategy Backtest Engine
// ────────────────────────────────────────────────
const runBacktest = (data, params, initialCapital) => {
  const {
    sessionStart = 0,   // Asian session start hour (UTC)
    sessionEnd = 8,      // Asian session end hour (UTC)
    breakoutPips = 5,    // buffer above Asian high
    riskReward = 2,      // fixed 1:2
  } = params;

  const trades = [];
  const equityCurve = [];
  let capital = initialCapital;
  let inTrade = false;
  let entryPrice = 0;
  let stopLoss = 0;
  let takeProfit = 0;
  let asianHigh = null;
  let asianLow = null;
  let currentDay = null;
  let asianRange = 0;

  // Group data by day to identify Asian sessions
  const dailyGroups = {};
  data.forEach(candle => {
    if (!dailyGroups[candle.date]) dailyGroups[candle.date] = [];
    dailyGroups[candle.date].push(candle);
  });

  // Iterate through each candle in chronological order
  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    const hour = new Date(candle.datetime).getUTCHours();
    const date = candle.date;

    // New day? Reset Asian high/low
    if (date !== currentDay) {
      currentDay = date;
      asianHigh = null;
      asianLow = null;
    }

    // During Asian session, track high and low
    if (hour >= sessionStart && hour < sessionEnd) {
      if (asianHigh === null || candle.high > asianHigh) asianHigh = candle.high;
      if (asianLow === null || candle.low < asianLow) asianLow = candle.low;
    }

    // After Asian session, if not in a trade, check for breakout
    if (hour >= sessionEnd && !inTrade && asianHigh !== null) {
      const breakoutLevel = asianHigh + breakoutPips; // pips = points for indices
      if (candle.close > breakoutLevel) {
        // Entry: next candle at open? We'll enter at current close for simplicity
        entryPrice = candle.close;
        asianRange = asianHigh - asianLow;
        stopLoss = entryPrice - (asianRange / 2);
        takeProfit = entryPrice + (asianRange); // risk = asianRange/2, reward = asianRange (2:1)
        
        inTrade = true;
        trades.push({
          entryDate: candle.datetime,
          entryPrice,
          stopLoss,
          takeProfit,
          type: 'LONG',
        });
      }
    }

    // Manage trade
    if (inTrade) {
      // Check if stop hit
      if (candle.low <= stopLoss) {
        const exitPrice = stopLoss;
        const pnl = (exitPrice - entryPrice) / entryPrice * capital;
        capital += pnl;
        trades[trades.length - 1] = {
          ...trades[trades.length - 1],
          exitDate: candle.datetime,
          exitPrice,
          pnl,
          capitalAfter: capital,
          reason: 'Stop Loss',
        };
        inTrade = false;
      }
      // Check if take profit hit
      else if (candle.high >= takeProfit) {
        const exitPrice = takeProfit;
        const pnl = (exitPrice - entryPrice) / entryPrice * capital;
        capital += pnl;
        trades[trades.length - 1] = {
          ...trades[trades.length - 1],
          exitDate: candle.datetime,
          exitPrice,
          pnl,
          capitalAfter: capital,
          reason: 'Take Profit',
        };
        inTrade = false;
      }
    }

    // Record equity (current capital + open trade floating)
    let equity = capital;
    if (inTrade) {
      const floating = (candle.close - entryPrice) / entryPrice * capital;
      equity = capital + floating;
    }
    equityCurve.push({
      datetime: candle.datetime,
      equity: Number(equity.toFixed(2)),
    });
  }

  // Close any open trade at the end
  if (inTrade) {
    const lastCandle = data[data.length - 1];
    const exitPrice = lastCandle.close;
    const pnl = (exitPrice - entryPrice) / entryPrice * capital;
    capital += pnl;
    trades[trades.length - 1] = {
      ...trades[trades.length - 1],
      exitDate: lastCandle.datetime,
      exitPrice,
      pnl,
      capitalAfter: capital,
      reason: 'End of Data',
    };
  }

  // Calculate statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = trades.filter(t => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0;
  const totalPnL = capital - initialCapital;
  const returnPercent = ((capital / initialCapital - 1) * 100).toFixed(2);
  
  // Max drawdown (simple)
  let maxDrawdown = 0;
  let peak = equityCurve[0]?.equity || initialCapital;
  equityCurve.forEach(point => {
    if (point.equity > peak) peak = point.equity;
    const drawdown = ((peak - point.equity) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({
    sessionStart: 0,
    sessionEnd: 8,
    breakoutPips: 5,
    riskReward: 2, // fixed 1:2
  });
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  // Generate synthetic data on mount
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const synthetic = generateUK100Data(200); // 200 days of 5min data
      setData(synthetic);
      setLoading(false);
    }, 800);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: Number(value) }));
  };

  const runBacktestHandler = () => {
    if (!data.length) return;
    setRunning(true);
    setTimeout(() => {
      const result = runBacktest(
        data,
        params,
        currentAccount?.starting_balance || 10000
      );
      setResults(result);
      setRunning(false);
    }, 400);
  };

  const exportToCSV = () => {
    if (!results?.trades?.length) return;

    const headers = ['Type', 'Entry Date', 'Entry Price', 'Exit Date', 'Exit Price', 'PnL ($)', 'Reason'];
    const rows = results.trades.map(t => [
      t.type,
      t.entryDate,
      t.entryPrice.toFixed(2),
      t.exitDate || '',
      t.exitPrice?.toFixed(2) || '',
      t.pnl ? t.pnl.toFixed(2) : '',
      t.reason || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uk100_backtest_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartData = results ? {
    labels: results.equityCurve.map(e => e.datetime.slice(5,16)), // MM-DD HH:MM
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
      x: { 
        title: { display: true, text: 'Date/Time' },
        ticks: { maxTicksLimit: 10 }
      },
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
          <p className="mt-4 text-amber-900 dark:text-gray-300">Generating synthetic UK100 data...</p>
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
            <h1 className="text-2xl md:text-3xl font-bold">UK100 Session Breakout Backtester</h1>
            <p className="text-amber-700 dark:text-gray-400 mt-1">
              Test your Asian session breakout strategy (1:2 risk‑reward)
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
              onClick={() => {
                setResults(null);
                setLoading(true);
                setTimeout(() => {
                  setData(generateUK100Data(200));
                  setLoading(false);
                }, 800);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> New Data
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
                <Label htmlFor="sessionStart" className="text-sm text-amber-800 dark:text-gray-300">
                  Asian Session Start (UTC hour)
                </Label>
                <Input
                  id="sessionStart"
                  name="sessionStart"
                  type="number"
                  min="0"
                  max="23"
                  value={params.sessionStart}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="sessionEnd" className="text-sm text-amber-800 dark:text-gray-300">
                  Asian Session End (UTC hour)
                </Label>
                <Input
                  id="sessionEnd"
                  name="sessionEnd"
                  type="number"
                  min="1"
                  max="24"
                  value={params.sessionEnd}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="breakoutPips" className="text-sm text-amber-800 dark:text-gray-300">
                  Breakout Buffer (points)
                </Label>
                <Input
                  id="breakoutPips"
                  name="breakoutPips"
                  type="number"
                  min="0"
                  step="0.1"
                  value={params.breakoutPips}
                  onChange={handleInputChange}
                  className="mt-1.5"
                />
              </div>

              <div className="pt-2 text-sm text-amber-700 dark:text-gray-400 border-t border-amber-200 dark:border-gray-700">
                <p><strong>Strategy Rules</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Long only when price breaks above Asian high + buffer</li>
                  <li>Stop loss = entry − (Asian range / 2)</li>
                  <li>Take profit = entry + (Asian range)  (1:2 RR)</li>
                  <li>Initial capital: ${currentAccount?.starting_balance?.toLocaleString() || '10,000'}</li>
                </ul>
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
                  <p className="text-xs text-amber-700 dark:text-gray-400">Max Drawdown</p>
                  <p className="text-xl font-bold text-amber-900 dark:text-white mt-1">
                    {results.stats.maxDrawdown}%
                  </p>
                </Card>
              </div>
            )}

            {/* Chart & Trades Tabs */}
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
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-amber-100/50 dark:bg-gray-800 sticky top-0">
                          <tr>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Entry Date</th>
                            <th className="px-4 py-3">Entry</th>
                            <th className="px-4 py-3">Exit Date</th>
                            <th className="px-4 py-3">Exit</th>
                            <th className="px-4 py-3">PnL ($)</th>
                            <th className="px-4 py-3">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.trades.map((trade, idx) => (
                            <tr key={idx} className="border-b border-amber-100 dark:border-gray-800 hover:bg-amber-50/50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-3 font-medium text-green-600 dark:text-green-400">LONG</td>
                              <td className="px-4 py-3">{trade.entryDate?.slice(0,16).replace('T',' ')}</td>
                              <td className="px-4 py-3">{trade.entryPrice.toFixed(2)}</td>
                              <td className="px-4 py-3">{trade.exitDate?.slice(0,16).replace('T',' ')}</td>
                              <td className="px-4 py-3">{trade.exitPrice?.toFixed(2)}</td>
                              <td className="px-4 py-3 font-medium">
                                {trade.pnl ? (
                                  <span className={trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3">{trade.reason || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      No trades generated — try different parameters
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>

            {/* Detailed Stats */}
            {results && (
              <Card className="bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-800 p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Performance Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Total Trades</p>
                    <p className="text-xl font-bold">{results.stats.totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Winning / Losing</p>
                    <p className="text-xl font-bold">
                      {results.stats.winningTrades} / {results.stats.losingTrades}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Win Rate</p>
                    <p className="text-xl font-bold">{results.stats.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Max Drawdown</p>
                    <p className="text-xl font-bold">{results.stats.maxDrawdown}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Net Profit</p>
                    <p className={`text-xl font-bold ${results.stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${results.stats.totalPnL}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-gray-400">Return %</p>
                    <p className={`text-xl font-bold ${results.stats.returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.stats.returnPercent}%
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Data Disclaimer */}
        <div className="mt-6 text-xs text-amber-600 dark:text-amber-400 text-center">
          * Using synthetic data for demonstration. Replace with real UK100 historical data for accurate backtesting.
        </div>
      </div>
    </div>
  );
}
