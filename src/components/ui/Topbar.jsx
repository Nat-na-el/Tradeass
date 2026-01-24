import React from "react";
import { Sun, Moon, Settings } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "../../Theme-provider";

export default function Topbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-4 left-4 right-4 z-50 h-16 flex items-center justify-between px-6 bg-white/70 dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800 backdrop-blur-xl shadow-[0_4px_12px_rgba(75,94,170,0.3)] border border-gray-200/40 dark:border-gray-400/20 rounded-2xl transition-all duration-500">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white">
          TZ
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            TRADEASS
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-300 -mt-0.5">
            Trading Dashboard
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-gray-200/40 dark:hover:bg-indigo-600/30 transition"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-indigo-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-900" />
          )}
        </button>
        <Button className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white font-medium rounded-md">
          <Settings className="h-5 w-5 mr-2" />
          Settings
        </Button>
      </div>
    </header>
  );
}
