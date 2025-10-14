// src/components/ui/Topbar.jsx
import React from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "./button";
import useTheme from "../../hooks/useTheme";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="fixed top-4 left-4 right-4 z-50 h-16 flex items-center justify-between px-6
                 bg-white/70 dark:bg-[#0f1724]/80 backdrop-blur-xl shadow-lg border 
                 border-white/40 dark:border-white/10 rounded-2xl transition-all duration-500"
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center font-bold text-white">
          TZ
        </div>
        <div>
          <div className="text-sm font-semibold text-[#0f1724] dark:text-white">
            TRADEASS
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
            Trading Journal
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-slate-200/40 dark:hover:bg-white/10 transition"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-[#0f1724]" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400" />
          )}
        </button>

        {/* Notification Bell */}
        <button className="p-2 rounded-md hover:bg-slate-200/40 dark:hover:bg-white/10 transition">
          <Bell className="h-5 w-5 text-[#0f1724] dark:text-white" />
        </button>

        {/* Gradient Button */}
        <Button className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-medium rounded-md">
          Get Started
        </Button>

        {/* User Name */}
        <div className="text-sm font-medium text-[#0f1724] dark:text-white">
          Natourduc
        </div>
      </div>
    </header>
  );
}
