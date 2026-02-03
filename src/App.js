
import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "./Theme-provider";
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
import Landing from "./pages/Landing";

// ────────────────────────────────────────────────
// Context + Centralized State
// ────────────────────────────────────────────────

const AppContext = createContext();

function useAppContext() {
  return useContext(AppContext);
}

function AppProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [tradesByAccount, setTradesByAccount] = useState({});
  const [journalsByAccount, setJournalsByAccount] = useState({});
  const [notesByAccount, setNotesByAccount] = useState({});
  const [dashboardByAccount, setDashboardByAccount] = useState({});

  // Helper to get current account object
  const currentAccount = accounts.find(a => a.id === currentAccountId) || null;

  const initialize = useCallback(() => {
    // For now we still start fresh — later can load from localStorage/indexedDB
    setAccounts([]);
    setCurrentAccountId(null);
    setTradesByAccount({});
    setJournalsByAccount({});
    setNotesByAccount({});
    setDashboardByAccount({});
  }, []);

  const createAccount = useCallback((newAccount) => {
    setAccounts(prev => [newAccount, ...prev]);
    setTradesByAccount(prev => ({ ...prev, [newAccount.id]: [] }));
    setJournalsByAccount(prev => ({ ...prev, [newAccount.id]: [] }));
    setNotesByAccount(prev => ({ ...prev, [newAccount.id]: [] }));
    setDashboardByAccount(prev => ({ ...prev, [newAccount.id]: {} }));
    setCurrentAccountId(newAccount.id);
  }, []);

  const updateAccount = useCallback((accountId, updates) => {
    setAccounts(prev =>
      prev.map(acc => (acc.id === accountId ? { ...acc, ...updates } : acc))
    );
  }, []);

  const deleteAccount = useCallback((accountId) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    setTradesByAccount(prev => {
      const copy = { ...prev };
      delete copy[accountId];
      return copy;
    });
    setJournalsByAccount(prev => {
      const copy = { ...prev };
      delete copy[accountId];
      return copy;
    });
    setNotesByAccount(prev => {
      const copy = { ...prev };
      delete copy[accountId];
      return copy;
    });
    setDashboardByAccount(prev => {
      const copy = { ...prev };
      delete copy[accountId];
      return copy;
    });

    if (currentAccountId === accountId) {
      setCurrentAccountId(accounts.length > 1 ? accounts[0]?.id : null);
    }
  }, [currentAccountId, accounts]);

  const resetAccount = useCallback((accountId) => {
    setTradesByAccount(prev => ({ ...prev, [accountId]: [] }));
    setJournalsByAccount(prev => ({ ...prev, [accountId]: [] }));
    setNotesByAccount(prev => ({ ...prev, [accountId]: [] }));
    setDashboardByAccount(prev => ({ ...prev, [accountId]: {} }));
  }, []);

  const renameAccount = useCallback((accountId, newName) => {
    updateAccount(accountId, { name: newName });
  }, [updateAccount]);

  const addTrade = useCallback((accountId, trade) => {
    setTradesByAccount(prev => ({
      ...prev,
      [accountId]: [...(prev[accountId] || []), trade],
    }));
  }, []);

  // You can add similar helpers for journals, notes, etc.

  const value = {
    accounts,
    currentAccount,
    currentAccountId,
    tradesByAccount,
    journalsByAccount,
    notesByAccount,
    dashboardByAccount,
    setCurrentAccountId,
    createAccount,
    updateAccount,
    deleteAccount,
    resetAccount,
    renameAccount,
    addTrade,
    initialize,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ────────────────────────────────────────────────
// Floating Widgets (now uses context)
// ────────────────────────────────────────────────

function FloatingWidgets() {
  const { currentAccount, tradesByAccount, journalsByAccount, notesByAccount } = useAppContext();
  const location = useLocation();

  if (location.pathname !== "/dashboard") return null;
  if (!currentAccount) return null;

  const trades = tradesByAccount[currentAccount.id] || [];
  const journals = journalsByAccount[currentAccount.id] || [];
  const notes = notesByAccount[currentAccount.id] || [];

  const totalTrades = trades.length;
  const totalJournals = journals.length;
  const totalNotes = notes.length;
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
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
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {currentAccount.name}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Total P&L</div>
        <div className={`text-base font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
          ${totalPnL.toFixed(2)}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Current Balance</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          ${currentBalance.toFixed(2)}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Trades</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">{totalTrades}</div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Journals</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">{totalJournals}</div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Notes</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">{totalNotes}</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Manage Accounts Modal (now uses context)
// ────────────────────────────────────────────────

function ManageAccountsModal({ onClose }) {
  const {
    accounts,
    deleteAccount,
    resetAccount,
    renameAccount,
    createAccount: triggerCreate,
  } = useAppContext();

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleDelete = (id) => {
    if (!window.confirm("Delete this account? All data will be lost!")) return;
    deleteAccount(id);
  };

  const handleReset = (id) => {
    if (!window.confirm("Reset all trades/notes/journals for this account?")) return;
    resetAccount(id);
  };

  const handleRename = (id) => {
    if (!editName.trim()) return;
    renameAccount(id, editName);
    setEditingId(null);
    setEditName("");
  };

  const handleCreate = () => {
    onClose();
    triggerCreate();
  };

  if (accounts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Manage Accounts
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="space-y-3 mb-4">
          {accounts.map((account) => {
            const trades = tradesByAccount[account.id] || [];
            const journals = journalsByAccount[account.id] || [];
            const notes = notesByAccount[account.id] || [];
            const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);

            return (
              <div key={account.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
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
                          onClick={() => handleRename(account.id)}
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
                          <span className="font-medium block">{account.name}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <div>{trades.length} trades • ${totalPnL.toFixed(2)} P&L</div>
                            <div>{journals.length} journals • {notes.length} notes</div>
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
                      onClick={() => handleReset(account.id)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    >
                      🔄
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => handleDelete(account.id)}
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
          onClick={handleCreate}
          className="w-full p-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
        >
          + Create New Account
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Edit Balance / Create Account Modal
// ────────────────────────────────────────────────

function EditBalancePNL() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createAccount, updateAccount, accounts } = useAppContext();

  const [form, setForm] = useState({ name: "", startingBalance: 10000 });
  const [isNew, setIsNew] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.accountId) {
      const acc = accounts.find(a => a.id === location.state.accountId);
      if (acc) {
        setForm({
          name: acc.name,
          startingBalance: acc.startingBalance,
        });
        setIsNew(false);
      }
    } else {
      setIsNew(true);
      setForm({
        name: `Account ${Date.now().toString().slice(-4)}`,
        startingBalance: 10000,
      });
    }
  }, [location.state?.accountId, accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const data = {
      name: form.name.trim() || "Unnamed",
      startingBalance: Number(form.startingBalance) || 0,
    };

    if (isNew) {
      const id = `acc-${Date.now()}`;
      const newAcc = {
        id,
        ...data,
        totalPnL: 0,
        createdAt: new Date().toISOString(),
      };
      createAccount(newAcc);
      navigate("/dashboard", { replace: true });
    } else if (location.state?.accountId) {
      updateAccount(location.state.accountId, data);
      navigate("/dashboard", { replace: true });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
          {isNew ? "New Account" : "Edit Account"}
        </h3>

        <form onSubmit={handleSubmit}>
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
              onChange={(e) => setForm({ ...form, startingBalance: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard", { replace: true })}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isNew ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main App Content
// ────────────────────────────────────────────────

function AppContent() {
  const {
    accounts,
    currentAccount,
    currentAccountId,
    setCurrentAccountId,
    initialize,
    createAccount: triggerCreateAccount,
    deleteAccount,
    resetAccount,
    renameAccount,
  } = useAppContext();

  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Simple "auth" guard + redirect logic
  useEffect(() => {
    const isLoggedIn = !!currentAccountId;
    const publicPaths = ["/", "/login", "/register", "/landing"];

    if (isLoggedIn && publicPaths.includes(location.pathname)) {
      navigate("/dashboard", { replace: true });
    }

    if (!isLoggedIn && !publicPaths.includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, currentAccountId, navigate]);

  const switchAccount = useCallback((accountId) => {
    setCurrentAccountId(accountId);
    navigate("/dashboard", { replace: true });
  }, [setCurrentAccountId, navigate]);

  const handleCreateAccount = useCallback(() => {
    navigate("/edit-balance-pnl");
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      {currentAccountId ? (
        <>
          <div className="fixed top-0 left-0 right-0 h-12 z-50">
            <Topbar />
          </div>

          <div className="flex flex-1 pt-12">
            <Sidebar
              open={sidebarOpen}
              setOpen={setSidebarOpen}
              accounts={accounts}
              currentAccount={currentAccount}
              onSwitchAccount={switchAccount}
              onCreateAccount={handleCreateAccount}
              onShowManage={() => setShowManageModal(true)}
            />

            <div
              className="flex-1 min-w-0 transition-all duration-300"
              style={{
                marginLeft: sidebarOpen ? "calc(12rem + 8px)" : "calc(6rem + 8px)",
                maxWidth: sidebarOpen
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
                  style={{ minHeight: "calc(100vh - 4.5rem)" }}
                >
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard currentAccount={currentAccount} />} />
                    <Route path="/journal" element={<DailyJournal />} />
                    <Route path="/trades" element={<Trades />} />
                    <Route path="/notebook" element={<Notebook />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/challenges" element={<Challenges />} />
                    <Route path="/mentor" element={<MentorMode />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/backtest" element={<BacktestJournal />} />
                    <Route path="/quantitative-analysis" element={<QuantitativeAnalysis />} />
                    <Route path="/edit-balance-pnl" element={<EditBalancePNL />} />
                    <Route path="/trades/new" element={<AddTrade />} />
                    <Route path="*" element={<Dashboard currentAccount={currentAccount} />} />
                  </Routes>
                </div>
              </main>
            </div>

            <FloatingWidgets />
          </div>

          {showManageModal && (
            <ManageAccountsModal onClose={() => setShowManageModal(false)} />
          )}
        </>
      ) : (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// Root
// ────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </Router>
    </ThemeProvider>
  );
}
