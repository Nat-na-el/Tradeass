// ✅ All imports at the top
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/ui/Sidebar";
import Topbar from "./components/ui/Topbar";

// ✅ Import pages
import Dashboard from "./pages/Dashboard";
import DailyJournal from "./pages/DailyJournal";
import Trades from "./pages/Trades";
import Notebook from "./pages/Notebook";
import Reports from "./pages/Reports";
import Challenges from "./pages/Challenges";
import MentorMode from "./pages/MentorMode";
import SettingsPage from "./pages/SettingsPage";

// ✅ FloatingWidgets defined outside of App
function FloatingWidgets({ overallStats }) {
  const location = useLocation();

  // ✅ Only show on Dashboard
  if (location.pathname !== "/") return null;

  return (
    <div className="fixed right-10 top-[11rem] flex flex-col gap-4 z-[9999] w-[280px] transition-all duration-300">
      {/* Account Balance & P&L */}
      <div className="backdrop-blur-2xl border rounded-xl p-4 shadow-md text-slate-800 dark:text-white/90 transition-all duration-300 bg-white/20 border-slate-300/40 dark:bg-white/5 dark:border-white/10">
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#141c2b]/70">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total Net PnL
          </div>
          <div
            className={`text-2xl font-bold ${
              overallStats.totalPnL >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            ${overallStats.totalPnL.toFixed(2)}
          </div>
        </div>
      </div>
      {/* Trade Win % */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#141c2b]/70">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Win Rate
        </div>
        <div className="text-2xl font-bold text-blue-500">
          {overallStats.winRate}%
        </div>
      </div>
      {/* profit factor */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#141c2b]/70">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Profit Factor
        </div>
        <div className="text-2xl font-bold text-indigo-500">
          {overallStats.profitFactor}
        </div>
      </div>
      {/* Add Widget */}{" "}
      <div className="backdrop-blur-2xl border border-dashed rounded-xl p-4 text-center transition cursor-pointer shadow-sm bg-white/10 border-slate-400/40 text-slate-600 hover:bg-white/20 dark:bg-white/5 dark:border-white/20 dark:text-slate-300 dark:hover:bg-white/10">
        {" "}
        + Add Widget{" "}
      </div>
    </div>
  );
}

export default function App() {
  const [open, setOpen] = useState(true);

  // Dummy stats for now
  const overallStats = {
    totalPnL: 0,
    profitFactor: 0,
    winRate: 0,
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-white dark:bg-[#0a1120] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar open={open} setOpen={setOpen} />

        {/* Main Section */}
        <div
          className="flex-1 transition-all duration-500 ease-in-out relative"
          style={{
            marginLeft: open ? "15.75rem" : "8rem",
            transition: "margin-left 0.4s ease-in-out",
          }}
        >
          {/* Topbar */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <Topbar />
          </div>

          {/* Scrollable Page Content */}
          <main
            className="overflow-y-auto overflow-x-hidden relative"
            style={{
              height: "100vh",
              paddingTop: "6rem",
              clipPath: "inset(6rem 0 0 0)",
            }}
          >
            <div
              className="bg-white dark:bg-[#0f1724] backdrop-blur-md border border-slate-300 dark:border-white/10 rounded-2xl shadow-xl p-6 text-slate-900 dark:text-white mx-6 mb-6 transition-colors duration-300"
              style={{ minHeight: "calc(100vh - 7rem)" }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/journal" element={<DailyJournal />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/notebook" element={<Notebook />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/mentor" element={<MentorMode />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* ✅ Floating Widgets only appear on Dashboard */}
        <FloatingWidgets overallStats={overallStats} />
      </div>
    </Router>
  );
}
