import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
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
  TrendingUp,
  CreditCard,
  Shield,
  Crown,
  Edit3,
  RefreshCw,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  LogOut,
  User,
  Bell,
  Mail,
} from "lucide-react";
import { useTheme } from "../../Theme-provider";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust path if needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch Firebase user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return unsubscribe;
  }, []);

  const toggleSidebar = () => {
    setOpen((prev) => !prev);
    setIsAccountDropdownOpen(false);
  };

  const toggleAccountDropdown = () => {
    if (open) {
      setIsAccountDropdownOpen(!isAccountDropdownOpen);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('currentAccountId');
      toast.success('Logged out successfully!');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('Logout failed');
      console.error('Logout error:', err);
    }
  };

  // Simple account stats
  const getAccountStats = (accId) => {
    const trades = JSON.parse(localStorage.getItem(`${accId}_trades`) || "[]");
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    return { totalPnL, tradesCount: trades.length };
  };

  if (loadingUser) {
    return (
      <div className="fixed left-0 top-12 h-[calc(100vh-3rem)] bg-gray-900 dark:bg-gray-800 border-r border-gray-800 shadow-2xl z-[1000] w-16 flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      animate={{ width: open ? 240 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-12 h-[calc(100vh-3rem)] bg-gray-900 dark:bg-gray-800 border-r border-gray-800 shadow-2xl z-[1000] overflow-hidden",
        theme === "dark" ? "dark" : ""
      )}
      style={{
        minWidth: open ? "15rem" : "4rem",
        boxShadow: "4px 0 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex items-center justify-end p-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 transition-all duration-300 flex items-center justify-center"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        </div>

        <Separator className="mx-3 bg-gray-700" />

        {/* User & Account Section */}
        <div className="p-3 border-b border-gray-700">
          {user ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback className="bg-indigo-600 text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {open && (
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-200 truncate">
                      {user.displayName || user.email.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <Skeleton className="h-12 w-full rounded mb-3" />
          )}

          {/* Logout Button */}
          {user && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-2.5 text-sm text-red-400 hover:text-red-300 bg-red-900/20 rounded transition-all"
            >
              <LogOut size={18} />
              {open && <span>Logout</span>}
            </motion.button>
          )}

          {/* Account Dropdown */}
          <div className="mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={toggleAccountDropdown}
              className="w-full flex items-center gap-3 p-2.5 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-all"
            >
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {currentAccount?.name?.charAt(0) || "A"}
                </span>
              </div>
              {open && (
                <div className="flex-1 text-left truncate">
                  {currentAccount?.name || "Select Account"}
                </div>
              )}
              <ChevronDown
                size={16}
                className={`transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`}
              />
            </motion.button>

            <AnimatePresence>
              {open && isAccountDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-2 space-y-1 max-h-64"
                >
                  {accounts.map((account) => {
                    const stats = getAccountStats(account.id);
                    return (
                      <motion.button
                        key={account.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          onSwitchAccount(account.id);
                          setIsAccountDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded text-sm transition-all ${
                          currentAccount?.id === account.id
                            ? "bg-gray-700 text-white border-l-4 border-indigo-500"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{account.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            ${stats.totalPnL.toFixed(0)}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {stats.tradesCount} trades
                        </div>
                      </motion.button>
                    );
                  })}

                  <Separator className="my-2 bg-gray-700" />

                  <div className="space-y-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onCreateAccount();
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full justify-start text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      New Account
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onShowManage();
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full justify-start text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      Manage Accounts
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Separator className="mx-3 bg-gray-700" />

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {[
            { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { to: "/journal", label: "Daily Journal", icon: BookOpen },
            { to: "/trades", label: "Trades", icon: BarChart3 },
            { to: "/notebook", label: "Notebook", icon: NotebookIcon },
            { to: "/reports", label: "Reports", icon: LineChart },
            { to: "/challenges", label: "Challenges", icon: Trophy },
            { to: "/mentor", label: "Mentor Mode", icon: Brain },
          ].map((item) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-300 group",
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 shadow-sm"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white",
                    open ? "justify-start pl-3" : "justify-center"
                  )
                }
              >
                <item.icon
                  size={open ? 20 : 22}
                  className={cn(
                    "flex-shrink-0",
                    open ? "mr-3" : "mx-auto",
                    "group-hover:text-white transition-colors"
                  )}
                />
                {open && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 mt-auto">
          {open && (
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Tradeass v1.0</p>
              <p>© 2026</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
