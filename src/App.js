import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; // Adjust path if needed
import { ThemeProvider, useTheme } from "./Theme-provider";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Separator } from "./components/ui/separator";
import { Skeleton } from "./components/ui/skeleton";
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
import Register from "./pages/Register"; // Import Register
import Profile from "./pages/Profile"; // New Profile page for account settings
import Analytics from "./pages/Analytics"; // New Analytics page
import { LogOut, User, Settings, Bell, HelpCircle, CreditCard, Shield, Crown, Clock, Database, TrendingUp, TrendingDown, Target, Award, PlayCircle, FileText, LineChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { cn } from "./lib/utils";

// Auth Context for global state management
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component for wrapping the app
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
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
      console.error('Logout error:', err);
    }
  };

  const value = {
    user,
    loading,
    isLoggedIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Enhanced Floating Widgets with animations and Firebase integration
function FloatingWidgets({ currentAccount }) {
  const location = useLocation();
  const { theme } = useTheme();
  const { user, isLoggedIn } = useAuth();

  const shouldShow = location.pathname === "/" && currentAccount && isLoggedIn;

  if (!shouldShow || !currentAccount) return null;

  // Fetch real data from Firebase or localStorage (expandable to Firestore)
  const currentId = localStorage.getItem("currentAccountId") || user?.uid;
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

  // Animation variants for motion
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
      {/* ACCOUNT NAME WITH USER AVATAR */}
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || currentAccount?.name?.charAt(0) || "A"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
              {user?.displayName || user?.email?.split('@')[0] || currentAccount?.name || "Account"}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {user?.email || "User"}
            </div>
          </div>
        </div>
      </motion.div>

      <Separator className="my-1" />

      {/* TOTAL P&L WITH TREND INDICATOR */}
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

      {/* CURRENT BALANCE WITH PROGRESS */}
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Current Balance</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          ${currentBalance.toFixed(2)}
        </div>
        <Progress value={(totalPnL / currentAccount.startingBalance * 100) || 0} className="mt-1 h-1" />
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
        <div className="text-[10px] text-green-600 dark:text-green-400 mt-1">
          Win Rate: {winRate}%
        </div>
      </motion.div>

      <Separator className="my-1" />

      {/* TOTAL JOURNALS */}
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Journals</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          {totalJournals}
        </div>
      </motion.div>

      <Separator className="my-1" />

      {/* TOTAL NOTES */}
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Notes</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          {totalNotes}
        </div>
      </motion.div>

      {/* QUICK ACTIONS */}
      <Separator className="my-2" />
      <motion.div variants={itemVariants} className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
        <div className="text-[10px] text-blue-700 dark:text-blue-300 font-medium mb-2">Quick Actions</div>
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="justify-start text-xs w-full">
            <CreditCard className="h-3 w-3 mr-2" />
            Deposit
          </Button>
          <Button variant="ghost" size="sm" className="justify-start text-xs w-full">
            <Shield className="h-3 w-3 mr-2" />
            Risk Settings
          </Button>
          <Button variant="ghost" size="sm" className="justify-start text-xs w-full">
            <Crown className="h-3 w-3 mr-2" />
            Upgrade Pro
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Manage Accounts Modal with search and sorting
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
    }
    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, sortBy]);

  const deleteAccount = (accountId) => {
    if (!window.confirm("Delete this account? All data will be lost!")) return;
    onDeleteAccount(accountId);
  };

  const resetAccount = (accountId) => {
    if (!window.confirm("Reset all trades/notes/journals for this account?")) return;
    onResetAccount(accountId);
  };

  if (accounts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
            Manage Accounts
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            ✕
          </button>
        </div>

        {/* SEARCH & SORT */}
        <div className="mb-4 space-y-2">
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button variant={sortBy === "name" ? "default" : "outline"} size="sm" onClick={() => setSortBy("name")} className="flex-1 text-xs">
              Sort by Name
            </Button>
            <Button variant={sortBy === "pnl" ? "default" : "outline"} size="sm" onClick={() => setSortBy("pnl")} className="flex-1 text-xs">
              Sort by P&L
            </Button>
            <Button variant={sortBy === "trades" ? "default" : "outline"} size="sm" onClick={() => setSortBy("trades")} className="flex-1 text-xs">
              Sort by Trades
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

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
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
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            onRenameAccount(account.id, editName || account.name);
                            setEditingId(null);
                            setEditName("");
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {account.name.charAt(0)}
                          </span>
                        </div>
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
                    >
                      ✏️
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resetAccount(account.id)}
                      className="h-6 w-6 p-0"
                    >
                      🔄
                    </Button>
                    {accounts.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAccount(account.id)}
                        className="h-6 w-6 p-0 text-red-500"
                      >
                        🗑️
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
          >
            + Create New Account
          </Button>
          <Button
            onClick={() => {
              onShowManage();
              onClose();
            }}
            variant="outline"
            className="w-full text-sm"
          >
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

// Enhanced Edit Balance/PnL Modal with validation and animations
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

      // BRAND NEW EMPTY DATA - ALL ZERO
      localStorage.setItem(`${newAccountId}_trades`, JSON.stringify([]));
      localStorage.setItem(`${newAccountId}_notes`, JSON.stringify([]));
      localStorage.setItem(`${newAccountId}_journals`, JSON.stringify([]));
      localStorage.setItem(`dashboard_${newAccountId}`, JSON.stringify({}));

      localStorage.setItem("currentAccountId", newAccountId);
      localStorage.setItem("accounts", JSON.stringify(accounts));

      toast.success('New account created!');
      navigate("/", { replace: true });
    } else {
      const accountIndex = accounts.findIndex((a) => a.id === location.state.accountId);
      accounts[accountIndex] = { ...accounts[accountIndex], ...form };
      localStorage.setItem("accounts", JSON.stringify(accounts));
      toast.success('Account updated!');
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
              className={cn("mt-1", errors.name && "border-red-500")}
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
              className={cn("mt-1", errors.startingBalance && "border-red-500")}
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
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : isNewAccount ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// New Profile Page for Account Settings
function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update Firebase user profile
      await user.updateProfile({
        displayName: profileData.name,
        photoURL: profileData.photoURL,
      });
      toast.success('Profile updated!');
      // Update localStorage account name
      const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      const currentId = localStorage.getItem('currentAccountId');
      const accountIndex = accounts.findIndex(a => a.id === currentId);
      if (accountIndex > -1) {
        accounts[accountIndex].name = profileData.name;
        localStorage.setItem('accounts', JSON.stringify(accounts));
      }
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Toaster />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="photoURL">Profile Photo URL (optional)</Label>
                <Input
                  id="photoURL"
                  value={profileData.photoURL}
                  onChange={(e) => setProfileData({ ...profileData, photoURL: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="mt-1"
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Email: {profileData.email} (cannot change)
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
            <Separator />
            <div className="flex justify-end">
              <Button variant="destructive" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ACCOUNT STATS */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentAccount?.startingBalance || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Starting Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentAccount?.totalPnL || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {currentAccount?.id || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Account ID</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {new Date(currentAccount?.createdAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// New Analytics Page with Charts
function Analytics() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const currentId = localStorage.getItem("currentAccountId") || user?.uid;
  const trades = JSON.parse(localStorage.getItem(`${currentId}_trades`) || "[]");

  if (!user) return <Navigate to="/login" replace />;

  // Simple chart data (expandable to Chart.js)
  const monthlyPnL = trades.reduce((acc, trade) => {
    const month = new Date(trade.date).getMonth();
    acc[month] = (acc[month] || 0) + trade.pnl;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Toaster />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-6 w-6" />
              Trading Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {trades.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Trades</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${trades.reduce((sum, t) => sum + (t.pnl || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total P&L</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {((trades.filter(t => t.pnl > 0).length / trades.length * 100) || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Win Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {trades.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Volume</div>
                </CardContent>
              </Card>
            </div>

            {/* MONTHLY P&L TABLE */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Month</th>
                        <th className="text-right p-2">P&L</th>
                        <th className="text-right p-2">Trades</th>
                        <th className="text-right p-2">Win Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyPnL).map(([month, pnl]) => {
                        const monthTrades = trades.filter(t => new Date(t.date).getMonth() === parseInt(month));
                        const winRate = (monthTrades.filter(t => t.pnl > 0).length / monthTrades.length * 100 || 0).toFixed(1);
                        return (
                          <tr key={month} className="border-b last:border-b-0">
                            <td className="p-2">{new Date(0, month).toLocaleString('default', { month: 'long' })}</td>
                            <td className={`p-2 text-right font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${pnl.toFixed(2)}
                            </td>
                            <td className="p-2 text-right">{monthTrades.length}</td>
                            <td className="p-2 text-right">{winRate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* RISK-REWARD CHART PLACEHOLDER (expand to Chart.js) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Risk-Reward Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <Target className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Chart coming soon</p>
                    <p className="text-xs">Average R:R: {(trades.reduce((sum, t) => sum + (t.rr || 0), 0) / trades.length || 0).toFixed(2)}:1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Main App Component with Auth Provider and Protected Routes
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

    // ALWAYS HAVE MAIN ACCOUNT (fallback for non-logged in)
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

      // PRESERVE MAIN TRADES (fallback)
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

    // FIX CURRENT ID
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

    // DELETE ALL DATA
    localStorage.removeItem(`${accountId}_trades`);
    localStorage.removeItem(`${accountId}_notes`);
    localStorage.removeItem(`${accountId}_journals`);
    localStorage.removeItem(`dashboard_${accountId}`);

    let newCurrentId = localStorage.getItem("currentAccountId");

    // IF DELETED CURRENT - CREATE NEW MAIN
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

    window.location.reload();
  };

  const resetAccount = (accountId) => {
    localStorage.setItem(`${accountId}_trades`, JSON.stringify([]));
    localStorage.setItem(`${accountId}_notes`, JSON.stringify([]));
    localStorage.setItem(`${accountId}_journals`, JSON.stringify([]));
    localStorage.setItem(`dashboard_${accountId}`, JSON.stringify({}));
    window.location.reload();
  };

  const renameAccount = (accountId, newName) => {
    const updated = accounts.map((a) =>
      a.id === accountId ? { ...a, name: newName } : a,
    );
    localStorage.setItem("accounts", JSON.stringify(updated));
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
                    <Routes>
                      {/* Public routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Protected routes - redirect to login if not authenticated */}
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

                      {/* Catch-all redirect to login */}
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

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
