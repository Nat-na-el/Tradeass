// src/components/Sidebar.jsx
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../Theme-provider";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc } from "firebase/firestore";

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
  const [localAccounts, setLocalAccounts] = useState(accounts || []);

  useEffect(() => {
    setLocalAccounts(accounts || []);
  }, [accounts]);

  const toggleSidebar = () => {
    setOpen((prev) => !prev);
    setIsAccountDropdownOpen(false);
  };

  const toggleAccountDropdown = () => {
    if (open) {
      setIsAccountDropdownOpen(!isAccountDropdownOpen);
    }
  };

  const createNewAccount = async () => {
    const name = prompt("Enter account name (e.g., Live EURUSD, Demo NAS100):");
    if (!name) return;

    const balanceStr = prompt("Enter starting balance (USD):");
    const startingBalance = parseFloat(balanceStr);
    if (isNaN(startingBalance) || startingBalance < 0) {
      alert("Please enter a valid starting balance.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to create an account.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "accounts"), {
        name: name.trim(),
        starting_balance: startingBalance,
        current_balance: startingBalance,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });

      const newAccount = {
        id: docRef.id,
        name: name.trim(),
        starting_balance: startingBalance,
        current_balance: startingBalance,
      };

      setLocalAccounts((prev) => [...prev, newAccount]);
      onSwitchAccount(docRef.id);
      alert(`Account "${name}" created successfully with $${startingBalance} starting balance!`);
    } catch (err) {
      console.error("Account creation failed:", err);
      alert("Failed to create account: " + err.message);
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
      className={`fixed left-0 top-0 h-full 
        bg-amber-50 dark:bg-gray-900 
        border-r border-amber-200/80 dark:border-gray-800 
        shadow-2xl transition-all duration-300 z-[1000] ${
          open ? "w-64" : "w-16"
        } ${theme === "dark" ? "dark" : ""}`}
      style={{
        minWidth: open ? "16rem" : "4rem",
        boxShadow: "4px 0 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end p-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-all duration-300 flex items-center justify-center"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ACCOUNT SECTION */}
        <div className="p-4 border-b border-amber-200/80 dark:border-gray-700">
          <div
            className={`flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-gray-800/50 transition-colors ${
              open ? "justify-between" : "justify-center"
            }`}
            onClick={toggleAccountDropdown}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white text-sm font-bold">
                {currentAccount?.name?.charAt(0) || "A"}
              </span>
            </div>
            {open && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-200 truncate">
                    {currentAccount?.name || "Select Account"}
                  </div>
                  <div className="text-xs text-gray-400">
                    ${currentAccount?.current_balance?.toLocaleString() || "0.00"}
                  </div>
                </div>
                <div className="flex items-center">
                  {isAccountDropdownOpen ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </>
            )}
          </div>

          {/* ACCOUNT DROPDOWN */}
          {open && isAccountDropdownOpen && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {localAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => {
                    onSwitchAccount(account.id);
                    setIsAccountDropdownOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                    currentAccount?.id === account.id
                      ? "bg-indigo-600/20 border-l-4 border-indigo-500 text-white"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <div className="font-medium truncate">{account.name}</div>
                  <div className="text-xs opacity-70">
                    ${account.current_balance?.toLocaleString() || "0.00"}
                  </div>
                </button>
              ))}

              <div className="pt-4 border-t border-gray-700 space-y-2">
                <button
                  onClick={() => {
                    createNewAccount();
                    setIsAccountDropdownOpen(false);
                  }}
                  className="w-full p-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-md transition-all"
                >
                  + Create New Account
                </button>
                <button
                  onClick={() => {
                    onShowManage();
                    setIsAccountDropdownOpen(false);
                  }}
                  className="w-full p-3 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  Manage Accounts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-600/20 text-white border-l-4 border-indigo-500 shadow-inner"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                } ${open ? "justify-start pl-4" : "justify-center"}`
              }
            >
              <item.icon
                size={open ? 22 : 26}
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
