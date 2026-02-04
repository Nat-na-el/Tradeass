// src/pages/Landing.jsx
import React from 'react';
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

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Animated Trading-Themed Background – more visible & thematic */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-black to-gray-950" />

        {/* Subtle chart grid with slow movement */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:60px_60px] animate-grid-move" />
        </div>

        {/* Faint rising/falling candlestick-style bars – bigger & more noticeable */}
        <div className="absolute inset-0 flex justify-around items-end opacity-20 md:opacity-15">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="w-5 sm:w-6 md:w-8 lg:w-10 bg-gradient-to-t from-transparent via-emerald-400/70 to-emerald-300/30 rounded-t-sm animate-candle-rise"
              style={{
                height: `${35 + Math.sin(i * 0.7) * 45 + 45}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${9 + i * 1.3}s`,
              }}
            />
          ))}
          {[...Array(14)].map((_, i) => (
            <div
              key={`red-${i}`}
              className="w-5 sm:w-6 md:w-8 lg:w-10 bg-gradient-to-b from-transparent via-red-400/60 to-red-300/20 rounded-b-sm animate-candle-fall"
              style={{
                height: `${30 + Math.cos(i * 0.9) * 40 + 35}%`,
                animationDelay: `${i * 0.9 + 3}s`,
                animationDuration: `${11 + i * 1.6}s`,
              }}
            />
          ))}
        </div>

        {/* Enhanced floating orbs with glow pulse – larger & more prominent */}
        <div className="absolute inset-0">
          <div className="absolute w-[700px] sm:w-[1000px] md:w-[1400px] h-[700px] sm:h-[1000px] md:h-[1400px] bg-gradient-to-br from-indigo-600/25 via-indigo-500/15 to-transparent rounded-full blur-3xl animate-float-slow left-[-25%] sm:left-[-15%] top-[-15%] animate-pulse-glow" />
          <div className="absolute w-[900px] sm:w-[1300px] md:w-[1800px] h-[900px] sm:h-[1300px] md:h-[1800px] bg-gradient-to-br from-purple-600/20 via-fuchsia-500/12 to-transparent rounded-full blur-3xl animate-float-medium right-[-30%] sm:right-[-20%] bottom-[-20%] animate-pulse-glow" style={{ animationDelay: '5s' }} />
          <div className="absolute w-[600px] sm:w-[900px] md:w-[1200px] h-[600px] sm:h-[900px] md:h-[1200px] bg-gradient-to-br from-cyan-500/18 via-emerald-400/10 to-transparent rounded-full blur-3xl animate-float-fast left-[10%] sm:left-[20%] bottom-[5%] animate-pulse-glow" style={{ animationDelay: '9s' }} />
        </div>

        {/* Very faint diagonal trend lines (growth / decline feel) */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(34,197,94,0.12)_50%,transparent_60%)] animate-trend-move" />
          <div className="absolute inset-0 bg-[linear-gradient(-135deg,transparent_40%,rgba(239,68,68,0.09)_50%,transparent_60%)] animate-trend-move-reverse" style={{ animationDelay: '7s' }} />
        </div>
      </div>

      {/* Fixed Header - Logo + Auth */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
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

      {/* Hero - Full bleed, centered */}
      <section className="pt-40 pb-32 px-6 md:px-12 lg:px-20 text-center relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-transparent to-purple-100/20 dark:from-indigo-950/30 dark:to-purple-950/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 space-y-10 md:space-y-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-none animate-fade-in">
            Your Personal Trading Edge
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
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
          <div className="pt-12 flex flex-wrap justify-center gap-6 md:gap-12 text-sm md:text-base text-gray-600 dark:text-gray-400">
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

      {/* Stats Bar */}
      <section className="py-16 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-y border-gray-200 dark:border-gray-800">
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

      {/* Features Grid - Light Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900">
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
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900 border border-indigo-100 dark:border-indigo-900/50 shadow-lg hover:shadow-xl transition-all group hover-lift">
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
            {/* (omitted here for brevity – copy them from your original file) */}
          </div>
        </div>
      </section>

      {/* How It Works - Numbered Steps */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              From First Trade to Consistent Profits
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Tradeass makes it simple to build better habits and sharper decisions — step by step.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* ... the 4 step cards remain the same ... */}
            {/* (omitted here for brevity – copy them from your original file) */}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-b from-indigo-900 to-black text-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Traders Trust Tradeass
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              Real results from real traders using Tradeass every day.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {/* ... the 3 testimonial cards remain the same ... */}
            {/* (omitted here for brevity – copy them from your original file) */}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-5xl md:text-7xl font-extrabold leading-tight">
            Ready to Trade Smarter?
          </h2>
          <p className="text-2xl md:text-3xl opacity-90 max-w-4xl mx-auto">
            Join thousands of traders using Tradeass to track, analyze, and win consistently. Start free today no card required.
          </p>
          <Button
            size="xl"
            onClick={() => navigate('/register')}
            className="bg-white text-indigo-700 hover:bg-gray-100 text-2xl md:text-3xl px-16 md:px-24 py-8 md:py-10 rounded-3xl shadow-2xl mt-8 transition-all"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer with Navigation */}
      <footer className="py-16 px-6 bg-black text-gray-400 text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <nav className="flex flex-wrap justify-center gap-6 md:gap-10 text-lg">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#blog" className="hover:text-white transition-colors">
              Blog
            </a>
            <a href="#support" className="hover:text-white transition-colors">
              Support
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms
            </a>
          </nav>
          <p className="text-sm">
            © {new Date().getFullYear()} Tradeass • All rights reserved • Built for traders who want an edge
          </p>
        </div>
      </footer>
    </div>
  );
}
