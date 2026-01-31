import React, { useState } from "react";
import { Sun, Moon, Settings, LogOut } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "../../Theme-provider"; // adjust path if needed
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Get current account name safely
  const currentId = localStorage.getItem("currentAccountId");
  const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
  const currentAccount = accounts.find(acc => acc.id === currentId);
  const accountName = currentAccount ? currentAccount.name : "Guest";

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    localStorage.removeItem("currentAccountId");

    // Force full navigation to landing + reload to avoid race condition
    window.location.replace("/");
    // Reload is fallback — usually not reached, but ensures no dashboard flash
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <>
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
          {/* Account name */}
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-md">
            {accountName}
          </div>

          {/* Theme toggle */}
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

          {/* Settings */}
          <Button className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white font-medium rounded-md">
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Button>

          {/* Logout - opens dialog */}
          <Button
            variant="destructive"
            onClick={() => setShowLogoutDialog(true)}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium rounded-md"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md bg-white text-slate-900 dark:bg-[#0f1724] dark:text-white border border-slate-300 dark:border-[#B78727]/20 rounded-2xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-slate-200">
              Are you sure you want to log out?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="border border-slate-400 dark:border-[#B78727]/20 text-slate-900 dark:text-white bg-white dark:bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogoutConfirm}
              className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
            >
              Yes, Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
