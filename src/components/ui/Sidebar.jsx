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
  ChevronRight 
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
      className={`fixed top-12 left-0 h-[calc(100vh-3rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
        open ? "w-64" : "w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
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
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
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
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
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
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
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
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
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
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
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
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
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

        {/* Bottom section */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onCreateAccount}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="text-lg">+</span>
            {open && <span>New Account</span>}
          </button>

          {accounts.length > 0 && (
            <button
              onClick={onShowManage}
              className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings size={20} />
              {open && <span>Manage Accounts</span>}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
