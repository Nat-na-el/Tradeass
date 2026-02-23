import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
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
import { useTheme } from "../../Theme-provider";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

export default function Sidebar({
  open,
  setOpen,
  accounts = [],
  currentAccount,
  onSwitchAccount,
  onCreateAccount,
  onShowManage,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const hasCheckedDefault = useRef(false);

  // Auto-create default account on first login if none exist
  useEffect(() => {
    const checkAndCreateDefault = async () => {
      const user = auth.currentUser;
      if (!user || hasCheckedDefault.current || accounts.length > 0) return;

      hasCheckedDefault.current = true;

      try {
        // Double-check in Firestore (in case state not yet updated)
        const accsRef = collection(db, "users", user.uid, "accounts");
        const snapshot = await getDocs(accsRef);
        if (snapshot.empty) {
          const defaultData = {
            name: "Main Account",
            starting_balance: 10000,
            current_balance: 10000,
            createdAt: serverTimestamp(),
            createdBy: user.uid,
          };

          const docRef = await addDoc(accsRef, defaultData);
          const newAcc = { id: docRef.id, ...defaultData };
          onCreateAccount(newAcc);
          onSwitchAccount(docRef.id);
        }
      } catch (err) {
        console.error("Auto-create default failed:", err);
      }
    };

    checkAndCreateDefault();
  }, [accounts, onCreateAccount, onSwitchAccount]);

  const toggleSidebar = () => {
    setOpen(!open);
    setIsAccountDropdownOpen(false);
  };

  const toggleAccountDropdown = () => {
    if (open) setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const handleCreate = async () => {
    setCreateError("");
    const name = newName.trim();
    const balance = Number(newBalance);

    if (!name) return setCreateError("Account name is required");
    if (isNaN(balance) || balance <= 0) return setCreateError("Enter valid positive balance");

    setCreating(true);

    const user = auth.currentUser;
    if (!user) {
      setCreateError("You must be logged in");
      setCreating(false);
      return;
    }

    try {
      const data = {
        name,
        starting_balance: balance,
        current_balance: balance,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      };

      const docRef = await addDoc(collection(db, "users", user.uid, "accounts"), data);
      const newAcc = { id: docRef.id, ...data };

      onCreateAccount(newAcc);
      onSwitchAccount(docRef.id);

      setNewName("");
      setNewBalance("");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      setCreateError("Failed to create account");
    } finally {
      setCreating(false);
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
    <>
      <div
        className={`fixed left-8 top-20 h-[calc(100vh-5rem)] 
          bg-amber-50 dark:bg-gray-900 
          border-r border-amber-200/80 dark:border-gray-800 
          shadow-2xl transition-all duration-300 z-40
          ${open ? "w-64" : "w-20"}`}
        style={{ minWidth: open ? "16rem" : "5rem" }}
      >
        <div className="flex flex-col h-full">
          {/* Toggle */}
          <div className="flex justify-end p-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Account Header */}
          <div className="px-4 pb-4 border-b border-amber-200/60 dark:border-gray-700">
            <div
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-800/50 ${
                open ? "justify-between" : "justify-center"
              }`}
              onClick={toggleAccountDropdown}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">
                  {currentAccount?.name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>

              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {currentAccount?.name || "No Account"}
                  </p>
                  {currentAccount?.starting_balance !== undefined && (
                    <p className="text-xs text-gray-400">
                      ${Number(currentAccount.starting_balance).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {open && (isAccountDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
            </div>

            {/* Dropdown */}
            {open && isAccountDropdownOpen && (
              <div className="mt-3 bg-gray-800/95 border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                {accounts.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-400">No accounts yet</p>
                ) : (
                  accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        onSwitchAccount(acc.id);
                        setIsAccountDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm flex justify-between items-center transition-colors ${
                        currentAccount?.id === acc.id
                          ? "bg-indigo-600/40 text-white"
                          : "hover:bg-gray-700/80 text-gray-300"
                      }`}
                    >
                      <span className="font-medium">{acc.name}</span>
                      {acc.starting_balance !== undefined && (
                        <span className="text-xs text-gray-400">
                          ${Number(acc.starting_balance).toLocaleString()}
                        </span>
                      )}
                    </button>
                  ))
                )}

                <div className="p-3 border-t border-gray-700">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
                  >
                    <span>+</span> New Account
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm mb-1 transition-all ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-400 font-medium"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                  } ${open ? "" : "justify-center"}`
                }
              >
                <item.icon size={open ? 20 : 24} />
                {open && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl p-6 shadow-2xl border ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Account</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Live EURUSD"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Starting Balance (USD)</label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={e => setNewBalance(e.target.value)}
                  placeholder="10000"
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              {createError && <p className="text-red-400 text-sm">{createError}</p>}

              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    creating ? "bg-indigo-700/50 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
