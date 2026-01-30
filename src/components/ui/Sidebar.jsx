import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Notebook as NotebookIcon,
  LineChart,
  Trophy,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Users,
} from "lucide-react";

export default function Sidebar({
  open,
  setOpen,
  accounts,
  currentAccount,
  onSwitchAccount,
  onCreateAccount,
  onShowManage,
}) {
  return (
    <aside
      className={`fixed top-12 left-0 h-[calc(100vh-3rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 overflow-hidden ${
        open ? "w-64" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-8 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                <LayoutDashboard size={20} />
                {open && <span>Dashboard</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/journal"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                <BookOpen size={20} />
                {open && <span>Daily Journal</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/trades"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                <BarChart3 size={20} />
                {open && <span>Trades</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/notebook"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                <NotebookIcon size={20} />
                {open && <span>Notebook</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                <LineChart size={20} />
                {open && <span>Reports</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/challenges"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                <Trophy size={20} />
                {open && <span>Challenges</span>}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/mentor"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                <Brain size={20} />
                {open && <span>Mentor Mode</span>}
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Bottom section - Account management */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {open ? (
            <>
              <button
                onClick={onCreateAccount}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition mb-2"
              >
                <PlusCircle size={18} />
                New Account
              </button>

              {accounts.length > 0 && (
                <button
                  onClick={onShowManage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition border border-gray-300 dark:border-gray-700"
                >
                  <Users size={18} />
                  Manage Accounts
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={onCreateAccount}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                title="New Account"
              >
                <PlusCircle size={20} />
              </button>
              {accounts.length > 0 && (
                <button
                  onClick={onShowManage}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition border border-gray-300 dark:border-gray-700"
                  title="Manage Accounts"
                >
                  <Users size={20} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
