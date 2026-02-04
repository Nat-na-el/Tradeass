import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../Theme-provider";
import { User, Bell, Shield, Database, Palette, LogOut, Trash2, Save } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // Profile states
  const [accountName, setAccountName] = useState("Trader #1");
  const [email, setEmail] = useState("user@example.com");

  // Notification toggles
  const [notifications, setNotifications] = useState({
    dailySummary: true,
    tradeAlerts: true,
    challengeReminders: true,
  });

  const handleSaveProfile = () => {
    alert("Profile settings saved! (demo)");
  };

  const handleClearData = () => {
    if (window.confirm("This will delete ALL your local data. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogout = () => {
    if (window.confirm("Log out now?")) {
      localStorage.removeItem("currentAccountId");
      window.location.href = "/";
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
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="mt-3 text-lg opacity-80">
            Customize your experience • Manage data • Control preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile */}
            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <User size={24} className="text-indigo-500" /> Profile
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className={`w-full p-3 rounded-xl border ${
                      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 rounded-xl border ${
                      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                    } focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  />
                </div>

                <Button
                  onClick={handleSaveProfile}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save size={18} className="mr-2" /> Save Changes
                </Button>
              </div>
            </Card>

            {/* Appearance */}
            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Palette size={24} className="text-purple-500" /> Appearance
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

          {/* Sidebar actions */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="p-6 rounded-2xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Bell size={24} className="text-amber-500" /> Notifications
              </h2>

              <div className="space-y-5">
                {[
                  { key: "dailySummary", label: "Daily performance summary" },
                  { key: "tradeAlerts", label: "Trade execution alerts" },
                  { key: "challengeReminders", label: "Challenge progress reminders" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={() =>
                        setNotifications({
                          ...notifications,
                          [item.key]: !notifications[item.key],
                        })
                      }
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 rounded-2xl border-2 border-rose-500/40 bg-rose-950/10 dark:bg-rose-950/20 shadow-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-rose-500">
                <AlertTriangle size={24} /> Danger Zone
              </h2>

              <div className="space-y-4">
                <Button
                  variant="destructive"
                  className="w-full justify-start text-left"
                  onClick={handleClearData}
                >
                  <Trash2 size={18} className="mr-3" /> Clear All Local Data
                </Button>

                <Button
                  variant="destructive"
                  className="w-full justify-start text-left"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-3" /> Log Out
                </Button>
              </div>

              <p className="text-xs opacity-70 mt-6">
                Clearing data will remove all trades, notes, challenges, and settings.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
