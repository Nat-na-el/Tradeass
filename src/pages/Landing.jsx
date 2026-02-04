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
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize flipping counter logic (adapted from CodePen)
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
        var scopeElm = typeof selector == 'string' 
              ? document.querySelector(selector) 
              : selector 
                ? selector
                : this.DOM.scope;
        
        scopeElm.innerHTML = Array(this.settings.digits + 1)
            .join('<div><b data-value="0"></b></div>');
        
        this.DOM = {
          scope: scopeElm,
          digits: scopeElm.querySelectorAll('b')
        };
      },
      
      count: function(newVal) {
        var countTo, className, 
            settings = this.settings,
            digitsElms = this.DOM.digits;

        this.value = newVal || this.DOM.scope.dataset.value | 0;

        if (!this.value) return;

        countTo = (this.value + '').split('');

        if (settings.direction == 'rtl') {
          countTo = countTo.reverse();
          digitsElms = [].slice.call(digitsElms).reverse();
        }

        digitsElms.forEach(function(item, i) { 
          if (+item.dataset.value != countTo[i] && countTo[i] >= 0) {
            setTimeout(function(j) {
              var diff = Math.abs(countTo[j] - +item.dataset.value);
              item.dataset.value = countTo[j];
              if (diff > 3) item.className = 'blur';
            }, i * settings.delay, i);
          }
        });
      }
    };

    // Create counters for background
    new Counter('.stock-counter1', { digits: 6, direction: 'rtl', delay: 200 });
    new Counter('.stock-counter2', { digits: 5, direction: 'rtl', delay: 150 });
    new Counter('.stock-counter3', { digits: 7, direction: 'rtl', delay: 250 });

    // Randomly update counters every few seconds
    const randomCount = () => {
      if (document.querySelector('.stock-counter1')) {
        document.querySelector('.stock-counter1').dataset.value = Math.floor(Math.random() * 1000000) + 100000;
      }
      if (document.querySelector('.stock-counter2')) {
        document.querySelector('.stock-counter2').dataset.value = Math.floor(Math.random() * 100000) + 10000;
      }
      if (document.querySelector('.stock-counter3')) {
        document.querySelector('.stock-counter3').dataset.value = Math.floor(Math.random() * 10000000) + 1000000;
      }
    };

    randomCount();
    const interval = setInterval(randomCount, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Animated Trading-Themed Background – creative but now less obtrusive */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base dark gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/85 via-black/90 to-gray-950/90" />

        {/* Moving chart grid – reduced opacity */}
        <div className="absolute inset-0 opacity-8 dark:opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-move" />
        </div>

        {/* Rising/falling candlestick bars – much lower opacity */}
        <div className="absolute inset-0 flex justify-around items-end opacity-12 md:opacity-10 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-4 sm:w-6 md:w-8 lg:w-10 bg-gradient-to-t from-transparent via-emerald-500/50 to-emerald-400/20 rounded-t-md animate-candle-rise"
              style={{
                height: `${40 + Math.sin(i * 0.6) * 50 + 50}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${10 + i * 1.4}s`,
              }}
            />
          ))}
          {[...Array(18)].map((_, i) => (
            <div
              key={`red-${i}`}
              className="w-4 sm:w-6 md:w-8 lg:w-10 bg-gradient-to-b from-transparent via-red-500/40 to-red-400/15 rounded-b-md animate-candle-fall"
              style={{
                height: `${35 + Math.cos(i * 0.8) * 45 + 40}%`,
                animationDelay: `${i * 0.8 + 4}s`,
                animationDuration: `${12 + i * 1.8}s`,
              }}
            />
          ))}
        </div>

        {/* Floating orbs – lower opacity and blur */}
        <div className="absolute inset-0">
          <div className="absolute w-[800px] sm:w-[1200px] md:w-[1600px] h-[800px] sm:h-[1200px] md:h-[1600px] bg-gradient-to-br from-indigo-700/20 via-indigo-600/12 to-transparent rounded-full blur-3xl animate-float-slow left-[-30%] sm:left-[-20%] top-[-20%] animate-pulse-glow" />
          <div className="absolute w-[1000px] sm:w-[1500px] md:w-[2000px] h-[1000px] sm:h-[1500px] md:h-[2000px] bg-gradient-to-br from-purple-700/18 via-fuchsia-600/10 to-transparent rounded-full blur-3xl animate-float-medium right-[-35%] sm:right-[-25%] bottom-[-25%] animate-pulse-glow" style={{ animationDelay: '6s' }} />
          <div className="absolute w-[700px] sm:w-[1000px] md:w-[1400px] h-[700px] sm:h-[1000px] md:h-[1400px] bg-gradient-to-br from-cyan-600/15 via-emerald-500/8 to-transparent rounded-full blur-3xl animate-float-fast left-[5%] sm:left-[15%] bottom-[0%] animate-pulse-glow" style={{ animationDelay: '10s' }} />
        </div>

        {/* Diagonal trend lines – very low opacity */}
        <div className="absolute inset-0 opacity-6 dark:opacity-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_35%,rgba(34,197,94,0.10)_45%,transparent_55%)] animate-trend-move" />
          <div className="absolute inset-0 bg-[linear-gradient(-135deg,transparent_35%,rgba(239,68,68,0.08)_45%,transparent_55%)] animate-trend-move-reverse" style={{ animationDelay: '8s' }} />
        </div>

        {/* Scrolling stock ticker – thinner & more transparent */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/30 backdrop-blur-md overflow-hidden opacity-50">
          <div className="ticker-wrap">
            <div className="ticker">
              <div className="ticker__item">AAPL +1.2% $185.40</div>
              <div className="ticker__item">TSLA -0.8% $220.15</div>
              <div className="ticker__item">BTC +3.5% $45,200</div>
              <div className="ticker__item">ETH +2.1% $2,450</div>
              <div className="ticker__item">GOOGL +0.9% $142.60</div>
              <div className="ticker__item">AMZN -1.3% $155.80</div>
              <div className="ticker__item">MSFT +1.5% $410.20</div>
              <div className="ticker__item">NVDA +2.7% $620.50</div>
            </div>
          </div>
        </div>

        {/* Flipping stock price counters – very low opacity & z-index */}
        <div className="absolute top-20 left-10 opacity-30 z-0">
          <div className="numCounter stock-counter1" data-value="123456"></div>
        </div>
        <div className="absolute top-40 right-20 opacity-30 z-0">
          <div className="numCounter stock-counter2" data-value="78901"></div>
        </div>
        <div className="absolute bottom-32 left-1/3 opacity-30 z-0">
          <div className="numCounter stock-counter3" data-value="2345678"></div>
        </div>

        {/* Floating currency symbols – fewer & lower opacity */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute text-5xl md:text-7xl font-bold text-green-400/20 animate-float-slow animate-pulse-glow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 3}s`,
                animationDuration: `${18 + i * 4}s`,
              }}
            >
              $
            </div>
          ))}
          {[...Array(4)].map((_, i) => (
            <div
              key={`euro-${i}`}
              className="absolute text-5xl md:text-7xl font-bold text-blue-400/20 animate-float-medium animate-pulse-glow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 3.5 + 4}s`,
                animationDuration: `${22 + i * 5}s`,
              }}
            >
              €
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Header - Logo + Auth */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-b border-gray-200/80 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              T
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Tradeass
            </span>
          </div>
          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-all"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero - Full bleed, centered – now with semi-transparent backdrop for readability */}
      <section className="pt-40 pb-32 px-6 md:px-12 lg:px-20 text-center relative overflow-hidden z-10 bg-white/40 dark:bg-black/40 backdrop-blur-md">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 via-transparent to-purple-100/15 dark:from-indigo-950/20 dark:to-purple-950/15 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 space-y-10 md:space-y-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-none animate-fade-in">
            Your Personal Trading Edge
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-800 dark:text-gray-200 max-w-4xl mx-auto leading-relaxed">
            The most powerful, private, offline-first trading journal. Track every trade, reflect deeply, analyze with precision, and turn data into consistent profits built for serious traders.
          </p>
          <div className="pt-6 md:pt-10 flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              size="xl"
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg md:text-xl px-10 md:px-14 py-6 md:py-8 rounded-2xl shadow-2xl group transition-all duration-300"
            >
              Start Free No Card Needed
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-lg md:text-xl px-10 md:px-14 py-6 md:py-8 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-2xl"
            >
              Sign In to Your Journal
            </Button>
          </div>
          {/* Trust signals */}
          <div className="pt-12 flex flex-wrap justify-center gap-6 md:gap-12 text-sm md:text-base text-gray-700 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              <span>100% Private • No Servers</span>
            </div>
            <div className="flex items-center gap-2">
              <Infinity className="h-5 w-5 md:h-6 md:w-6 text-indigo-500" />
              <span>Unlimited Trades & Journals</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
              <span>Instant Setup • Offline Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar – increased z-index & backdrop */}
      <section className="py-16 px-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-y border-gray-200 dark:border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400">1.4B+</p>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mt-2">Trades Tracked</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400">120K+</p>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mt-2">Active Traders</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400">4.9/5</p>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mt-2">Average Rating</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400">99.9%</p>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mt-2">Uptime & Privacy</p>
          </div>
        </div>
      </section>

      {/* Features Grid - Light Section – increased z-index */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Built for Traders Who Want Results
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Tradeass gives you everything modern traders need from deep analytics to psychological reflection in one clean, private app.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900 border border-indigo-100 dark:border-indigo-900/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Precision Trade Tracking
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Log trades in seconds: entry/exit, size, fees, tags, screenshots, broker sync or CSV import. Track multiple accounts, strategies, and instruments with zero hassle.
              </p>
            </div>
            {/* ... the other 5 feature cards remain the same ... */}
          </div>
        </div>
      </section>

      {/* How It Works - Numbered Steps */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 relative z-10">
        {/* ... content remains the same ... */}
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-b from-indigo-900 to-black text-white relative z-10">
        {/* ... content remains the same ... */}
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative z-10">
        {/* ... content remains the same ... */}
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-black text-gray-400 text-center border-t border-gray-800 relative z-10">
        {/* ... content remains the same ... */}
      </footer>
    </div>
  );
}
