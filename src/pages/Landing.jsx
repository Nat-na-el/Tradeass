// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  BarChart2,
  MessageCircle,
  Briefcase,
  Heart,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};
export default function Landing() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    // Simulate loading for smooth entrance animation
    setTimeout(() => setIsLoaded(true), 300);
  
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
  
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
      document.querySelector('.stock-counter1').dataset.value = Math.floor(Math.random() * 1000000) + 100000;
      document.querySelector('.stock-counter2').dataset.value = Math.floor(Math.random() * 100000) + 10000;
      document.querySelector('.stock-counter3').dataset.value = Math.floor(Math.random() * 10000000) + 1000000;
    };
    randomCount();
    const counterInterval = setInterval(randomCount, 4000);
  
    return () => {
      clearInterval(counterInterval);
      clearInterval(interval);
    };
  }, []);
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-600 dark:text-cyan-400" />,
      title: "Precision Trade Tracking",
      description: "Log trades in seconds: entry/exit, size, fees, tags, screenshots, broker sync or CSV import. Track multiple accounts, strategies, and instruments with zero hassle."
    },
    {
      icon: <LineChart className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />,
      title: "60+ Performance Reports",
      description: "Win rate by setup/time/day, expectancy, R-multiple distribution, PNL curves, drawdown analysis, heatmaps, streak detection exportable to CSV/PDF for deeper review."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-blue-600 dark:text-cyan-400" />,
      title: "Deep Daily Journals",
      description: "Structured daily reviews with mood, confidence, market context, and free notes. Attach screenshots, link trades, spot emotional patterns, and build long-term discipline."
    },
    {
      icon: <Brain className="w-8 h-8 text-green-600 dark:text-emerald-400" />,
      title: "AI-Powered Insights",
      description: "Smart pattern detection: 'Win rate drops 21% after lunch', 'This setup has 2.4 R:R but only 38% win rate', personalized tips, risk warnings, and psychology suggestions."
    },
    {
      icon: <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      title: "Risk & Money Management",
      description: "Built-in position sizing calculator, risk % tracker, max drawdown alerts, equity curve monitoring, and stop/target suggestions to protect capital and enforce discipline."
    },
    {
      icon: <Lock className="w-8 h-8 text-teal-600 dark:text-teal-400" />,
      title: "100% Private • Offline-First",
      description: "No servers, no tracking, no subscriptions. All data stored locally in your browser. Work offline, sync when online your trading stays yours forever."
    },
    {
      icon: <Users className="w-8 h-8 text-rose-400" />,
      title: "Community & Mentorship",
      description: "Connect with other traders, share journals (anonymously), and access mentor feedback."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-sky-400" />,
      title: "Trade Review System",
      description: "Tag trades with setups, mistakes, lessons learned. Filter and review to improve faster."
    }
  ];
  const brokers = [
    "Interactive Brokers", "TradeStation", "Thinkorswim (TD Ameritrade)", "NinjaTrader",
    "MetaTrader 4/5", "TradingView", "eToro", "OANDA", "Forex.com", "IG",
    "CMC Markets", "Saxo Bank", "Pepperstone", "IC Markets", "Eightcap"
  ];
  const testimonials = [
    {
      name: "Ryan P.",
      role: "Futures Trader",
      text: "Switched from spreadsheets to Tradeass my win rate jumped 18% in 3 months. The AI insights are scary good.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      name: "Lisa M.",
      role: "Forex Swing Trader",
      text: "Offline mode + privacy is unbeatable. Finally a journal I actually use every day.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5
    },
    {
      name: "David K.",
      role: "Stock Day Trader",
      text: "The reports and backtesting tools helped me cut my max drawdown in half. Worth every second.",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg",
      rating: 5
    },
    {
      name: "Alex M.",
      role: "Full-time Futures Trader",
      text: "This journal changed how I review my sessions. I finally see my recurring mistakes instead of just staring at PnL numbers.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      name: "Sarah K.",
      role: "Swing Forex Trader",
      text: "The emotional tracking + setup tagging feature is gold. I cut my revenge trading by 70% in two months.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5
    },
    {
      name: "Michael R.",
      role: "Options & Stocks Day Trader",
      text: "Best analytics I've used. The expectancy calculator and R-multiple breakdown made me realize I was overtrading low-probability setups.",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg",
      rating: 5
    },
    {
      name: "Elena V.",
      role: "Beginner Crypto Trader",
      text: "As a newbie, the daily prompts forced me to reflect properly. I went from -42% to +18% in 4 months.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5
    }
  ];
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Animated Trading-Themed Background */}
      <div className="absolute inset-0 z-[-10] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-teal-950 to-gray-950" />
        <div className="absolute inset-0 opacity-12 dark:opacity-15">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.1)_1px,transparent_1px),linear_gradient(to_bottom,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-move" />
        </div>
        <div className="absolute inset-0 flex justify-around items-end opacity-25 md:opacity-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-4 sm:w-6 md:w-8 lg:w-12 bg-gradient-to-t from-transparent via-emerald-500/80 to-emerald-400/40 rounded-t-md animate-candle-rise"
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
              className="w-4 sm:w-6 md:w-8 lg:w-12 bg-gradient-to-b from-transparent via-red-500/70 to-red-400/30 rounded-b-md animate-candle-fall"
              style={{
                height: `${35 + Math.cos(i * 0.8) * 45 + 40}%`,
                animationDelay: `${i * 0.8 + 4}s`,
                animationDuration: `${12 + i * 1.8}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0">
          <div className="absolute w-[800px] sm:w-[1200px] md:w-[1600px] h-[800px] sm:h-[1200px] md:h-[1600px] bg-gradient-to-br from-blue-700/30 via-blue-600/20 to-transparent rounded-full blur-4xl animate-float-slow left-[-30%] sm:left-[-20%] top-[-20%] animate-pulse-glow" />
          <div className="absolute w-[1000px] sm:w-[1500px] md:w-[2000px] h-[1000px] sm:h-[1500px] md:h-[2000px] bg-gradient-to-br from-cyan-700/25 via-teal-600/15 to-transparent rounded-full blur-4xl animate-float-medium right-[-35%] sm:right-[-25%] bottom-[-25%] animate-pulse-glow" style={{ animationDelay: '6s' }} />
          <div className="absolute w-[700px] sm:w-[1000px] md:w-[1400px] h-[700px] sm:h-[1000px] md:h-[1400px] bg-gradient-to-br from-emerald-600/22 via-cyan-500/12 to-transparent rounded-full blur-4xl animate-float-fast left-[5%] sm:left-[15%] bottom-[0%] animate-pulse-glow" style={{ animationDelay: '10s' }} />
        </div>
        <div className="absolute inset-0 opacity-12 dark:opacity-15">
          <div className="absolute inset-0 bg-[linear_gradient(135deg,transparent_35%,rgba(34,197,94,0.15)_45%,transparent_55%)] animate-trend-move" />
          <div className="absolute inset-0 bg-[linear_gradient(-135deg,transparent_35%,rgba(239,68,68,0.12)_45%,transparent_55%)] animate-trend-move-reverse" style={{ animationDelay: '8s' }} />
        </div>
        <div className="absolute top-20 left-10 opacity-50">
          <div className="numCounter stock-counter1" data-value="123456"></div>
        </div>
        <div className="absolute top-40 right-20 opacity-50">
          <div className="numCounter stock-counter2" data-value="78901"></div>
        </div>
        <div className="absolute bottom-32 left-1/3 opacity-50">
          <div className="numCounter stock-counter3" data-value="2345678"></div>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl md:text-6xl font-bold text-green-400/30 animate-float-slow animate-pulse-glow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${15 + i * 3}s`,
              }}
            >
              $
            </div>
          ))}
          {[...Array(6)].map((_, i) => (
            <div
              key={`euro-${i}`}
              className="absolute text-4xl md:text-6xl font-bold text-blue-400/30 animate-float-medium animate-pulse-glow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 2.5 + 3}s`,
                animationDuration: `${18 + i * 4}s`,
              }}
            >
              €
            </div>
          ))}
        </div>
      </div>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              T
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Tradeass
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex text-blue-700 dark:text-cyan-300 hover:bg-blue-100/50 dark:hover:bg-cyan-900/30"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={staggerContainer}
        className="pt-40 pb-32 px-6 md:px-12 lg:px-20 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-transparent to-cyan-100/40 dark:from-blue-950/60 dark:to-cyan-950/50 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 space-y-10 md:space-y-12">
          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-none animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
            Your Personal Trading Edge
            <br />
            <span className="text-gray-900 dark:text-white">Master Your Trading Psychology and Performance</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            The most powerful, private, offline-first trading journal. Track every trade, reflect deeply, analyze with precision, and turn data into consistent profits built for serious traders.
          </motion.p>
          <motion.div variants={fadeInUp} className="pt-6 md:pt-10 flex flex-col sm:flex-row gap-5 justify-center">
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
              className="text-lg md:text-xl px-10 md:px-14 py-6 md:py-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-cyan-950/30 rounded-2xl"
            >
              Sign In to Your Journal
            </Button>
          </motion.div>
          <motion.div variants={fadeInUp} className="pt-12 flex flex-wrap justify-center gap-6 md:gap-12 text-sm md:text-base text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
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
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
              <span>Supports 15+ Brokers</span>
            </div>
          </motion.div>
        </div>
      </motion.section>
      {/* Stats Bar */}
      <section className="py-16 px-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-y border-gray-200 dark:border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-cyan-400">1.4B+</p>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mt-2">Trades Tracked</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-cyan-400">120K+</p>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mt-2">Active Traders</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-cyan-400">4.9/5</p>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mt-2">Average Rating</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-cyan-400">99.9%</p>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mt-2">Uptime & Privacy</p>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg relative z-10"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Built for Traders Who Want Results
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Tradeass gives you everything modern traders need from deep analytics to psychological reflection in one clean, private app.
            </motion.p>
          </div>
          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 border border-blue-100 dark:border-cyan-900/50 shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      {/* How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg relative z-10"
      >
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              From First Trade to Consistent Profits
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Tradeass makes it simple to build better habits and sharper decisions — step by step.
            </motion.p>
          </div>
          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <motion.div variants={fadeInUp} className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-cyan-400 text-4xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sign Up & Setup
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Create account in seconds. Set starting balance, add brokers or import CSV. Create as many accounts as you trade.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-cyan-400 text-4xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Log Trades & Reflect
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Record every detail. Write daily journals, attach screenshots, rate confidence, tag setups build complete context.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-cyan-400 text-4xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Analyze Deeply
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Instant dashboards, 60+ reports, AI insights, pattern detection uncover what really drives your results.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-cyan-400 text-4xl font-bold shadow-lg">
                4
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Improve & Scale
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Take challenges, run backtests, get mentor feedback, track progress turn data into rules and consistent profits.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      {/* Supported Brokers */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-black relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
              Works With Your Broker
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-400 max-w-3xl mx-auto">
              Import trades automatically or manually from 15+ popular platforms.
            </motion.p>
          </div>
          <motion.div variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {brokers.map((broker, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-colors duration-300"
              >
                <p className="text-lg font-medium">{broker}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      {/* Testimonials / Wall of Love */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-gradient-to-b from-blue-900/95 to-black/95 text-white backdrop-blur-lg relative z-10"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Traders Trust Tradeass
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              Real results from real traders using Tradeass every day.
            </motion.p>
          </div>
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                animate={{ x: `-${activeTestimonial * 100}%` }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="flex"
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="min-w-full px-4">
                    <div className="bg-blue-800/60 backdrop-blur-md border border-blue-700/50 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-24 h-24 rounded-full border-4 border-blue-700 flex-shrink-0"
                        />
                        <div>
                          <div className="flex gap-1 mb-6">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-lg italic mb-6">
                            "{testimonial.text}"
                          </p>
                          <p className="font-semibold">{testimonial.name} • {testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="flex justify-center gap-3 mt-10">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    activeTestimonial === index
                      ? 'bg-cyan-500 scale-125'
                      : 'bg-gray-700 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>
      {/* Pricing Teaser */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg relative z-10"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Choose Your Plan
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Start free or upgrade for advanced features. Billed monthly or annually.
            </motion.p>
          </div>
          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <motion.div variants={fadeInUp} className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 border border-blue-100 dark:border-cyan-900/50 shadow-lg hover:shadow-xl transition-all group">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Free
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$0</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Forever</p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Basic trade tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Daily journals</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Offline access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Community support</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/register')}>
                Start Free
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-8 rounded-3xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-500 shadow-xl hover:shadow-2xl transition-all group relative">
              <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs px-3 py-1 rounded-bl-md">Popular</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Pro
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$19</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Per month</p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Everything in Free</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> 60+ advanced reports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> AI-powered insights</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Risk management tools</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Priority support</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/register')}>
                Get Pro
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 border border-emerald-500 shadow-lg hover:shadow-xl transition-all group">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Enterprise
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Custom</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Contact us</p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Multi-user teams</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Custom integrations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Dedicated account manager</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> On-premise deployment</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/contact')}>
                Contact Sales
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      {/* Blog Teaser */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg relative z-10"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Latest from Our Blog
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Expert tips, trading strategies, and insights to help you succeed in the markets.
            </motion.p>
          </div>
          <motion.div variants={staggerContainer} className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 border border-blue-100 dark:border-cyan-900/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="mb-4">
                <img src="https://thumbs.dreamstime.com/b/financial-money-trap-trading-mistakes-volatility-crypto-stock-market-risk-investment-ponzi-scheme-concept-novice-267062442.jpg" alt="5 Common Trading Mistakes and How to Avoid Them" className="w-full h-48 object-cover rounded-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                5 Common Trading Mistakes and How to Avoid Them
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Learn from experienced traders on how to identify and fix common pitfalls in your trading strategy.
              </p>
              <Button variant="link" className="p-0 text-blue-600 hover:text-blue-700">
                Read More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 border border-blue-100 dark:border-cyan-900/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="mb-4">
                <img src="https://thumbs.dreamstime.com/b/trading-journal-blank-pages-dice-financial-tracking-strategy-planning-close-up-open-featuring-data-entry-387043274.jpg" alt="The Power of Journaling in Trading Success" className="w-full h-48 object-cover rounded-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                The Power of Journaling in Trading Success
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Discover how consistent journaling can transform your trading performance and mindset.
              </p>
              <Button variant="link" className="p-0 text-blue-600 hover:text-blue-700">
                Read More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp} className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 border border-blue-100 dark:border-cyan-900/50 shadow-lg hover:shadow-xl transition-all group">
              <div className="mb-4">
                <img src="https://media.licdn.com/dms/image/v2/D4D12AQF4rZPmG1P0xA/article-cover_image-shrink_720_1280/B4DZcv_eWgHwAM-/0/1748856867015?e=2147483647&v=beta&t=DAmitDFbxtV1ODpv6H4YWJT3-U4Y1LDVjwqEmScQ_2o" alt="AI in Trading: Future or Present?" className="w-full h-48 object-cover rounded-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                AI in Trading: Future or Present?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Explore how AI is revolutionizing trading analytics and decision-making today.
              </p>
              <Button variant="link" className="p-0 text-blue-600 hover:text-blue-700">
                Read More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
          <div className="text-center">
            <Button variant="outline" className="text-lg px-8 py-4" onClick={() => navigate('/blog')}>
              View All Posts
            </Button>
          </div>
        </div>
      </motion.section>
      {/* Become a Partner */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-gradient-to-br from-purple-950 via-indigo-950 to-black relative z-10"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Become a Partner
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            We are looking for trading coaches, educators, prop firm affiliates, and influencers who want to offer their community a professional journaling solution.
          </motion.p>
          <motion.button variants={fadeInUp} onClick={() => navigate('/contact')} className="group px-10 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-2xl font-bold shadow-2xl shadow-purple-900/30 hover:shadow-purple-600/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-4 mx-auto">
            Apply as Partner
            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </motion.section>
      {/* Careers */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-gradient-to-br from-indigo-950 via-purple-950 to-black relative z-10"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            We're Hiring
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Join a team that's helping thousands of traders become more consistent and profitable.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-6">
            <button className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-lg font-medium transition-colors">
              View Open Positions
            </button>
            <button className="px-10 py-5 border border-indigo-500 text-indigo-400 hover:bg-indigo-900/30 rounded-xl text-lg font-medium transition-colors">
              Join Talent Network
            </button>
          </motion.div>
        </div>
      </motion.section>
      {/* Contact & Support */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-24 px-6 bg-black relative z-10"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-8">
              Get in Touch
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-10 leading-relaxed">
              Have questions about features, pricing, integrations, or partnership opportunities? Our team usually replies within 24 hours.
            </motion.p>
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="flex items-center gap-4 text-lg">
                <Mail className="w-7 h-7 text-cyan-400" />
                <span>support@tradeass.com</span>
              </div>
              <div className="flex items-center gap-4 text-lg">
                <MessageCircle className="w-7 h-7 text-purple-400" />
                <span>Live chat available 9 AM – 8 PM EST</span>
              </div>
              <div className="flex items-center gap-4 text-lg">
                <Phone className="w-7 h-7 text-emerald-400" />
                <span>+1 (555) 123-4567 (Mon–Fri)</span>
              </div>
            </motion.div>
          </div>
          <motion.div variants={fadeInUp} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-10">
            <h3 className="text-3xl font-bold mb-8 text-center">Quick Contact</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-5 py-4 bg-gray-950 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-5 py-4 bg-gray-950 border border-gray-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-lg font-bold hover:opacity-90 transition-opacity"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </motion.section>
      {/* Professional Footer */}
      <footer className="py-16 px-6 bg-black text-gray-400 border-t border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-12 text-center md:text-left">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                T
              </div>
              <span className="text-2xl font-bold text-white">Tradeass</span>
            </div>
            <p className="text-sm mb-6">The ultimate trading journal for serious traders. Private, powerful, and performance-driven.</p>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="https://twitter.com/tradeass" className="hover:text-white"><Twitter className="h-5 w-5" /></a>
              <a href="https://linkedin.com/company/tradeass" className="hover:text-white"><Linkedin className="h-5 w-5" /></a>
              <a href="https://github.com/tradeass" className="hover:text-white"><Github className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/changelog" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/partners" className="hover:text-white transition-colors">Partners</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/status" className="hover:text-white transition-colors">Status</a></li>
              <li><a href="/academy" className="hover:text-white transition-colors">Trading Academy</a></li>
              <li><a href="/wall-of-love" className="hover:text-white transition-colors">Wall of Love</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-12 border-t border-gray-800 text-center text-sm">
          © {new Date().getFullYear()} Tradeass. All rights reserved. Made with discipline and caffeine by traders, for traders.
        </div>
      </footer>
    </div>
  );
}
