import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider"; // ← This line is now safe
import {
  User,
  Bell,
  Shield,
  Database,
  Palette,
  LogOut,
  Trash2,
  Save,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const [accountName, setAccountName] = useState("Trader #1");
  const [email, setEmail] = useState("trader@example.com");

  const [notifications, setNotifications] = useState({
    dailySummary: true,
    tradeAlerts: true,
    challengeReminders: true,
  });

  const handleSaveProfile = () => {
    alert("Profile updated successfully!");
  };

  const handleClearData = () => {
    if (window.confirm("⚠️ This will delete ALL your trades, notes, challenges, and settings permanently.\n\nAre you absolutely sure?")) {
      localStorage.clear();
      alert("All data cleared. Page will reload...");
      window.location.reload();
    }
  };

  const handleLogout = () => {
    if (window.confirm("Log out now?")) {
      localStorage.removeItem("currentAccountId");
      window.location.href = "/login";
    }
  };

  return (
    <div
      className={`min-h-screen w-full p-4 sm:p-6 lg:p-8 transition-colors duration-300
        ${isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900"}`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="mt-3 text-lg opacity-80">
            Customize your trading environment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile */}
            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <User size={26} className="text-indigo-500" />
                Profile
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-90">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className={`w-full p-3 rounded-xl border ${
                      isDark
                        ? "bg-gray-800/80 border-gray-700 text-white"
                        : "bg-white/80 border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                    placeholder="e.g. Main Account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 opacity-90">
                    Email (for notifications)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 rounded-xl border ${
                      isDark
                        ? "bg-gray-800/80 border-gray-700 text-white"
                        : "bg-white/80 border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                    placeholder="you@example.com"
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                >
                  <Save size={18} className="mr-2" />
                  Save Profile
                </Button>
              </div>
            </Card>

            {/* Appearance */}
            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Palette size={26} className="text-purple-500" />
                Appearance
              </h2>

              <div className="flex flex-wrap gap-4">
                <Button
                  variant={isDark ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className={`min-w-[160px] ${isDark ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                >
                  Dark Mode
                </Button>

                <Button
                  variant={!isDark ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className={`min-w-[160px] ${!isDark ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                >
                  Light Mode
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-8">
            {/* Notifications */}
            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Bell size={26} className="text-amber-500" />
                Notifications
              </h2>

              <div className="space-y-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Daily summary email</span>
                  <input
                    type="checkbox"
                    checked={notifications.dailySummary}
                    onChange={() => setNotifications({ ...notifications, dailySummary: !notifications.dailySummary })}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>Trade execution alerts</span>
                  <input
                    type="checkbox"
                    checked={notifications.tradeAlerts}
                    onChange={() => setNotifications({ ...notifications, tradeAlerts: !notifications.tradeAlerts })}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span>Challenge reminders</span>
                  <input
                    type="checkbox"
                    checked={notifications.challengeReminders}
                    onChange={() => setNotifications({ ...notifications, challengeReminders: !notifications.challengeReminders })}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 rounded-2xl border-2 border-rose-500/40 bg-rose-950/10 dark:bg-rose-950/20 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-rose-500">
                <AlertCircle size={24} /> Danger Zone
              </h2>

              <div className="space-y-4">
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleClearData}
                >
                  <Trash2 size={18} className="mr-3" />
                  Clear All Data
                </Button>

                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-3" />
                  Log Out
                </Button>
              </div>

              <p className="text-xs opacity-70 mt-6 text-center">
                These actions cannot be undone
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
