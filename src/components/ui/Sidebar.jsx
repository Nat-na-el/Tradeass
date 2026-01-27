const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/trades", label: "Trades", icon: BookOpen },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/analytics", label: "BarChart3", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];
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
  Profile,
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

  // Fetch Firebase user on mount
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
const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/analytics", label: "Analytics", icon: Analytics },
  // ...add all routes here
];

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

  // Get account stats (simple, no memo needed for now)
  const getAccountStats = (accId) => {
    const trades = JSON.parse(localStorage.getItem(`${accId}_trades`) || "[]");
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    return { totalPnL, tradesCount: trades.length };
  };

  if (loadingUser) {
    return (
      <div className="fixed left-8 top-20 h-[calc(100vh-2.5rem)] bg-gray-900 dark:bg-gray-800 border-r border-gray-800 shadow-2xl z-[1000] w-48 flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  return (
    <motion.div
      animate={{ width: open ? 192 : 64 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-8 top-20 h-[calc(100vh-2.5rem)] bg-gray-900 dark:bg-gray-800 border-r border-gray-800 shadow-2xl z-[1000]",
        theme === "dark" ? "dark" : ""
      )}
      style={{
        minWidth: open ? "12rem" : "4rem",
        boxShadow: "4px 0 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* TOGGLE BUTTON */}
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

        <Separator className="mx-3" />

        {/* USER & ACCOUNT SECTION */}
        <div className="p-3 border-b border-gray-700">
          {/* USER INFO (after login) */}
          {user ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {open && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-200 truncate">
                      {user.displayName || user.email.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <Skeleton className="h-12 w-full rounded mb-2" />
          )}

          {/* LOGOUT BUTTON */}
          {user && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-2 p-2 text-xs text-red-400 hover:text-red-300 bg-red-900/20 rounded transition-all"
            >
              <LogOut className="h-4 w-4" />
              {open && <span>Logout</span>}
            </motion.button>
          )}

          {/* ACCOUNT DROPDOWN */}
          <div className="mt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={toggleAccountDropdown}
              className="w-full flex items-center gap-2 p-2 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-all"
            >
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  {currentAccount?.name?.charAt(0) || "A"}
                </span>
              </div>
              {open && <span className="flex-1 text-left">{currentAccount?.name || "Account"}</span>}
              <ChevronDown size={12} className={`text-gray-400 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {open && isAccountDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-1 space-y-1 max-h-48"
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
                        className={`w-full text-left p-2 rounded text-xs font-normal transition-all ${
                          currentAccount?.id === account.id
                            ? "bg-gray-700 text-white border-l-2 border-blue-400"
                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{account.name}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            ${stats.totalPnL.toFixed(0)}
                          </Badge>
                        </div>
                        <div className="text-[8px] text-gray-500 mt-1">
                          {stats.tradesCount} trades
                        </div>
                      </motion.button>
                    );
                  })}

                  <Separator className="my-1" />
                  <div className="space-y-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onCreateAccount();
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full justify-start text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-2" />
                      New Account
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onShowManage();
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full justify-start text-xs"
                    >
                      <Settings2 className="h-3 w-3 mr-2" />
                      Manage
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Separator className="mx-3" />

        {/* NAVIGATION ITEMS */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-1">
          {navItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 p-2 rounded-lg text-sm transition-all duration-300 group",
                    isActive
                      ? "bg-blue-600 text-white shadow-inner"
                      : "text-gray-400 hover:bg-gray-700 hover:text-white",
                    open ? "justify-start pl-3" : "justify-center"
                  )
                }
                style={{
                  marginBottom: index < navItems.length - 1 ? "2px" : "0",
                  minHeight: "48px",
                }}
              >
                <item.icon
                  size={open ? 20 : 24}
                  className={cn(
                    "flex-shrink-0",
                    open ? "mr-3" : "mx-auto",
                    isActive ? "text-white" : "group-hover:text-white"
                  )}
                />
                {open && (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                    {item.label}
                  </span>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-3 border-t border-gray-700 mt-auto space-y-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 p-2 rounded text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 cursor-pointer"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
            {open && <span>Settings</span>}
          </motion.div>
          {open && (
            <div className="text-[10px] text-gray-500 text-center">
              <p>Tradeass v1.0</p>
              <p className="text-[8px]">© 2026 Abebech</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

