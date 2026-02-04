// src/pages/Landing.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  BookOpen,
  LineChart,
  Zap,
  ArrowRight,
  TrendingUp,
  Target,
  ShieldCheck,
  Calendar,
  Brain,
  Trophy,
  Users,
  Globe,
  Lock,
  Sparkles,
  CheckCircle2,
  Star,
  DollarSign,
  Clock,
  Infinity,
  ChevronRight,
  ChartLine,
  NotebookPen,
  Lightbulb,
  Mail,
  MessageSquare,
  Twitter,
  Linkedin,
  Github,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Flipping counters logic (kept but made very subtle)
    function Counter(selector, settings) {
      this.settings = Object.assign({
        digits: 5,
        delay: 250,
        direction: ''
      }, settings || {});

      this.DOM = {};
      this.build(selector);

      this.DOM.scope.addEventListener('transitionend', e => {
        if (e.pseudoElement === "::before" && e.propertyName == 'margin-top') {
          e.target.classList.remove('blur');
        }
      });

      this.count();
    }

    Counter.prototype = {
      build: function(selector) {
        var scopeElm = typeof selector == 'string' ? document.querySelector(selector) : selector ? selector : this.DOM.scope;
        scopeElm.innerHTML = Array(this.settings.digits + 1).join('<div><b data-value="0"></b></div>');
        this.DOM = {
          scope: scopeElm,
          digits: scopeElm.querySelectorAll('b')
        };
      },

      count: function(newVal) {
        var countTo = (newVal || this.DOM.scope.dataset.value | 0 + '').split('');
        var digitsElms = this.DOM.digits;

        digitsElms.forEach(function(item, i) {
          if (+item.dataset.value != countTo[i] && countTo[i] >= 0) {
            setTimeout(function(j) {
              item.dataset.value = countTo[j];
              if (Math.abs(countTo[j] - +item.dataset.value) > 3) item.className = 'blur';
            }, i * this.settings.delay, i);
          }
        }, this);
      }
    };

    // Very subtle background counters (almost invisible)
    new Counter('.stock-counter1', { digits: 6, direction: 'rtl', delay: 300 });
    new Counter('.stock-counter2', { digits: 5, direction: 'rtl', delay: 350 });
    new Counter('.stock-counter3', { digits: 7, direction: 'rtl', delay: 400 });

    const randomCount = () => {
      document.querySelector('.stock-counter1').dataset.value = Math.floor(Math.random() * 500000) + 50000;
      document.querySelector('.stock-counter2').dataset.value = Math.floor(Math.random() * 50000) + 5000;
      document.querySelector('.stock-counter3').dataset.value = Math.floor(Math.random() * 5000000) + 500000;
    };

    randomCount();
    const interval = setInterval(randomCount, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Subtle Trading Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/70 via-teal-950/60 to-gray-950/80" />

        <div className="absolute inset-0 opacity-8 dark:opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.06)_1px,transparent_1px)] bg-[size:60px_60px] animate-grid-move" />
        </div>

        <div className="absolute inset-0 flex justify-around items-end opacity-12 md:opacity-8 pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="w-5 sm:w-6 md:w-8 lg:w-10 bg-gradient-to-t from-transparent via-emerald-500/40 to-emerald-400/20 rounded-t-md animate-candle-rise"
              style={{ height: `${40 + Math.sin(i * 0.7) * 45 + 45}%`, animationDelay: `${i * 0.7}s` }}
            />
          ))}
          {[...Array(14)].map((_, i) => (
            <div
              key={`red-${i}`}
              className="w-5 sm:w-6 md:w-8 lg:w-10 bg-gradient-to-b from-transparent via-red-500/35 to-red-400/15 rounded-b-md animate-candle-fall"
              style={{ height: `${35 + Math.cos(i * 0.9) * 40 + 35}%`, animationDelay: `${i * 0.9 + 5}s` }}
            />
          ))}
        </div>

        <div className="absolute inset-0">
          <div className="absolute w-[700px] md:w-[1200px] h-[700px] md:h-[1200px] bg-gradient-to-br from-blue-700/18 via-blue-600/12 to-transparent rounded-full blur-3xl animate-float-slow left-[-25%] top-[-15%] animate-pulse-glow" />
          <div className="absolute w-[900px] md:w-[1600px] h-[900px] md:h-[1600px] bg-gradient-to-br from-cyan-700/16 via-teal-600/10 to-transparent rounded-full blur-3xl animate-float-medium right-[-30%] bottom-[-20%] animate-pulse-glow" style={{ animationDelay: '5s' }} />
          <div className="absolute w-[600px] md:w-[1100px] h-[600px] md:h-[1100px] bg-gradient-to-br from-emerald-600/14 via-cyan-500/8 to-transparent rounded-full blur-3xl animate-float-fast left-[10%] bottom-[5%] animate-pulse-glow" style={{ animationDelay: '9s' }} />
        </div>

        <div className="absolute inset-0 opacity-8 dark:opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(34,197,94,0.08)_50%,transparent_60%)] animate-trend-move" />
          <div className="absolute inset-0 bg-[linear-gradient(-135deg,transparent_40%,rgba(239,68,68,0.06)_50%,transparent_60%)] animate-trend-move-reverse" style={{ animationDelay: '7s' }} />
        </div>

        {/* Very subtle counters — almost invisible */}
        <div className="absolute top-32 left-8 opacity-20 z-0">
          <div className="numCounter stock-counter1" data-value="456789"></div>
        </div>
        <div className="absolute top-48 right-12 opacity-20 z-0">
          <div className="numCounter stock-counter2" data-value="23456"></div>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              T
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tradeass
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex text-blue-700 dark:text-cyan-300 hover:bg-blue-50/50 dark:hover:bg-cyan-950/20">
              Sign In
            </Button>
            <Button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all">
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-32 px-6 md:px-12 lg:px-20 text-center relative z-10">
        <div className="max-w-6xl mx-auto space-y-10 md:space-y-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none animate-fade-in">
            Your Personal Trading Edge
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
            The most powerful, private, offline-first trading journal. Track every trade, reflect deeply, analyze with precision, and turn data into consistent profits built for serious traders.
          </p>
          <div className="pt-6 md:pt-10 flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              size="xl"
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg md:text-xl px-10 md:px-14 py-6 md:py-8 rounded-2xl shadow-2xl group transition-all duration-300"
            >
              Start Free No Card Needed
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-lg md:text-xl px-10 md:px-14 py-6 md:py-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-2xl"
            >
              Sign In to Your Journal
            </Button>
          </div>
          <div className="pt-12 flex flex-wrap justify-center gap-6 md:gap-12 text-sm md:text-base text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
              <span>100% Private • No Servers</span>
            </div>
            <div className="flex items-center gap-2">
              <Infinity className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
              <span>Unlimited Trades & Journals</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-cyan-500" />
              <span>Instant Setup • Offline Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-y border-slate-200 dark:border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-cyan-400">1.4B+</p>
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mt-2">Trades Tracked</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-cyan-400">120K+</p>
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mt-2">Active Traders</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-cyan-400">4.9/5</p>
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mt-2">Average Rating</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-cyan-400">99.9%</p>
            <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 mt-2">Uptime & Privacy</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
              Built for Traders Who Want Results
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
              Tradeass gives you everything modern traders need from deep analytics to psychological reflection in one clean, private app.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: BarChart3, title: "Precision Trade Tracking", desc: "Log trades in seconds: entry/exit, size, fees, tags, screenshots, broker sync or CSV import. Track multiple accounts, strategies, and instruments with zero hassle.", color: "blue" },
              { icon: LineChart, title: "60+ Performance Reports", desc: "Win rate by setup/time/day, expectancy, R-multiple distribution, PNL curves, drawdown analysis, heatmaps, streak detection exportable to CSV/PDF for deeper review.", color: "cyan" },
              { icon: BookOpen, title: "Deep Daily Journals", desc: "Structured daily reviews with mood, confidence, market context, and free notes. Attach screenshots, link trades, spot emotional patterns, and build long-term discipline.", color: "blue" },
              { icon: Brain, title: "AI-Powered Insights", desc: "Smart pattern detection: \"Win rate drops 21% after lunch\", \"This setup has 2.4 R:R but only 38% win rate\", personalized tips, risk warnings, and psychology suggestions.", color: "emerald" },
              { icon: Target, title: "Risk & Money Management", desc: "Built-in position sizing calculator, risk % tracker, max drawdown alerts, equity curve monitoring, and stop/target suggestions to protect capital and enforce discipline.", color: "emerald" },
              { icon: Lock, title: "100% Private • Offline-First", desc: "No servers, no tracking, no subscriptions. All data stored locally in your browser. Work offline, sync when online your trading stays yours forever.", color: "teal" },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all group">
                <div className={`w-14 h-14 rounded-2xl bg-${item.color}-100 dark:bg-${item.color}-900/40 flex items-center justify-center mb-6`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white">
              From First Trade to Consistent Profits
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto">
              Tradeass makes it simple to build better habits and sharper decisions — step by step.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { num: 1, title: "Sign Up & Setup", desc: "Create account in seconds. Set starting balance, add brokers or import CSV. Create as many accounts as you trade." },
              { num: 2, title: "Log Trades & Reflect", desc: "Record every detail. Write daily journals, attach screenshots, rate confidence, tag setups build complete context." },
              { num: 3, title: "Analyze Deeply", desc: "Instant dashboards, 60+ reports, AI insights, pattern detection uncover what really drives your results." },
              { num: 4, title: "Improve & Scale", desc: "Take challenges, run backtests, get mentor feedback, track progress turn data into rules and consistent profits." },
            ].map((step, i) => (
              <div key={i} className="space-y-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-cyan-400 text-4xl font-bold shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-b from-blue-900/95 to-black/95 text-white backdrop-blur-lg relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">Traders Trust Tradeass</h2>
            <p className="text-xl md:text-2xl text-slate-200 max-w-4xl mx-auto">
              Real results from real traders using Tradeass every day.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { quote: "Switched from spreadsheets to Tradeass my win rate jumped 18% in 3 months. The AI insights are scary good.", author: "Ryan P. • Futures Trader" },
              { quote: "Offline mode + privacy is unbeatable. Finally a journal I actually use every day.", author: "Lisa M. • Forex Swing Trader" },
              { quote: "The reports and backtesting tools helped me cut my max drawdown in half. Worth every second.", author: "David K. • Stock Day Trader" },
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-800/60 backdrop-blur-md border border-slate-700/50">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-6 w-6 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-lg italic mb-6">"{t.quote}"</p>
                <p className="font-semibold">{t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center bg-gradient-to-br from-blue-700 via-cyan-700 to-emerald-700 text-white relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-5xl md:text-7xl font-extrabold leading-tight">Ready to Trade Smarter?</h2>
          <p className="text-2xl md:text-3xl opacity-90 max-w-4xl mx-auto">
            Join thousands of traders using Tradeass to track, analyze, and win consistently. Start free today — no card required.
          </p>
          <Button
            size="xl"
            onClick={() => navigate('/register')}
            className="bg-slate-900 hover:bg-slate-800 text-white text-2xl md:text-3xl px-16 md:px-24 py-8 md:py-10 rounded-3xl shadow-2xl mt-8 transition-all"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="py-20 px-6 bg-slate-950 text-slate-300 relative z-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                T
              </div>
              <span className="text-2xl font-bold text-white">Tradeass</span>
            </div>
            <p className="text-sm">Your personal trading journal & analytics platform — private, offline-first, built for consistency.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Feature Request</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Report Bug</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Connect</h4>
            <div className="flex gap-6 mb-6">
              <a href="#" className="hover:text-cyan-400 transition-colors"><Twitter className="h-6 w-6" /></a>
              <a href="#" className="hover:text-cyan-400 transition-colors"><Linkedin className="h-6 w-6" /></a>
              <a href="#" className="hover:text-cyan-400 transition-colors"><Github className="h-6 w-6" /></a>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} Tradeass. All rights reserved.</p>
            <div className="mt-4 text-xs space-y-1">
              <a href="#" className="hover:text-cyan-400 transition-colors block">Privacy Policy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors block">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
