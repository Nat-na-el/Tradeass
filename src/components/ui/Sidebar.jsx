import React, { useState } from "react";
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
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

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
      localStorage.removeItem("currentAccountId");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
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
      className={`
        fixed left-0 top-16 bottom-0 z-[999] transition-all duration-300
        border-r shadow-xl
        ${open ? "w-64" : "w-16"}
        bg-amber-50 dark:bg-gray-950
        border-amber-200/80 dark:border-gray-800
        text-amber-950 dark:text-gray-100
      `}
    >
      <div className="flex flex-col h-full">
        {/* Toggle button */}
        <div className="flex items-center justify-end p-3 pt-2">
          <button
            onClick={toggleSidebar}
            className={`
              p-2.5 rounded-lg transition-all duration-200
              bg-amber-100/60 dark:bg-gray-800
              hover:bg-amber-200/60 dark:hover:bg-gray-700
              text-amber-800 dark:text-gray-300
              focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:focus:ring-indigo-500/40
            `}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Account Section */}
        <div className="p-3 border-b border-amber-200/80 dark:border-gray-800">
          <div
            className={`
              flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer
              ${open ? "justify-between" : "justify-center"}
              hover:bg-amber-100/60 dark:hover:bg-gray-800
              transition-colors duration-200
            `}
            onClick={toggleAccountDropdown}
          >
            <div className="w-9 h-9 bg-amber-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-amber-900 dark:text-gray-200 text-sm font-bold">
                {currentAccount?.name?.charAt(0) || "A"}
              </span>
            </div>

            {open && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-amber-900 dark:text-gray-200 truncate">
                    {currentAccount?.name || "Account"}
                  </div>
                </div>
                <div className="flex items-center">
                  {isAccountDropdownOpen ? (
                    <ChevronUp size={16} className="text-amber-700 dark:text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-amber-700 dark:text-gray-400" />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Account Dropdown */}
          {open && isAccountDropdownOpen && (
            <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => {
                    onSwitchAccount(account.id);
                    setIsAccountDropdownOpen(false);
                  }}
                  className={`
                    w-full text-left p-2.5 rounded-lg text-sm font-normal transition-colors duration-200
                    ${
                      currentAccount?.id === account.id
                        ? "bg-amber-200/70 dark:bg-gray-700 text-amber-900 dark:text-white font-medium border-l-2 border-amber-500 dark:border-indigo-500"
                        : "text-amber-800 dark:text-gray-300 hover:bg-amber-100/60 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  {account.name}
                </button>
              ))}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-amber-200/80 dark:border-gray-800 space-y-1.5">
                <button
                  onClick={() => {
                    onCreateAccount();
                    setIsAccountDropdownOpen(false);
                  }}
                  className="w-full p-2.5 text-sm bg-amber-100 hover:bg-amber-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-amber-900 dark:text-gray-200 rounded-lg transition-colors"
                >
                  + New Account
                </button>
                <button
                  onClick={() => {
                    onShowManage();
                    setIsAccountDropdownOpen(false);
                  }}
                  className="w-full p-2.5 text-sm bg-amber-100 hover:bg-amber-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-amber-900 dark:text-gray-200 rounded-lg transition-colors"
                >
                  Manage Accounts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `
                  flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200
                  ${
                    isActive
                      ? "bg-amber-200/60 dark:bg-gray-800 text-amber-900 dark:text-white shadow-inner"
                      : "text-amber-800 dark:text-gray-300 hover:bg-amber-100/60 dark:hover:bg-gray-800"
                  }
                  ${open ? "justify-start pl-3" : "justify-center"}
                `
              }
              style={{ minHeight: "44px" }}
            >
              <item.icon
                size={open ? 20 : 22}
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

        {/* Bottom logout (optional - only shown when sidebar is open) */}
        {open && (
          <div className="p-3 border-t border-amber-200/80 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className={`
                w-full p-2.5 text-sm rounded-lg transition-colors duration-200
                text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-950/30
                flex items-center justify-center gap-2
              `}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
