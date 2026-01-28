import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider, useTheme } from "./Theme-provider";
import { Button } from "./components/ui/button";
import Sidebar from "./components/ui/Sidebar";
import Topbar from "./components/ui/Topbar";
import PrivateRoute from "./PrivateRoute";
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
import Register from "./pages/Register"; // ← Make sure Register is imported
// NEW LANDING / WELCOME PAGE COMPONENT (added here for simplicity)
function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Top Bar with Sign In & Sign Up Buttons */}
      <header className="w-full py-6 px-8 flex justify-end items-center gap-4">
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
        >
          Sign In
        </Button>
        <Button
          onClick={() => navigate('/register')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Sign Up
        </Button>
      </header>
      {/* Hero / Welcome Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Welcome to Tradeass
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Tradeass is your personal, offline trading journal and performance tracker. Log trades, write daily journals, track notes, generate reports, run quantitative analysis, and review backtests — all in one secure, local-first app.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
            How it works:<br />
            1. Sign up or sign in<br />
            2. Create your trading account<br />
            3. Start logging trades, journals, and notes<br />
            4. Analyze your performance and improve your edge
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              onClick={() => navigate('/register')}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg"
            >
              Get Started – Sign Up
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="lg"
              className="text-lg px-10 py-6 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl"
            >
              Already have an account? Sign In
            </Button>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        © {new Date().getFullYear()} Tradeass. Built for traders, powered by privacy.
      </footer>
    </div>
  );
}
// ✅ PERFECT FLOATING - REAL DATA ONLY
function FloatingWidgets({ currentAccount }) {
  const location = useLocation();
  const { theme } = useTheme();
  const shouldShow = location.pathname === "/dashboard" && currentAccount;
  if (!shouldShow || !currentAccount) return null;
  // ✅ GET REAL SAVED DATA
  const currentId = localStorage.getItem("currentAccountId");
  const trades = JSON.parse(
    localStorage.getItem(`${currentId}_trades`) || "[]",
  );
  const journals = JSON.parse(
    localStorage.getItem(`${currentId}_journals`) || "[]",
  );
  const notes = JSON.parse(localStorage.getItem(`${currentId}_notes`) || "[]");
  const totalTrades = trades.length;
  const totalJournals = journals.length;
  const totalNotes = notes.length;
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const currentBalance = currentAccount.startingBalance + totalPnL;
  return (
    <div
      className="fixed right-4 sm:right-8 flex flex-col gap-2 z-[9999] w-[90%] max-w-[260px] sm:w-[260px] opacity-90"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        height: "auto",
        maxHeight: "70vh",
      }}
    >
      {/* ACCOUNT NAME */}
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {currentAccount.name}
        </div>
      </div>
      {/* TOTAL P&L */}
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">
          Total P&L
        </div>
        <div
          className={`text-base font-bold ${
            totalPnL >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ${totalPnL.toFixed(2)}
        </div>
      </div>
      {/* CURRENT BALANCE */}
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">
          Current
        </div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          ${currentBalance.toFixed(2)}
        </div>
      </div>
      {/* TOTAL TRADES */}
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">
          Trades
        </div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          {totalTrades}
        </div>
      </div>
      {/* TOTAL JOURNALS */}
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">
          Journals
        </div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          {totalJournals}
        </div>
      </div>
      {/* TOTAL NOTES */}
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">
          Notes
        </div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          {totalNotes}
        </div>
      </div>
    </div>
  );
}
// ✅ PERFECT MANAGE MODAL
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
  const deleteAccount = (accountId) => {
    if (!window.confirm("Delete this account? All data will be lost!")) return;
    onDeleteAccount(accountId);
  };
  const resetAccount = (accountId) => {
    if (!window.confirm("Reset all trades/notes/journals for this account?"))
      return;
    onResetAccount(accountId);
  };
  if (accounts.length === 0) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
      <div
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto ${
          theme === "dark" ? "dark" : ""
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Manage Accounts
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 mb-4">
          {accounts.map((account) => {
            const trades = JSON.parse(
              localStorage.getItem(`${account.id}_trades`) || "[]",
            );
            const journals = JSON.parse(
              localStorage.getItem(`${account.id}_journals`) || "[]",
            );
            const notes = JSON.parse(
              localStorage.getItem(`${account.id}_notes`) || "[]",
            );
            const totalTrades = trades.length;
            const totalJournals = journals.length;
            const totalNotes = notes.length;
            const totalPnL = trades.reduce(
              (sum, trade) => sum + (trade.pnl || 0),
              0,
            );
            return (
              <div
                key={account.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {editingId === account.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 p-1 border rounded dark:bg-gray-600"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            onRenameAccount(
                              account.id,
                              editName || account.name,
                            );
                            setEditingId(null);
                            setEditName("");
                          }}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {account.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium block">
                            {account.name}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <div>
                              {totalTrades} trades • ${totalPnL.toFixed(2)} P&L
                            </div>
                            <div>
                              {totalJournals} journals • {totalNotes} notes
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => {
                        setEditingId(account.id);
                        setEditName(account.name);
                      }}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => resetAccount(account.id)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      🔄
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => deleteAccount(account.id)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onCreateAccount}
          className="w-full p-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
        >
          + Create New Account
        </button>
      </div>
    </div>
  );
}
// ✅ PERFECT CREATE ACCOUNT - ESLINT FIXED
function EditBalancePNL({ onSaved }) {
  const { theme } = useTheme();
  const navigate = useNavigate(); // ✅ FIXED - MOVED TO TOP
  const location = useLocation();
  const [form, setForm] = useState({ name: "", startingBalance: 10000 });
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const saveAccount = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
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
      // ✅ BRAND NEW EMPTY DATA - ALL ZERO
      localStorage.setItem(`${newAccountId}_trades`, JSON.stringify([]));
      localStorage.setItem(`${newAccountId}_notes`, JSON.stringify([]));
      localStorage.setItem(`${newAccountId}_journals`, JSON.stringify([]));
      localStorage.setItem(`dashboard_${newAccountId}`, JSON.stringify({}));
      localStorage.setItem("currentAccountId", newAccountId);
      localStorage.setItem("accounts", JSON.stringify(accounts));
      // ✅ GO BACK TO DASHBOARD
      navigate("/dashboard", { replace: true });
    } else {
      const accountIndex = accounts.findIndex(
        (a) => a.id === location.state.accountId,
      );
      accounts[accountIndex] = { ...accounts[accountIndex], ...form };
      localStorage.setItem("accounts", JSON.stringify(accounts));
      navigate("/dashboard", { replace: true });
    }
    setIsSubmitting(false);
    if (onSaved) onSaved();
  };
  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      <div
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md`}
      >
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
          {isNewAccount ? "New Account" : "Edit Account"}
        </h3>
        <form onSubmit={saveAccount}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Account Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Starting Balance
            </label>
            <input
              type="number"
              value={form.startingBalance}
              onChange={(e) =>
                setForm({ ...form, startingBalance: Number(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => navigate("/dashboard", { replace: true })}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              {isSubmitting ? "Creating..." : isNewAccount ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ✅ INNER APP COMPONENT - Handles routing with location awareness
function AppContent({
  open,
  setOpen,
  accounts,
  currentAccount,
  switchAccount,
  createAccount,
  showManageModal,
  setShowManageModal,
  deleteAccount,
  resetAccount,
  renameAccount,
}) {
  const location = useLocation();

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("currentAccountId");

  // Check if current path is a public route
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPath = publicPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      {/* Topbar - only show when logged in AND not on public routes */}
      {isLoggedIn && !isPublicPath && (
        <div className="fixed top-0 left-0 right-0 h-12 z-50">
          <Topbar />
        </div>
      )}
      <div className={`flex flex-1 ${isLoggedIn && !isPublicPath ? 'pt-12' : ''}`}>
        {/* Sidebar - only show when logged in AND not on public routes */}
        {isLoggedIn && !isPublicPath && (
          <Sidebar
            open={open}
            setOpen={setOpen}
            accounts={accounts}
            currentAccount={currentAccount}
            onSwitchAccount={switchAccount}
            onCreateAccount={createAccount}
            onShowManage={() => setShowManageModal(true)}
          />
        )}
        <div
          className={`flex-1 min-w-0 transition-all duration-300`}
          style={isLoggedIn && !isPublicPath ? {
            marginLeft: open ? "calc(12rem + 8px)" : "calc(6rem + 8px)",
            maxWidth: open
              ? "calc(100vw - 12rem - 8px)"
              : "calc(100vw - 6rem - 8px)",
          } : {}}
        >
          <main
            className={`overflow-y-auto overflow-x-hidden relative ${isLoggedIn && !isPublicPath ? '' : 'h-screen'}`}
            style={isLoggedIn && !isPublicPath ? {
              height: "calc(100vh - 3rem)",
              paddingTop: "1.5rem",
            } : {}}
          >
            <div
              className={`bg-transparent border-none ${isLoggedIn && !isPublicPath ? 'p-3 sm:p-3 mx-1 sm:mx-2 mb-0' : ''}`}
              style={isLoggedIn && !isPublicPath ? {
                minHeight: "calc(100vh - 4.5rem)",
              } : {}}
            >
              {/* Public Routes */}
              <Routes>
                {/* Landing / Welcome page – always first */}
                <Route path="/" element={<Landing />} />
                {/* Login & Register */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>

              {/* Protected Routes - only render when logged in */}
              {isLoggedIn && (
                <Routes>
                  <Route
                    path="/dashboard"
                    element={<Dashboard currentAccount={currentAccount} />}
                  />
                  <Route
                    path="/journal"
                    element={<DailyJournal />}
                  />
                  <Route
                    path="/trades"
                    element={<Trades />}
                  />
                  <Route
                    path="/notebook"
                    element={<Notebook />}
                  />
                  <Route
                    path="/reports"
                    element={<Reports />}
                  />
                  <Route
                    path="/challenges"
                    element={<Challenges />}
                  />
                  <Route
                    path="/mentor"
                    element={<MentorMode />}
                  />
                  <Route
                    path="/settings"
                    element={<SettingsPage />}
                  />
                  <Route
                    path="/backtest"
                    element={<BacktestJournal />}
                  />
                  <Route
                    path="/quantitative-analysis"
                    element={<QuantitativeAnalysis />}
                  />
                  <Route
                    path="/edit-balance-pnl"
                    element={<EditBalancePNL onSaved={() => {}} />}
                  />
                  <Route
                    path="/trades/new"
                    element={<AddTrade />}
                  />
                </Routes>
              )}
            </div>
          </main>
        </div>
        {/* FloatingWidgets - only show when logged in AND not on public routes */}
        {isLoggedIn && !isPublicPath && (
          <FloatingWidgets currentAccount={currentAccount} />
        )}
        {/* ManageAccountsModal - only show when logged in AND not on public routes */}
        {isLoggedIn && !isPublicPath && showManageModal && (
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
  );
}

export default function App() {
  const [open, setOpen] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);
  useEffect(() => {
    initializeAccounts();
  }, []);
  const initializeAccounts = () => {
    let storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    let currentId = localStorage.getItem("currentAccountId");
    // No default account creation anymore
    // FIX CURRENT ID
    if (!currentId || !storedAccounts.find((a) => a.id === currentId)) {
      currentId = storedAccounts[0]?.id || null;
      if (currentId) {
        localStorage.setItem("currentAccountId", currentId);
      }
    }
    setAccounts(storedAccounts);
    const current = storedAccounts.find((a) => a.id === currentId);
    setCurrentAccount(current);
  };
  const createAccount = () => {
    window.location.href = "/edit-balance-pnl"; // ✅ FIXED - Use window.location
  };
  const switchAccount = (accountId) => {
    localStorage.setItem("currentAccountId", accountId);
    window.location.reload();
  };
  const deleteAccount = (accountId) => {
    let updated = accounts.filter((a) => a.id !== accountId);
    // ✅ DELETE ALL DATA
    localStorage.removeItem(`${accountId}_trades`);
    localStorage.removeItem(`${accountId}_notes`);
    localStorage.removeItem(`${accountId}_journals`);
    localStorage.removeItem(`dashboard_${accountId}`);
    let newCurrentId = localStorage.getItem("currentAccountId");
    // ✅ IF DELETED CURRENT - GO TO LANDING (no recreate)
    if (newCurrentId === accountId || updated.length === 0) {
      localStorage.removeItem("currentAccountId");
      localStorage.setItem("accounts", JSON.stringify(updated));
      window.location.href = "/"; // ← Changed to landing page
      return;
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
    <ThemeProvider>
      <Router>
        <AppContent
          open={open}
          setOpen={setOpen}
          accounts={accounts}
          currentAccount={currentAccount}
          switchAccount={switchAccount}
          createAccount={createAccount}
          showManageModal={showManageModal}
          setShowManageModal={setShowManageModal}
          deleteAccount={deleteAccount}
          resetAccount={resetAccount}
          renameAccount={renameAccount}
        />
      </Router>
    </ThemeProvider>
  );
}
