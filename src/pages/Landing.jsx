// src/pages/Landing.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Top Bar with Login Button */}
      <header className="w-full py-6 px-8 flex justify-end items-center">
        <Button
          onClick={() => navigate('/login')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg shadow-md"
        >
          Login
        </Button>
      </header>

      {/* Hero / Welcome Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Welcome to Tradeass
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Your personal trading journal & performance tracker. Log trades, analyze patterns, keep journals, and improve your edge — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg"
            >
              Get Started – Login
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="text-lg px-10 py-6 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl"
            >
              Learn More
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        © {new Date().getFullYear()} Tradeass. All rights reserved.
      </footer>
    </div>
  );
}
