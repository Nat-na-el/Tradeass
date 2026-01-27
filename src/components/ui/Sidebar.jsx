import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Activity,
  FileText,
  BarChart3,
  Trophy,
  Users,
  Settings,
  Calculator,
  UserPlus,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../../Theme-provider";
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust path if needed
export default function Sidebar({
  open,
  setOpen,
  accounts,
  currentAccount,
  onSwitchAccount,
  onCreateAccount,
  onShowManage,
}) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setOpen((prev) => !prev);
    setIsAccountDropdownOpen(false);
  };
const handleLogout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('currentAccountId');
    window.location.href = '/login';
  } catch (err) {
    console.error('Logout error:', err);
  }
};
  const toggleAccountDropdown = () => {
    if (open) {
      setIsAccountDropdownOpen(!isAccountDropdownOpen);
    }
  };

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/journal", icon: BookOpen, label: "Daily Journal" },
    { to: "/trades", icon: Activity, label: "Trades" },
    { to: "/notebook", icon: FileText, label: "Notebook" },
    { to: "/reports", icon: BarChart3, label: "Reports" },
    { to: "/challenges", icon: Trophy, label: "Challenges" },
    { to: "/mentor", icon: Users, label: "Mentor Mode" },
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/backtest", icon: Calculator, label: "Backtest" },
  ];

  return (
    <div
      className={`fixed left-8 top-20 h-[calc(100vh-2.5rem)] bg-gray-900 dark:bg-gray-800 border-r border-gray-800 shadow-2xl transition-all duration-300 z-[1000] ${
        open ? "w-48" : "w-16"
      } ${theme === "dark" ? "dark" : ""}`}
      style={{
        minWidth: open ? "12rem" : "4rem",
        boxShadow: "4px 0 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end p-3 pt-2">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-all duration-300 flex items-center justify-center"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* ✅ PERFECT ACCOUNT SECTION - SMALLER FONT */}
        <div className="p-3 border-b border-gray-700">
          {/* CURRENT ACCOUNT DISPLAY */}
          <div
            className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
              open ? "justify-between" : "justify-center"
            }`}
            onClick={toggleAccountDropdown}
          >
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {currentAccount?.name?.charAt(0) || "A"}
              </span>
            </div>
            {open && (
              <>
                <div className="min-w-0 flex-1">
                  {/* ✅ SMALLER FONT - text-xs */}
                  <div className="text-xs font-medium text-gray-200">
                    {currentAccount?.name || "Account"}
                  </div>
                </div>
                <div className="flex items-center">
                  {isAccountDropdownOpen ? (
                    <ChevronUp size={14} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={14} className="text-gray-400" />
                  )}
                </div>
              </>
            )}
          </div>

          {/* ✅ ACCOUNT DROPDOWN - SMALLER FONT */}
          {open && isAccountDropdownOpen && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {/* ALL ACCOUNTS - SELECTED HIGHLIGHT */}
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => {
                    onSwitchAccount(account.id);
                    setIsAccountDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded text-xs font-normal ${
                    currentAccount?.id === account.id
                      ? "bg-gray-700 text-white border-l-2 border-gray-300"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {account.name}
                </button>
              ))}

              {/* ✅ BUTTONS - NORMAL GRAY */}
              <div className="pt-2 border-t border-gray-600 space-y-1">
                <button
                  onClick={() => {
                    onCreateAccount();
                    setIsAccountDropdownOpen(false);
                  }}
                  className="w-full p-2 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded"
                >
                  + New Account
                </button>
                <button
                  onClick={() => {
                    onShowManage();
                    setIsAccountDropdownOpen(false);
                  }}
                  className="w-full p-2 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded"
                >
                  Manage Accounts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-gray-700 text-white shadow-inner"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                } ${
                  open ? "justify-start pl-3" : "justify-center items-center"
                }`.trim()
              }
              style={{
                marginBottom: index < navItems.length - 1 ? "2px" : "0",
                minHeight: "48px",
              }}
            >
              <item.icon
                size={open ? 20 : 24}
                className={`flex-shrink-0 ${open ? "mr-3" : "mx-auto"}`}
              />
              {open && (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
