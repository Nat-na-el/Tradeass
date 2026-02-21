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
  Table,
  Upload
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTheme } from '../Theme-provider';
import Papa from 'papaparse';

// Chart.js setup (install chart.js + react-chartjs-2 if not already)
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

// Strategy implementation (your Asian breakout)
const runBacktest = (data, initialCapital = 10000) => {
  if (!data || data.length < 24) {
    return { trades: [], equity: [], stats: {} };
  }

  const trades = [];
  let equity = initialCapital;
  const equityCurve = [{ date: data[0].date, equity: initialCapital }];
  let position = 0; // 1 long, -1 short, 0 flat
  let entryPrice = 0;
  let sl = 0;
  let tp = 0;

  // Group by date
  const groups = {};
  data.forEach((bar) => {
    const date = bar.date.split(' ')[0]; // Extract date part
    if (!groups[date]) groups[date] = [];
    groups[date].push(bar);
  });

  for (const date in groups) {
    const dailyData = groups[date];
    if (dailyData.length < 24) continue;

    // Asian session: hours 0-7 (assume 0-indexed array, 00:00-07:00)
    const asian = dailyData.slice(0, 8);
    let asianHigh = Math.max(...asian.map((b) => b.high));
    let asianLow = Math.min(...asian.map((b) => b.low));
    const asianRange = asianHigh - asianLow;
    const midRange = asianLow + asianRange / 2;

    // London session: hours 8-15 (08:00-15:00, assume close at 16:00)
    const london = dailyData.slice(8, 16);

    for (const hour of london) {
      const high = hour.high;
      const low = hour.low;
      const close = hour.close;

      // Entry if no position
      if (position === 0) {
        if (high > asianHigh) {
          position = 1;
          entryPrice = asianHigh; // Enter at breakout level (approx)
          const risk = entryPrice - midRange;
          sl = midRange;
          tp = entryPrice + 2 * risk;
        } else if (low < asianLow) {
          position = -1;
          entryPrice = asianLow;
          const risk = midRange - entryPrice;
          sl = midRange;
          tp = entryPrice - 2 * risk;
        }
        if (position !== 0) {
          // Log or continue
        }
      }

      // Check exit if in position
      if (position === 1) {
        if (low <= sl) {
          const pnl = ((sl - entryPrice) / entryPrice) * equity;
          equity += pnl;
          trades.push({ date, type: 'long', pnl, exitReason: 'SL' });
          position = 0;
        } else if (high >= tp) {
          const pnl = ((tp - entryPrice) / entryPrice) * equity;
          equity += pnl;
          trades.push({ date, type: 'long', pnl, exitReason: 'TP' });
          position = 0;
        }
      } else if (position === -1) {
        if (high >= sl) {
          const pnl = ((entryPrice - sl) / entryPrice) * equity; // Negative for SL
          equity += pnl;
          trades.push({ date, type: 'short', pnl, exitReason: 'SL' });
          position = 0;
        } else if (low <= tp) {
          const pnl = ((entryPrice - tp) / entryPrice) * equity; // Positive for TP
          equity += pnl;
          trades.push({ date, type: 'short', pnl, exitReason: 'TP' });
          position = 0;
        }
      }

      if (position === 0) break; // Exit loop if exited early
    }

    // If still open at end of London, close
    if (position !== 0) {
      const closePrice = london[london.length - 1].close;
      const pnl = ((closePrice - entryPrice) / entryPrice) * equity * position;
      equity += pnl;
      trades.push({ date, type: position === 1 ? 'long' : 'short', pnl, exitReason: 'EOL' });
      position = 0;
    }

    equityCurve.push({ date, equity });
  }

  // Stats
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.pnl > 0).length;
  const winRate = totalTrades ? (wins / totalTrades) * 100 : 0;
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const returnPercent = ((equity - initialCapital) / initialCapital) * 100;
  const finalCapital = equity;

  return {
    trades,
    equity: equityCurve,
    stats: { totalTrades, winRate: winRate.toFixed(2), totalPnL: totalPnL.toFixed(2), returnPercent: returnPercent.toFixed(2), finalCapital: finalCapital.toFixed(2) },
  };
};

const Backtest = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [data, setData] = useState(generateFakeOHLCV(500)); // Default fake data
  const [fastPeriod, setFastPeriod] = useState(12);
  const [slowPeriod, setSlowPeriod] = useState(26);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [strategy, setStrategy] = useState('ma-crossover'); // Default strategy

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data.map((row) => ({
            date: row.Date || row.timestamp, // Adjust based on your CSV columns
            open: parseFloat(row.Open),
            high: parseFloat(row.High),
            low: parseFloat(row.Low),
            close: parseFloat(row.Close || row.Price),
            volume: parseInt(row.Volume || row.Vol || 0),
          }));
          setData(parsedData);
          console.log('Loaded data:', parsedData);
        },
      });
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    const results = runBacktest(data, initialCapital);
    setResults(results);
    setIsRunning(false);
  };

  const handleReset = () => {
    setResults(null);
  };

  const chartData = {
    labels: results?.equity.map(e => e.date) || [],
    datasets: [
      {
        label: 'Equity Curve',
        data: results?.equity.map(e => e.equity) || [],
        borderColor: isDark ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)',
        backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Equity Curve' },
    },
  };

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors duration-300
        ${isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Forgex Backtester
            </h1>
            <p className="text-sm sm:text-base mt-1 opacity-80">
              Test trading strategies on historical data
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleRun}
              disabled={isRunning || loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
              <Play size={18} className="mr-2" /> Run Backtest
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="shadow-md"
            >
              <RotateCcw size={18} className="mr-2" /> Reset
            </Button>
          </div>
        </div>

        {/* Strategy Config */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-5 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Strategy Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* File Upload */}
            <div>
              <Label htmlFor="data-upload" className="block text-sm font-medium mb-2">
                Upload Hourly Data CSV
              </Label>
              <Input
                id="data-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                CSV format: Date, Open, High, Low, Close, Volume (hourly)
              </p>
            </div>

            {/* Initial Capital */}
            <div>
              <Label htmlFor="capital" className="block text-sm font-medium mb-2">
                Initial Capital ($)
              </Label>
              <Input
                id="capital"
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Results */}
        {results && (
          <Tabs defaultValue="equity" className="mb-8">
            <TabsList>
              <TabsTrigger value="equity">Equity Curve</TabsTrigger>
              <TabsTrigger value="trades">Trades Log</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="equity">
              <Card className="p-5">
                <Line options={chartOptions} data={chartData} />
              </Card>
            </TabsContent>
            <TabsContent value="trades">
              <Card className="p-5 overflow-auto max-h-[400px]">
                {results.trades.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">PnL</th>
                        <th className="px-4 py-3">Exit Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.trades.map((trade, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-3 font-medium">
                            <span className={trade.type === 'long' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {trade.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">{trade.date}</td>
                          <td className="px-4 py-3 font-medium">
                            {trade.pnl ? (
                              <span className={trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3">{trade.exitReason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-600 dark:text-gray-400">
                    No trades generated — adjust parameters or data
                  </div>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="stats">
              <Card className="p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Backtest Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Trades</p>
                    <p className="text-xl font-bold">{results.stats.totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                    <p className="text-xl font-bold">{results.stats.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total PnL</p>
                    <p className={`text-xl font-bold ${results.stats.totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ${results.stats.totalPnL}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Return %</p>
                    <p className={`text-xl font-bold ${results.stats.returnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {results.stats.returnPercent}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Final Capital</p>
                    <p className="text-xl font-bold">${results.stats.finalCapital}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
