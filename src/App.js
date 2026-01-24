import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut, updateProfile, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from './firebase'; // Your Firebase config file — make sure it's correct
import { ThemeProvider, useTheme } from "./Theme-provider";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Separator } from "./components/ui/separator";
import { Skeleton } from "./components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Switch } from "./components/ui/switch";
import { Checkbox } from "./components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { ScrollArea } from "./components/ui/scroll-area";
import Sidebar from "./components/ui/Sidebar";
import Topbar from "./components/ui/Topbar";
import Dashboard from "./pages/Dashboard";
import DailyJournal from "./pages/DailyJournal";
import Trades from "./pages/Trades";
import Notebook from "./pages/Notebook";
import Reports from "./pages/Reports";
import Challenges from "./pages/Challenges";
import MentorMode from "./pages/MentorMode";
import SettingsPage from "./pages/SettingsPage";
import BacktestJournal from "./pages/BacktestJournal";
import AddTrade from "./components/ui/AddTrade";
import QuantitativeAnalysis from "./pages/QuantitativeAnalysis";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { cn } from "./lib/utils";

// Auth Context for global state management (user, login state, logout)
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component (wraps the app, manages Firebase auth state)
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
      if (currentUser) {
        localStorage.setItem('currentAccountId', currentUser.uid);
      } else {
        localStorage.removeItem('currentAccountId');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (err) {
      toast.error('Logout failed');
      console.error('Logout error:', err);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;
    try {
      await updateProfile(user, updates);
      setUser({ ...user, ...updates });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Update failed');
      console.error('Profile update error:', err);
    }
  };

  const value = {
    user,
    loading,
    isLoggedIn,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Protected Route Component (locks pages behind login, with loading spinner)
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
        <p className="ml-2 text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Enhanced Floating Widgets with animations, Firebase user info, and quick actions
function FloatingWidgets({ currentAccount }) {
  const location = useLocation();
  const { theme } = useTheme();
  const { user, isLoggedIn } = useAuth();

  const shouldShow = location.pathname === "/" && currentAccount && isLoggedIn;

  if (!shouldShow || !currentAccount) return null;

  // Fetch real data from localStorage (per user UID for separation)
  const currentId = localStorage.getItem("currentAccountId") || user?.uid || 'default';
  const trades = JSON.parse(localStorage.getItem(`${currentId}_trades`) || "[]");
  const journals = JSON.parse(localStorage.getItem(`${currentId}_journals`) || "[]");
  const notes = JSON.parse(localStorage.getItem(`${currentId}_notes`) || "[]");

  const totalTrades = trades.length;
  const totalJournals = journals.length;
  const totalNotes = notes.length;

  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const currentBalance = currentAccount.startingBalance + totalPnL;

  // Win rate calculation
  const wins = trades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="fixed right-4 sm:right-8 flex flex-col gap-2 z-[9999] w-[90%] max-w-[260px] sm:w-[260px] opacity-90"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        height: "auto",
        maxHeight: "70vh",
      }}
    >
      {/* ACCOUNT NAME WITH USER AVATAR & EMAIL */}
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || currentAccount?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
              {user?.displayName || user?.email?.split('@')[0] || currentAccount?.name || "Account"}
            </div>
            <div className="text-[8px] text-gray-500 dark:text-gray-400 truncate">
              {user?.email || "User"}
            </div>
          </div>
        </div>
      </motion.div>

      <Separator className="my-1" />

      {/* TOTAL P&L WITH TREND & BADGE */}
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300 flex items-center justify-between">
          <span>Total P&L</span>
          <TrendingUp className="h-3 w-3 text-green-500" />
        </div>
        <div className={`text-base font-bold flex items-center gap-1 ${
          totalPnL >= 0 ? "text-green-600" : "text-red-600"
        }`}>
          {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          <Badge variant={totalPnL >= 0 ? "default" : "destructive"} className="text-xs">
            {totalPnL >= 0 ? 'Profit' : 'Loss'}
          </Badge>
        </div>
      </motion.div>

      <Separator className="my-1" />

      {/* CURRENT BALANCE WITH PROGRESS BAR */}
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Current Balance</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          ${currentBalance.toFixed(2)}
        </div>
        <Progress value={Math.min((totalPnL / currentAccount.startingBalance * 100) || 0, 100)} className="mt-1 h-1" />
        <div className="text-[8px] text-gray-500 dark:text-gray-400 flex justify-between">
          <span>0</span>
          <span>Target</span>
        </div>
      </motion.div>

      <Separator className="my-1" />

      {/* TOTAL TRADES WITH WIN RATE */}
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Total Trades</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          {totalTrades}
        </div>
        <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">
          Win Rate: {winRate}%
        </div>
      </motion.div>

      <Separator className="my-1" />

      {/* TOTAL JOURNALS & NOTES */}
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Journals & Notes</div>
        <div className="flex justify-between text-base font-bold text-gray-800 dark:text-gray-200">
          <span>{totalJournals}</span>
          <span>{totalNotes}</span>
        </div>
      </motion.div>

      {/* QUICK ACTIONS WITH ICONS */}
      <Separator className="my-2" />
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
        <div className="text-[10px] text-blue-700 dark:text-blue-300 font-medium mb-2">Quick Actions</div>
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="justify-start text-xs w-full" onClick={() => toast('Deposit feature coming soon!')}>
            <CreditCard className="h-3 w-3 mr-2" />
            Deposit
          </Button>
          <Button variant="ghost" size="sm" className="justify-start text-xs w-full" onClick={() => navigate('/settings')}>
            <Shield className="h-3 w-3 mr-2" />
            Risk Settings
          </Button>
          <Button variant="ghost" size="sm" className="justify-start text-xs w-full" onClick={() => toast('Upgrade to Pro for advanced features!')}>
            <Crown className="h-3 w-3 mr-2" />
            Upgrade Pro
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Manage Accounts Modal with search, sorting, animations, and stats
function ManageAccountsModal({
  accounts,
  onClose,
  onDeleteAccount,
  onResetAccount,
  onRenameAccount,
  onCreateAccount,
}) {
  const { theme } = useTheme();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, pnl, trades
  const [filteredAccounts, setFilteredAccounts] = useState(accounts);

  useEffect(() => {
    let filtered = accounts;
    if (searchTerm) {
      filtered = filtered.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (sortBy === "pnl") {
      filtered = filtered.sort((a, b) => (b.totalPnL || 0) - (a.totalPnL || 0));
    } else if (sortBy === "trades") {
      filtered = filtered.sort((a, b) => {
        const tradesA = JSON.parse(localStorage.getItem(`${a.id}_trades`) || "[]").length;
        const tradesB = JSON.parse(localStorage.getItem(`${b.id}_trades`) || "[]").length;
        return tradesB - tradesA;
      });
    } else {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, sortBy]);

  const deleteAccount = (accountId) => {
    if (!window.confirm("Delete this account? All data will be lost forever!")) return;
    toast('Account deleted');
    onDeleteAccount(accountId);
  };

  const resetAccount = (accountId) => {
    if (!window.confirm("Reset all trades/notes/journals for this account?")) return;
    toast('Account reset');
    onResetAccount(accountId);
  };

  if (accounts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${
          theme === "dark" ? "dark" : ""
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Manage Accounts ({filteredAccounts.length})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
            ✕
          </button>
        </div>

        {/* SEARCH & SORT CONTROLS */}
        <div className="mb-4 space-y-2">
          <Input
            placeholder="Search accounts by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button variant={sortBy === "name" ? "default" : "outline"} size="sm" onClick={() => setSortBy("name")} className="flex-1 text-xs">
              Name
            </Button>
            <Button variant={sortBy === "pnl" ? "default" : "outline"} size="sm" onClick={() => setSortBy("pnl")} className="flex-1 text-xs">
              P&L
            </Button>
            <Button variant={sortBy === "trades" ? "default" : "outline"} size="sm" onClick={() => setSortBy("trades")} className="flex-1 text-xs">
              Trades
            </Button>
          </div>
        </div>

        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {filteredAccounts.map((account) => {
            const trades = JSON.parse(localStorage.getItem(`${account.id}_trades`) || "[]");
            const journals = JSON.parse(localStorage.getItem(`${account.id}_journals`) || "[]");
            const notes = JSON.parse(localStorage.getItem(`${account.id}_notes`) || "[]");
            const totalTrades = trades.length;
            const totalJournals = journals.length;
            const totalNotes = notes.length;
            const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
            const winRate = totalTrades > 0 ? ((trades.filter(t => t.pnl > 0).length / totalTrades) * 100).toFixed(1) : 0;

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    {editingId === account.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 text-sm"
                          autoFocus
                          placeholder="New name..."
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (editName.trim()) {
                              onRenameAccount(account.id, editName.trim());
                              setEditingId(null);
                              setEditName("");
                              toast.success('Name updated!');
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold">
                            {account.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">{account.name}</h4>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 mt-1">
                            <div className="flex justify-between">
                              <span>Trades: {totalTrades}</span>
                              <Badge variant="secondary" className="text-xs">${totalPnL.toFixed(2)}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Journals: {totalJournals}</span>
                              <span>Notes: {totalNotes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Win Rate: {winRate}%</span>
                              <Badge variant={winRate >= 50 ? "default" : "secondary"} className="text-xs">
                                {winRate >= 50 ? 'Good' : 'Improve'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(account.id);
                        setEditName(account.name);
                      }}
                      className="h-6 w-6 p-0"
                      title="Edit Name"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resetAccount(account.id)}
                      className="h-6 w-6 p-0 text-yellow-500"
                      title="Reset Data"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    {accounts.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAccount(account.id)}
                        className="h-6 w-6 p-0 text-red-500"
                        title="Delete Account"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          <Button
            onClick={() => {
              onCreateAccount();
              onClose();
            }}
            className="w-full text-sm"
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Account
          </Button>
          <Button
            onClick={() => {
              onShowManage();
              onClose();
            }}
            variant="outline"
            className="w-full text-sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced Manage
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>Total Accounts: {accounts.length}</p>
          <p>Active: {currentAccount?.name || 'None'}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Edit Balance/PnL Modal with validation, animations, toasts
function EditBalancePNL({ onSaved }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", startingBalance: 10000 });
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location.state?.accountId) {
      const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
      const account = accounts.find((a) => a.id === location.state.accountId);
      if (account) {
        setForm({
          name: account.name,
          startingBalance: account.startingBalance,
        });
        setIsNewAccount(false);
      }
    } else {
      setIsNewAccount(true);
      setForm({
        name: `Account ${Date.now().toString().slice(-3)}`,
        startingBalance: 10000,
      });
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (form.startingBalance <= 0) newErrors.startingBalance = "Balance must be positive";
    if (form.name.length < 3) newErrors.name = "Name must be at least 3 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");

    if (isNewAccount) {
      const newAccountId = `acc-${Date.now()}`;
      const newAccount = {
        id: newAccountId,
        name: form.name,
        startingBalance: Number(form.startingBalance),
        totalPnL: 0,
        createdAt: new Date().toISOString(),
      };
      accounts.unshift(newAccount);

      // BRAND NEW EMPTY DATA - ALL ZERO (separate per account)
      localStorage.setItem(`${newAccountId}_trades`, JSON.stringify([]));
      localStorage.setItem(`${newAccountId}_notes`, JSON.stringify([]));
      localStorage.setItem(`${newAccountId}_journals`, JSON.stringify([]));
      localStorage.setItem(`dashboard_${newAccountId}`, JSON.stringify({}));

      localStorage.setItem("currentAccountId", newAccountId);
      localStorage.setItem("accounts", JSON.stringify(accounts));

      toast.success('New account created successfully!');
      navigate("/", { replace: true });
    } else {
      const accountIndex = accounts.findIndex((a) => a.id === location.state.accountId);
      accounts[accountIndex] = { ...accounts[accountIndex], ...form };
      localStorage.setItem("accounts", JSON.stringify(accounts));
      toast.success('Account updated successfully!');
      navigate("/", { replace: true });
    }

    setIsSubmitting(false);
    if (onSaved) onSaved();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700`}
      >
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
          {isNewAccount ? "New Account" : "Edit Account"}
        </h3>
        <form onSubmit={saveAccount} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Account Name
            </Label>
            <Input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={cn("mt-1", errors.name && "border-red-500 focus:border-red-500")}
              required
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="startingBalance" className="text-sm font-medium">
              Starting Balance
            </Label>
            <Input
              id="startingBalance"
              type="number"
              value={form.startingBalance}
              onChange={(e) => setForm({ ...form, startingBalance: Number(e.target.value) })}
              className={cn("mt-1", errors.startingBalance && "border-red-500 focus:border-red-500")}
              required
              min="0"
              disabled={isSubmitting}
            />
            {errors.startingBalance && <p className="text-xs text-red-500 mt-1">{errors.startingBalance}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Saving...
                </>
              ) : isNewAccount ? "Create Account" : "Save Changes"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Main App Component with Auth Provider and Full Protected Routes
export default function App() {
  const [open, setOpen] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    initializeAccounts();
  }, []);

  useEffect(() => {
    const currentId = localStorage.getItem("currentAccountId");
    if (!currentId && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.href = "/login";
    }
  }, []);

  const initializeAccounts = () => {
    let storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    let currentId = localStorage.getItem("currentAccountId");

    // ALWAYS HAVE MAIN ACCOUNT (fallback for non-logged in users)
    if (storedAccounts.length === 0) {
      const defaultAccountId = "default";
      const defaultAccount = {
        id: defaultAccountId,
        name: "Main Account",
        startingBalance: 10000,
        totalPnL: 0,
        createdAt: new Date().toISOString(),
      };
      storedAccounts = [defaultAccount];
      localStorage.setItem("accounts", JSON.stringify(storedAccounts));
      localStorage.setItem("currentAccountId", defaultAccountId);

      // PRESERVE MAIN TRADES (fallback data)
      if (!localStorage.getItem(`${defaultAccountId}_trades`)) {
        localStorage.setItem(`${defaultAccountId}_trades`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`${defaultAccountId}_notes`)) {
        localStorage.setItem(`${defaultAccountId}_notes`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`${defaultAccountId}_journals`)) {
        localStorage.setItem(`${defaultAccountId}_journals`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`dashboard_${defaultAccountId}`)) {
        localStorage.setItem(`dashboard_${defaultAccountId}`, JSON.stringify({}));
      }
      currentId = defaultAccountId;
    }

    // FIX CURRENT ID (use Firebase UID if logged in)
    if (!currentId || !storedAccounts.find((a) => a.id === currentId)) {
      currentId = storedAccounts[0].id;
      localStorage.setItem("currentAccountId", currentId);
    }

    setAccounts(storedAccounts);
    const current = storedAccounts.find((a) => a.id === currentId);
    setCurrentAccount(current);
  };

  const createAccount = () => {
    window.location.href = "/edit-balance-pnl";
  };

  const switchAccount = (accountId) => {
    localStorage.setItem("currentAccountId", accountId);
    window.location.reload();
  };

  const deleteAccount = (accountId) => {
    let updated = accounts.filter((a) => a.id !== accountId);

    // DELETE ALL USER DATA (separate per account)
    localStorage.removeItem(`${accountId}_trades`);
    localStorage.removeItem(`${accountId}_notes`);
    localStorage.removeItem(`${accountId}_journals`);
    localStorage.removeItem(`dashboard_${accountId}`);

    let newCurrentId = localStorage.getItem("currentAccountId");

    // IF DELETED CURRENT - CREATE NEW MAIN FALLBACK
    if (newCurrentId === accountId || updated.length === 0) {
      const defaultAccountId = "default";
      const defaultAccount = {
        id: defaultAccountId,
        name: "Main Account",
        startingBalance: 10000,
        totalPnL: 0,
        createdAt: new Date().toISOString(),
      };
      updated = [defaultAccount];
      localStorage.setItem("accounts", JSON.stringify(updated));
      localStorage.setItem("currentAccountId", defaultAccountId);

      localStorage.setItem(`${defaultAccountId}_trades`, JSON.stringify([]));
      localStorage.setItem(`${defaultAccountId}_notes`, JSON.stringify([]));
      localStorage.setItem(`${defaultAccountId}_journals`, JSON.stringify([]));
      localStorage.setItem(`dashboard_${defaultAccountId}`, JSON.stringify({}));
      newCurrentId = defaultAccountId;
    } else {
      localStorage.setItem("accounts", JSON.stringify(updated));
    }

    toast('Account deleted');
    window.location.reload();
  };

  const resetAccount = (accountId) => {
    localStorage.setItem(`${accountId}_trades`, JSON.stringify([]));
    localStorage.setItem(`${accountId}_notes`, JSON.stringify([]));
    localStorage.setItem(`${accountId}_journals`, JSON.stringify([]));
    localStorage.setItem(`dashboard_${accountId}`, JSON.stringify({}));
    toast('Account reset');
    window.location.reload();
  };

  const renameAccount = (accountId, newName) => {
    const updated = accounts.map((a) =>
      a.id === accountId ? { ...a, name: newName } : a,
    );
    localStorage.setItem("accounts", JSON.stringify(updated));
    toast('Name updated');
    window.location.reload();
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100">
            <div className="fixed top-0 left-0 right-0 h-12 z-50">
              <Topbar />
            </div>
            <div className="flex flex-1 pt-12">
              <Sidebar
                open={open}
                setOpen={setOpen}
                accounts={accounts}
                currentAccount={currentAccount}
                onSwitchAccount={switchAccount}
                onCreateAccount={createAccount}
                onShowManage={() => setShowManageModal(true)}
              />
              <div
                className="flex-1 min-w-0 transition-all duration-300"
                style={{
                  marginLeft: open ? "calc(12rem + 8px)" : "calc(6rem + 8px)",
                  maxWidth: open
                    ? "calc(100vw - 12rem - 8px)"
                    : "calc(100vw - 6rem - 8px)",
                }}
              >
                <main
                  className="overflow-y-auto overflow-x-hidden relative"
                  style={{
                    height: "calc(100vh - 3rem)",
                    paddingTop: "1.5rem",
                  }}
                >
                  <div
                    className="bg-transparent border-none p-3 sm:p-3 mx-1 sm:mx-2 mb-0"
                    style={{
                      minHeight: "calc(100vh - 4.5rem)",
                    }}
                  >
                    <Toaster position="top-right" />
                    <Routes>
                      {/* Public routes (no login required) */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Protected routes - require login */}
                      <Route path="/" element={<ProtectedRoute><Dashboard currentAccount={currentAccount} /></ProtectedRoute>} />
                      <Route path="/journal" element={<ProtectedRoute><DailyJournal /></ProtectedRoute>} />
                      <Route path="/trades" element={<ProtectedRoute><Trades /></ProtectedRoute>} />
                      <Route path="/notebook" element={<ProtectedRoute><Notebook /></ProtectedRoute>} />
                      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                      <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
                      <Route path="/mentor" element={<ProtectedRoute><MentorMode /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                      <Route path="/backtest" element={<ProtectedRoute><BacktestJournal /></ProtectedRoute>} />
                      <Route path="/quantitative-analysis" element={<ProtectedRoute><QuantitativeAnalysis /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                      <Route path="/edit-balance-pnl" element={<ProtectedRoute><EditBalancePNL onSaved={() => {}} /></ProtectedRoute>} />
                      <Route path="/trades/new" element={<ProtectedRoute><AddTrade /></ProtectedRoute>} />

                      {/* Catch-all: redirect to login if not matched */}
                      <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                  </div>
                </main>
              </div>
              <FloatingWidgets currentAccount={currentAccount} />
              {showManageModal && (
                <ManageAccountsModal
                  accounts={accounts}
                  onClose={() => setShowManageModal(false)}
                  onDeleteAccount={deleteAccount}
                  onResetAccount={resetAccount}
                  onRenameAccount={renameAccount}
                  onCreateAccount={createAccount}
                />
              )}
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
