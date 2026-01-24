import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ChevronDown,
  ChevronUp,
  LogOut,
  User,
  Bell,
  HelpCircle,
  CreditCard,
  Shield,
  Crown,
  Clock,
  Database,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  PlayCircle,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  BarChart2,
  PieChart,
  DollarSign,
  Percent,
  Calendar,
  Activity as ActivityIcon,
  Zap,
  Star,
  Heart,
  Bookmark,
  Share2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Code,
  Server,
  Layers,
  Package,
  ShoppingBag,
  UserCheck,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Clipboard,
  ClipboardCheck,
  File,
  Folder,
  FolderOpen,
  Image,
  Video,
  Music,
  Mic,
  Volume,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  RotateCw,
  RotateCcw,
  RefreshCw,
  RefreshCcw,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronsDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CornerDownLeft,
  CornerDownRight,
  CornerLeftUp,
  CornerRightUp,
  CornerUpLeft,
  CornerUpRight,
  ArrowUpLeft,
  ExternalLink,
  Maximize,
  Maximize2,
  Minimize,
  Minimize2,
  Move,
  Layout,
  Grid,
  Grid3x3,
  LayoutGrid,
  LayoutList,
  LayoutKanban,
  LayoutDashboard,
  SidebarClose,
  SidebarOpen,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  SplitHorizontal,
  SplitVertical,
  Grid2x2,
} from "lucide-react";
import { useTheme } from "../../Theme-provider";
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust path to your Firebase config
import { cn } from "../../lib/utils"; // For className utilities

// Sidebar Context for global sidebar state (expandable)
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

// Sidebar Provider (wraps Sidebar for state sharing)
function SidebarProvider({ children, ...props }) {
  const [open, setOpen] = useState(true);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const toggleSidebar = useCallback(() => {
    setOpen((prev) => !prev);
    setIsAccountDropdownOpen(false);
  }, []);

  const toggleAccountDropdown = useCallback(() => {
    if (open) {
      setIsAccountDropdownOpen((prev) => !prev);
    }
  }, [open]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('currentAccountId');
      toast.success('Logged out successfully!');
      window.location.href = '/login';
    } catch (err) {
      toast.error('Logout failed');
      console.error('Logout error:', err);
    }
  }, []);

  const value = {
    open,
    setOpen,
    isAccountDropdownOpen,
    setIsAccountDropdownOpen,
    user,
    loading,
    toggleSidebar,
    toggleAccountDropdown,
    handleLogout,
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// Perfect Enhanced Sidebar Component (~500 lines with features, animations, error handling)
export default function Sidebar({
  accounts,
  currentAccount,
  onSwitchAccount,
  onCreateAccount,
  onShowManage,
}) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const {
    open,
    setOpen,
    isAccountDropdownOpen,
    setIsAccountDropdownOpen,
    user,
    loading,
    toggleSidebar,
    toggleAccountDropdown,
    handleLogout,
  } = useSidebar();

  // Memoized nav items with dynamic labeling
  const navItems = useMemo(() => [
    { to: "/", icon: Home, label: "Dashboard", badge: currentAccount?.totalTrades || 0 },
    { to: "/journal", icon: BookOpen, label: "Daily Journal", badge: currentAccount?.totalJournals || 0 },
    { to: "/trades", icon: Activity, label: "Trades", badge: currentAccount?.totalTrades || 0 },
    { to: "/notebook", icon: FileText, label: "Notebook", badge: currentAccount?.totalNotes || 0 },
    { to: "/reports", icon: BarChart3, label: "Reports" },
    { to: "/challenges", icon: Trophy, label: "Challenges" },
    { to: "/mentor", icon: Users, label: "Mentor Mode" },
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/backtest", icon: Calculator, label: "Backtest" },
  ], [currentAccount]);

  // Memoized filtered accounts for dropdown
  const filteredAccounts = useMemo(() => accounts.filter(a => 
    a.name.toLowerCase().includes((user?.email || '').toLowerCase()) || a.name.toLowerCase().includes(currentAccount?.name.toLowerCase() || '')
  ), [accounts, user, currentAccount]);

  // Animation variants for smooth transitions
  const sidebarVariants = {
    open: {
      width: "12rem",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      width: "4rem",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  if (loading) {
    return (
      <div className="fixed left-8 top-20 h-[calc(100vh-2.5rem)] bg-gray-900 dark:bg-gray-800 border-r border-gray-800 shadow-2xl z-[1000] w-48 flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  return (
    <motion.div
      variants={sidebarVariants}
      initial={open ? "open" : "closed"}
      animate={open ? "open" : "closed"}
      className={cn(
        "fixed left-8 top-20 h-[calc(100vh-2.5rem)] bg-gray-900 dark:bg-gray-800 border-r border-gray-800 shadow-2xl transition-all duration-300 z-[1000]",
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

        {/* ACCOUNT SECTION WITH USER DISPLAY & LOGOUT */}
        <div className="p-3 border-b border-gray-700">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {/* USER AVATAR & INFO (after login) */}
            {user ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {user.email.charAt(0).toUpperCase()}
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
                <Bell className="h-4 w-4 text-yellow-400 cursor-pointer" onClick={() => toast('Notifications coming soon!')} />
              </motion.div>
            ) : (
              <Skeleton className="h-12 w-full rounded" />
            )}

            {/* LOGOUT BUTTON (visible after login) */}
            {user && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2 text-sm text-red-400 hover:text-red-300 bg-red-900/20 rounded-lg transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                {open && <span>Logout</span>}
              </motion.button>
            )}

            {/* ACCOUNT DROPDOWN (for switching accounts) */}
            <motion.div
              initial={false}
              animate={{ height: isAccountDropdownOpen ? "auto" : 0 }}
              className="overflow-hidden"
            >
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
                      <div className="text-xs font-medium text-gray-200">
                        {currentAccount?.name || "Account"}
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isAccountDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={14} className="text-gray-400" />
                    </motion.div>
                  </>
                )}
              </div>

              <AnimatePresence>
                {open && isAccountDropdownOpen && (
                  <motion.div
                    initial={{ opacity: First, the user is providing the Sidebar.jsx code, which is about 205 lines, and asking to "write me the perfect sidebar" – essentially, edit and improve it.

The code already has the logout button added, but the user says "nothing changed" – so they want a complete, polished version.

Key improvements from previous context:
- Integrate Firebase user info (name, email, avatar).
- Ensure logout works.
- Add account display after login.
- Make it responsive, animated, with better UX.
- Keep it around 200-300 lines for "perfect" without bloat.

Structure:
- Imports: Add necessary ones like Avatar, LogOut, etc.
- State: Add user state from useAuth (assume AuthContext is set up).
- Logout function: Already there, but polish with toast.
- Account section: Show Firebase user name/email/avatar.
- Navigation: Keep existing navItems.
- Animations: Add motion for smoothness.
- Dark mode: Ensure cn and theme handling.

Output the full, edited Sidebar.jsx code in a code block.

Finally, instruct on how to push and test.<|control12|>```jsx
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
  LogOut,
  User,
  Mail,
  Shield,
  Crown,
  Clock,
  Database,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  PlayCircle,
  Bell,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTheme } from "../../Theme-provider";
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust path if needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "../App"; // Assume AuthContext from App.js — adjust path

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
  const { user, logout } = useAuth(); // Get user from global auth context
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      await logout(); // Use global logout from context (includes toast)
      setIsAccountDropdownOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('Logout failed. Please try again.');
      console.error('Logout error:', err);
    }
  };

  // Animation variants for smooth transitions
  const sidebarVariants = {
    closed: { width: "4rem" },
    open: { width: "12rem" },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  const navItems = useMemo(() => [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/journal", icon: BookOpen, label: "Daily Journal" },
    { to: "/trades", icon: Activity, label: "Trades" },
    { to: "/notebook", icon: FileText, label: "Notebook" },
    { to: "/reports", icon: BarChart3, label: "Reports" },
    { to: "/challenges", icon: Trophy, label: "Challenges" },
    { to: "/mentor", icon: Users, label: "Mentor Mode" },
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/backtest", icon: Calculator, label: "Backtest" },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/analytics", icon: TrendingUp, label: "Analytics" },
  ], []);

  // Fetch current account stats for display
  const getAccountStats = useCallback((accId) => {
    const trades = JSON.parse(localStorage.getItem(`${accId}_trades`) || "[]");
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const wins = trades.filter(t => t.pnl > 0).length;
    const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : 0;
    return { totalPnL, winRate, tradesCount: trades.length };
  }, []);

  return (
    <motion.div
      variants={sidebarVariants}
      initial="closed"
      animate={open ? "open" : "closed"}
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 border-r border-gray-700 shadow-2xl transition-all duration-300 z-[1000] overflow-hidden",
        theme === "dark" ? "dark" : ""
      )}
      style={{
        minWidth: open ? "12rem" : "4rem",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* TOGGLE BUTTON */}
        <div className="flex items-center justify-end p-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-200 hover:bg-gray-700 transition-all duration-300 flex items-center justify-center border border-gray-600"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        </div>

        <Separator className="mx-3 my-2" />

        {/* USER/ACCOUNT SECTION WITH AVATAR & STATS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 border-b border-gray-700 relative"
          onHoverStart={() => setIsExpanded(true)}
          onHoverEnd={() => setIsExpanded(false)}
        >
          {/* USER AVATAR & INFO */}
          <div className="flex items-center gap-3 mb-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photoURL} alt={user?.displayName || user?.email} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || currentAccount?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {open && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-100 truncate">
                  {user?.displayName || user?.email?.split('@')[0] || currentAccount?.name || "User"}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user?.email || currentAccount?.id || "Account ID"}
                </div>
              </div>
            )}
          </div>

          {/* LOGOUT BUTTON */}
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="ml-12 mt-1"
            >
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          )}

          {/* ACCOUNT DROPDOWN */}
          <motion.div
            initial={false}
            animate={isAccountDropdownOpen ? "open" : "closed"}
            variants={{
              open: { height: "auto", opacity: 1 },
              closed: { height: 0, opacity: 0 },
            }}
            className="overflow-hidden"
          >
            {open && isAccountDropdownOpen && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {/* ALL ACCOUNTS LIST */}
                {accounts.map((account, index) => {
                  const stats = getAccountStats(account.id);
                  return (
                    <motion.button
                      key={account.id}
                      variants={itemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      onClick={() => {
                        onSwitchAccount(account.id);
                        setIsAccountDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left p-2 rounded-md text-xs font-normal transition-all duration-200",
                        currentAccount?.id === account.id
                          ? "bg-blue-600 text-white border-l-2 border-blue-400 shadow-md"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{account.name}</span>
                        <Badge variant="secondary" className="text-xs ml-2">
                          ${stats.totalPnL.toFixed(0)}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {stats.tradesCount} trades • {stats.winRate}% win
                      </div>
                    </motion.button>
                  );
                })}

                {/* ACTION BUTTONS */}
                <Separator className="my-2" />
                <div className="space-y-1">
                  <motion.button
                    variants={itemVariants}
                    custom={accounts.length}
                    initial="hidden"
                    animate="visible"
                    onClick={() => {
                      onCreateAccount();
                      setIsAccountDropdownOpen(false);
                    }}
                    className="w-full p-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-all"
                  >
                    <UserPlus className="h-3 w-3 inline mr-1" />
                    + New Account
                  </motion.button>
                  <motion.button
                    variants={itemVariants}
                    custom={accounts.length + 1}
                    initial="hidden"
                    animate="visible"
                    onClick={() => {
                      onShowManage();
                      setIsAccountDropdownOpen(false);
                    }}
                    className="w-full p-2 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-all"
                  >
                    <Settings2 className="h-3 w-3 inline mr-1" />
                    Manage Accounts
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* DROPDOWN TOGGLE */}
          {open && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleAccountDropdown}
              className="w-full p-2 rounded-md text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-all mt-1 flex items-center justify-between"
            >
              <span>Accounts ({accounts.length})</span>
              {isAccountDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </motion.button>
          )}
        </motion.div>

        <Separator className="mx-3 my-2" />

        {/* NAVIGATION ITEMS WITH ANIMATIONS & BADGES */}
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          <AnimatePresence>
            {navItems.map((item, index) => (
              <motion.div
                key={item.to}
                variants={itemVariants}
                custom={index}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 p-3 rounded-lg text-sm transition-all duration-300 group relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white hover:shadow-md",
                      open ? "justify-start pl-3" : "justify-center items-center"
                    )
                  }
                  style={{
                    marginBottom: index < navItems.length - 1 ? "4px" : "0",
                    minHeight: "52px",
                  }}
                >
                  <motion.div
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    <item.icon
                      size={open ? 20 : 24}
                      className={cn(
                        "flex-shrink-0",
                        open ? "mr-3" : "mx-auto",
                        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                      )}
                    />
                  </motion.div>
                  {open && (
                    <motion.span
                      className="whitespace-nowrap overflow-hidden text-ellipsis font-medium"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {/* BADGE FOR ACTIVE ITEMS */}
                  {isActive && open && (
                    <motion.div
                      className="absolute -right-2 -top-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        Active
                      </Badge>
                    </motion.div>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>

        {/* FOOTER WITH QUICK LINKS & INFO */}
        <div className="p-3 border-t border-gray-700 mt-auto">
          <Separator className="my-2" />
          <div className="space-y-2 text-xs">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 text-gray-400 cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <User className="h-3 w-3" />
              {open && <span>Profile</span>}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 text-gray-400 cursor-pointer"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-3 w-3" />
              {open && <span>Settings</span>}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 text-gray-400 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-3 w-3" />
              {open && <span>Logout</span>}
            </motion.div>
          </div>
          {open && (
            <div className="mt-4 text-[10px] text-gray-500 text-center">
              <p>Tradeass v1.0</p>
              <p className="text-[8px]">© 2026 Abebech</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
