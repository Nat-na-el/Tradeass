// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, BookOpen, LineChart, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header with Sign In / Sign Up */}
      <header className="w-full py-5 px-6 md:px-12 flex justify-end items-center gap-4 fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
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
          Sign Up
        </Button>
      </header>

      {/* Hero Section */}
      <section className="flex-1 pt-24 md:pt-32 pb-16 px-6 flex items-center justify-center text-center">
        <div className="max-w-4xl space-y-8 md:space-y-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Master Your Trading Journey
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            The ultimate private trading journal: Log trades, reflect daily, analyze deeply, and grow your edge — all offline, all yours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 rounded-xl shadow-xl group"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl"
            >
              Already have an account?
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12 md:mb-16">
            Everything You Need to Succeed
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
              <BarChart3 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold mb-3">Trade Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">Detailed logging with metrics, P&L, tags and filtering</p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
              <BookOpen className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold mb-3">Daily Journal</h3>
              <p className="text-gray-600 dark:text-gray-400">Rich text editor with mood & strategy reflection</p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
              <LineChart className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold mb-3">Performance Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">Equity curves, win rate, drawdown & custom reports</p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
              <Zap className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold mb-3">AI Insights</h3>
              <p className="text-gray-600 dark:text-gray-400">Pattern detection, risk assessment & improvement tips</p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
              <Users className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold mb-3">Community Challenges</h3>
              <p className="text-gray-600 dark:text-gray-400">Join goals, share stats, learn from other traders</p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
              <ArrowRight className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold mb-3">Offline & Private</h3>
              <p className="text-gray-600 dark:text-gray-400">All data stays in your browser — no cloud required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 px-6 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-8 md:mb-12">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            One plan. Everything included. No hidden fees.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all">
              <h3 className="text-2xl font-bold text-center mb-4">Free</h3>
              <p className="text-4xl md:text-5xl font-extrabold text-center mb-2">$0</p>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-8">forever</p>

              <ul className="space-y-4 text-gray-700 dark:text-gray-300 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Unlimited accounts
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Trade & journal logging
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Basic reports & analytics
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Offline access
                </li>
              </ul>

              <Button
                onClick={() => navigate('/register')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Get Started Free
              </Button>
            </div>

            {/* Pro Plan (highlighted) */}
            <div className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl border-2 border-indigo-400 transform scale-105 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-800 text-white text-xs font-bold px-4 py-1 rounded-full">
                RECOMMENDED
              </span>
              <h3 className="text-2xl font-bold text-center mb-4">Pro</h3>
              <p className="text-4xl md:text-5xl font-extrabold text-center mb-2">$9</p>
              <p className="text-center opacity-90 mb-8">per month</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  Everything in Free
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  Advanced AI insights
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  Unlimited backtests
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  Priority support
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                  Export to CSV/PDF
                </li>
              </ul>

              <Button
                onClick={() => navigate('/register')}
                className="w-full bg-white hover:bg-gray-100 text-indigo-600 font-bold text-lg py-6 rounded-xl"
              >
                Upgrade to Pro
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all">
              <h3 className="text-2xl font-bold text-center mb-4">Enterprise</h3>
              <p className="text-4xl md:text-5xl font-extrabold text-center mb-2">Custom</p>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-8">contact us</p>

              <ul className="space-y-4 text-gray-700 dark:text-gray-300 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Team accounts
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  On-premise option
                </li>
              </ul>

              <Button
                onClick={() => window.location.href = 'mailto:support@tradeass.app'}
                variant="outline"
                className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 px-6 bg-indigo-600 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl md:text-2xl opacity-90">
            Join thousands of traders improving their performance every day.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-white hover:bg-gray-100 text-indigo-600 text-lg px-12 py-7 rounded-xl shadow-2xl"
          >
            Start Your Free Trial Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>© {new Date().getFullYear()} Tradeass. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="mailto:support@tradeass.app" className="hover:underline">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
