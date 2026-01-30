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
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Fixed Top Bar - Auth + Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Tradeass
            </span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
              Sign Up Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Full width, centered */}
      <section className="pt-40 pb-32 px-6 text-center relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 via-transparent to-purple-100/30 dark:from-indigo-950/20 dark:to-purple-950/20 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
            Master Your Trading Edges
          </h1>

          <p className="text-xl md:text-3xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            The most powerful, private, and intuitive trading journal ever built. Track every trade, reflect deeply, analyze with precision, and grow consistently — all offline, all yours.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="xl"
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl px-12 py-8 rounded-2xl shadow-2xl group transition-all duration-300"
            >
              Start Your Free Journey
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Button>

            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-xl px-12 py-8 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-2xl"
            >
              Already a Trader? Sign In
            </Button>
          </div>

          {/* Trust signals */}
          <div className="pt-12 flex flex-wrap justify-center gap-8 text-gray-600 dark:text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span>100% Private • Offline-First</span>
            </div>
            <div className="flex items-center gap-2">
              <Infinity className="h-5 w-5 text-indigo-500" />
              <span>Unlimited Trades & Journals</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span>Instant Setup • No Credit Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Metrics Bar */}
      <section className="py-16 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400">1.2B+</p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">Trades Journaled</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400">85K+</p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">Active Traders</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400">4.9/5</p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">User Rating</p>
          </div>
          <div>
            <p className="text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-400">99.9%</p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">Uptime & Privacy</p>
          </div>
        </div>
      </section>

      {/* Core Features - Dark Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold">
              Everything You Need to Trade Better
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tradeass combines powerful journaling, deep analytics, AI insights, and privacy-first design — all in one beautiful app.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm hover:border-indigo-500 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Trade Tracking & Execution</h3>
              <p className="text-gray-300 leading-relaxed">
                Log trades manually, import CSV, or sync with supported brokers. Capture entry/exit price, size, fees, tags, screenshots, and execution notes — all in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm hover:border-indigo-500 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-6">
                <LineChart className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Advanced Analytics & Reports</h3>
              <p className="text-gray-300 leading-relaxed">
                60+ built-in reports: PNL curves, win rate by setup, risk-reward ratios, time-of-day performance, drawdowns, expectancy, and more. Export to CSV/PDF anytime.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm hover:border-indigo-500 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Daily Journals & Reflections</h3>
              <p className="text-gray-300 leading-relaxed">
                Structured daily entries with mood tracking, confidence levels, market context, and free-form notes. Review past reflections to spot recurring psychological patterns.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm hover:border-indigo-500 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-green-600/20 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI-Powered Insights</h3>
              <p className="text-gray-300 leading-relaxed">
                Get smart suggestions: "Your win rate drops 18% after 3pm", "This setup has 2.1 R:R but only 42% win rate", pattern detection, and personalized improvement tips.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm hover:border-indigo-500 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-600/20 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Risk & Position Management</h3>
              <p className="text-gray-300 leading-relaxed">
                Built-in risk calculator, position sizing, stop/target suggestions, max drawdown alerts, and equity curve monitoring to protect your capital.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm hover:border-indigo-500 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-pink-600/20 flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">100% Private & Offline</h3>
              <p className="text-gray-300 leading-relaxed">
                No servers, no data collection, no subscriptions. All your data stays in your browser — work offline, sync when you want, full control forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold">
              From Zero to Profitable — In 4 Steps
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tradeass guides you from your first trade to consistent profitability with a simple, powerful workflow.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-indigo-600/30 hidden md:block transform -translate-x-1/2" />

            <div className="space-y-24">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 relative">
                <div className="md:w-1/2 md:text-right space-y-4">
                  <div className="text-6xl font-bold text-indigo-500">01</div>
                  <h3 className="text-3xl font-bold">Sign Up & Set Up</h3>
                  <p className="text-gray-300 text-lg">
                    Create your account in 30 seconds. Set starting balance, connect broker (optional), or start manually. Add multiple accounts for different strategies.
                  </p>
                </div>
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold relative z-10">
                  1
                </div>
                <div className="md:w-1/2 md:text-left space-y-4">
                  {/* Empty on desktop for symmetry */}
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 relative">
                <div className="md:w-1/2 md:text-left space-y-4">
                  <div className="text-6xl font-bold text-indigo-500">02</div>
                  <h3 className="text-3xl font-bold">Log Every Trade & Thought</h3>
                  <p className="text-gray-300 text-lg">
                    Auto-import or manual entry. Capture screenshots, notes, emotions, setup type, market context. Write daily reviews to build self-awareness.
                  </p>
                </div>
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold relative z-10">
                  2
                </div>
                <div className="md:w-1/2 md:text-right space-y-4">
                  {/* Empty */}
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 relative">
                <div className="md:w-1/2 md:text-right space-y-4">
                  <div className="text-6xl font-bold text-indigo-500">03</div>
                  <h3 className="text-3xl font-bold">Analyze & Discover</h3>
                  <p className="text-gray-300 text-lg">
                    Instant dashboards, 60+ reports, equity curves, heatmaps, win/loss streaks. AI highlights patterns like "You lose 22% more on Fridays".
                  </p>
                </div>
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold relative z-10">
                  3
                </div>
                <div className="md:w-1/2 md:text-left space-y-4">
                  {/* Empty */}
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 relative">
                <div className="md:w-1/2 md:text-left space-y-4">
                  <div className="text-6xl font-bold text-indigo-500">04</div>
                  <h3 className="text-3xl font-bold">Improve & Scale</h3>
                  <p className="text-gray-300 text-lg">
                    Run backtests, take challenges, get mentor feedback, track progress. Turn insights into rules and scale your profitable edge.
                  </p>
                </div>
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold relative z-10">
                  4
                </div>
                <div className="md:w-1/2 md:text-right space-y-4">
                  {/* Empty */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-black to-gray-900 text-white">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold">
              Traders Love Tradeass
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join thousands who turned chaotic trading into consistent profitability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg italic mb-6">
                "This is the best journal I've used. The AI insights alone saved me thousands in bad trades."
              </p>
              <p className="font-semibold">Sarah K. • Prop Trader</p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg italic mb-6">
                "Offline mode + privacy is unbeatable. I finally have a journal I trust 100%."
              </p>
              <p className="font-semibold">Mike T. • Crypto Scalper</p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg italic mb-6">
                "From breakeven to consistent green months — Tradeass changed everything."
              </p>
              <p className="font-semibold">Alex R. • Futures Trader</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-5xl md:text-7xl font-bold leading-tight">
            Ready to Become a Better Trader?
          </h2>
          <p className="text-2xl md:text-3xl opacity-90">
            Start your free journey today. No credit card required. Cancel anytime.
          </p>
          <Button
            size="xl"
            onClick={() => navigate('/register')}
            className="bg-white text-indigo-700 hover:bg-gray-100 text-2xl px-16 py-9 rounded-3xl shadow-2xl mt-8"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-black text-gray-400 text-center border-t border-gray-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-wrap justify-center gap-8 text-lg">
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
          </div>

          <p className="text-sm">
            © {new Date().getFullYear()} Tradeass • All rights reserved • Built for traders, by traders
          </p>
        </div>
      </footer>
    </div>
  );
}
