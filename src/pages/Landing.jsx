// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, BookOpen, LineChart, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Top-right Auth Buttons */}
      <header className="w-full py-6 px-6 md:px-12 flex justify-end items-center gap-4">
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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text + CTA */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Master Your Trading Journey
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">
              Track every trade, reflect daily, analyze deeply — all in a beautiful, private journal built for serious traders.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                <span>Trade tracking & analytics</span>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                <span>Daily journal & notes</span>
              </div>
              <div className="flex items-start gap-3">
                <LineChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                <span>Performance reports</span>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                <span>Quantitative edge tools</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-7 rounded-2xl shadow-xl group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="text-lg px-10 py-7 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-2xl"
              >
                Already a member? Sign In
              </Button>
            </div>
          </div>

          {/* Right: Visual hint / illustration placeholder */}
          <div className="hidden md:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-900/50 aspect-[4/5]">
              {/* You can replace this with an actual screenshot or illustration */}
              <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20 text-indigo-500">
                📈
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                  Your trading story starts here
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800">
        © {new Date().getFullYear()} Tradeass • Private • Offline-first • Made for traders who care
      </footer>
    </div>
  );
}
