import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
// Types (JSDoc)
// ────────────────────────────────────────────────

/**
 * @typedef {Object} Account
 * @property {string} id
 * @property {string} name
 * @property {number} startingBalance
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AccountData
 * @property {Array<Object>} trades
 * @property {Array<Object>} journals
 * @property {Array<Object>} notes
 * @property {Object} dashboard
 */

/**
 * @typedef {Object} AppState
 * @property {Array<Account>} accounts
 * @property {string|null} currentAccountId
 * @property {Object.<string, AccountData>} data
 * @property {boolean} loading
 * @property {string|null} error
 */

// ────────────────────────────────────────────────
// Context & Reducer
// ────────────────────────────────────────────────

const AppContext = createContext(null);

const initialState = {
  accounts: [],
  currentAccountId: null,
  data: {},
  loading: true,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_DATA":
      return {
        ...state,
        accounts: action.payload.accounts,
        currentAccountId: action.payload.currentAccountId,
        data: action.payload.data,
        loading: false,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CREATE_ACCOUNT": {
      const { account } = action.payload;
      return {
        ...state,
        accounts: [account, ...state.accounts],
        data: {
          ...state.data,
          [account.id]: { trades: [], journals: [], notes: [], dashboard: {} },
        },
        currentAccountId: account.id,
      };
    }
    case "UPDATE_ACCOUNT": {
      const { id, updates } = action.payload;
      return {
        ...state,
        accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      };
    }
    case "DELETE_ACCOUNT": {
      const id = action.payload;
      const { [id]: deleted, ...remainingData } = state.data;
      const filteredAccounts = state.accounts.filter((a) => a.id !== id);
      const newCurrentId =
        state.currentAccountId === id ? filteredAccounts[0]?.id ?? null : state.currentAccountId;
      return {
        ...state,
        accounts: filteredAccounts,
        data: remainingData,
        currentAccountId: newCurrentId,
      };
    }
    case "RESET_ACCOUNT_DATA": {
      const id = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [id]: { trades: [], journals: [], notes: [], dashboard: {} },
        },
      };
    }
    case "SWITCH_ACCOUNT":
      return { ...state, currentAccountId: action.payload };
    case "UPDATE_ACCOUNT_DATA": {
      const { id, key, value } = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [id]: {
            ...state.data[id],
            [key]: value,
          },
        },
      };
    }
    default:
      return state;
  }
};

// Action creators
const createAccountAction = (account) => ({ type: "CREATE_ACCOUNT", payload: { account } });
const updateAccountAction = (id, updates) => ({ type: "UPDATE_ACCOUNT", payload: { id, updates } });
const deleteAccountAction = (id) => ({ type: "DELETE_ACCOUNT", payload: id });
const resetAccountDataAction = (id) => ({ type: "RESET_ACCOUNT_DATA", payload: id });
const switchAccountAction = (id) => ({ type: "SWITCH_ACCOUNT", payload: id });
const updateAccountDataAction = (id, key, value) => ({ type: "UPDATE_ACCOUNT_DATA", payload: { id, key, value } });

// ────────────────────────────────────────────────
// useApp hook
// ────────────────────────────────────────────────

function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppContext.Provider");
  }

  const { state, dispatch } = context;

  const currentAccount = useMemo(
    () => state.accounts.find((a) => a.id === state.currentAccountId) || null,
    [state.accounts, state.currentAccountId]
  );

  const currentAccountData = useMemo(
    () => state.data[state.currentAccountId] || { trades: [], journals: [], notes: [], dashboard: {} },
    [state.data, state.currentAccountId]
  );

  const createAccount = useCallback((account) => dispatch(createAccountAction(account)), [dispatch]);
  const updateAccount = useCallback((id, updates) => dispatch(updateAccountAction(id, updates)), [dispatch]);
  const deleteAccount = useCallback((id) => dispatch(deleteAccountAction(id)), [dispatch]);
  const resetAccountData = useCallback((id) => dispatch(resetAccountDataAction(id)), [dispatch]);
  const switchAccount = useCallback((id) => dispatch(switchAccountAction(id)), [dispatch]);
  const updateAccountData = useCallback(
    (id, key, value) => dispatch(updateAccountDataAction(id, key, value)),
    [dispatch]
  );

  return {
    ...state,
    currentAccount,
    currentAccountData,
    createAccount,
    updateAccount,
    deleteAccount,
    resetAccountData,
    switchAccount,
    updateAccountData,
    accountDataForAll: state.data, // Added - was missing
  };
}

// ────────────────────────────────────────────────
// Debounced persistence hook (fixed stale state)
// ────────────────────────────────────────────────

function useDebouncedPersist(delay = 600) {
  const { state } = useContext(AppContext);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const persist = useCallback(() => {
    const current = stateRef.current;
    if (current.loading || current.error) return;

    try {
      localStorage.setItem("accounts", JSON.stringify(current.accounts));
      localStorage.setItem("currentAccountId", current.currentAccountId || "");
      Object.entries(current.data).forEach(([id, { trades, journals, notes, dashboard }]) => {
        localStorage.setItem(`${id}_trades`, JSON.stringify(trades));
        localStorage.setItem(`${id}_journals`, JSON.stringify(journals));
        localStorage.setItem(`${id}_notes`, JSON.stringify(notes));
        localStorage.setItem(`dashboard_${id}`, JSON.stringify(dashboard));
      });
    } catch (err) {
      console.error("Persistence error:", err);
    }
  }, []);

  useEffect(() => {
    if (state.loading || state.error) return;

    const timer = setTimeout(persist, delay);
    return () => clearTimeout(timer);
  }, [state, persist, delay]);
}

// ────────────────────────────────────────────────
// Load initial state
// ────────────────────────────────────────────────

function loadInitialState() {
  try {
    const storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    let currentId = localStorage.getItem("currentAccountId");

    if (!currentId || !storedAccounts.find((a) => a.id === currentId)) {
      currentId = storedAccounts[0]?.id || null;
      if (currentId) localStorage.setItem("currentAccountId", currentId);
    }

    const data = {};
    storedAccounts.forEach((acc) => {
      data[acc.id] = {
        trades: JSON.parse(localStorage.getItem(`${acc.id}_trades`) || "[]"),
        journals: JSON.parse(localStorage.getItem(`${acc.id}_journals`) || "[]"),
        notes: JSON.parse(localStorage.getItem(`${acc.id}_notes`) || "[]"),
        dashboard: JSON.parse(localStorage.getItem(`dashboard_${acc.id}`) || "{}"),
      };
    });

    return { accounts: storedAccounts, currentAccountId: currentId, data };
  } catch (err) {
    console.error("Load error:", err);
    throw err;
  }
}

// ────────────────────────────────────────────────
// FloatingWidgets (unchanged for now)
// ────────────────────────────────────────────────

function FloatingWidgets() {
  const { currentAccount, currentAccountData } = useApp();
  const location = useLocation();

  const { trades = [], journals = [], notes = [] } = currentAccountData;

  const totals = useMemo(() => {
    const totalTrades = trades.length;
    const totalJournals = journals.length;
    const totalNotes = notes.length;
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const currentBalance = (currentAccount?.startingBalance || 0) + totalPnL;

    return { totalTrades, totalJournals, totalNotes, totalPnL, currentBalance };
  }, [trades, journals, notes, currentAccount?.startingBalance]);

  const publicPaths = ["/", "/login", "/register"];
  if (publicPaths.includes(location.pathname) || !currentAccount) {
    return null;
  }

  return (
    <div
      className="fixed right-4 sm:right-8 flex flex-col gap-2 z-50 w-[90%] max-w-[260px] sm:w-[260px] opacity-90"
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        height: "auto",
        maxHeight: "70vh",
      }}
    >
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{currentAccount.name}</div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Total P&L</div>
        <div className={`text-base font-bold ${totals.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
          ${totals.totalPnL.toFixed(2)}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Current Balance</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          ${totals.currentBalance.toFixed(2)}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Trades</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">{totals.totalTrades}</div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Journals</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">{totals.totalJournals}</div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-[10px] text-gray-700 dark:text-gray-300">Notes</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">{totals.totalNotes}</div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Manage Accounts Modal
// ────────────────────────────────────────────────

function ManageAccountsModal({ onClose, navigate }) {
  const { accounts, accountDataForAll, deleteAccount, resetAccountData, updateAccount } = useApp();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleDelete = (id) => {
    if (!window.confirm("Delete this account? All data will be lost!")) return;
    deleteAccount(id);
    onClose();
  };

  const handleReset = (id) => {
    if (!window.confirm("Reset all trades/notes/journals for this account?")) return;
    resetAccountData(id);
    onClose();
  };

  const handleRename = (id, newName) => {
    updateAccount(id, { name: newName });
    setEditingId(null);
    setEditName("");
  };

  const handleCreate = () => {
    onClose();
    navigate("/edit-balance-pnl");
  };

  if (accounts.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Manage Accounts"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Manage Accounts</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 mb-4">
          {accounts.map((account) => {
            const accData = accountDataForAll[account.id] || {};
            const totals = {
              totalTrades: (accData.trades || []).length,
              totalJournals: (accData.journals || []).length,
              totalNotes: (accData.notes || []).length,
              totalPnL: (accData.trades || []).reduce((sum, t) => sum + (t.pnl || 0), 0),
            };

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
                          aria-label={`Edit name for ${account.name}`}
                        />
                        <button
                          onClick={() => handleRename(account.id, editName || account.name)}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                          aria-label="Save name"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{account.name.charAt(0)}</span>
                        </div>
                        <div>
                          <span className="font-medium block">{account.name}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <div>
                              {totals.totalTrades} trades • ${totals.totalPnL.toFixed(2)} P&L
                            </div>
                            <div>
                              {totals.totalJournals} journals • {totals.totalNotes} notes
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
                      aria-label={`Edit ${account.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleReset(account.id)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      aria-label={`Reset ${account.name}`}
                    >
                      🔄
                    </button>
                    {accounts.length > 1 && (
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        aria-label={`Delete ${account.name}`}
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
          aria-label="Create new account"
        >
          + Create New Account
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Edit Balance / PNL Modal
// ────────────────────────────────────────────────

function EditBalancePNL() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accounts, createAccount, updateAccount } = useApp();

  const [form, setForm] = useState({ name: "", startingBalance: 10000 });
  const [isNewAccount, setIsNewAccount] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const accountId = location.state?.accountId;
    if (accountId) {
      const account = accounts.find((a) => a.id === accountId);
      if (account) {
        setForm({
          name: account.name,
          startingBalance: account.startingBalance,
        });
        setIsNewAccount(false);
      }
    } else {
      setForm({
        name: `Account ${Date.now().toString().slice(-4)}`,
        startingBalance: 10000,
      });
      setIsNewAccount(true);
    }
  }, [location.state, accounts]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const trimmedName = form.name.trim() || (isNewAccount ? "New Account" : "Unnamed Account");
      const balance = Number(form.startingBalance) || 10000;

      if (isNewAccount) {
        const newAccount = {
          id: `acc-${Date.now()}`,
          name: trimmedName,
          startingBalance: balance,
          createdAt: new Date().toISOString(),
        };
        createAccount(newAccount);
      } else {
        const accountId = location.state?.accountId;
        if (accountId) {
          updateAccount(accountId, { name: trimmedName, startingBalance: balance });
        }
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label={isNewAccount ? "Create New Account" : "Edit Account"}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
          {isNewAccount ? "New Account" : "Edit Account"}
        </h3>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label
              htmlFor="account-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Account Name
            </label>
            <input
              id="account-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="starting-balance"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Starting Balance
            </label>
            <input
              id="starting-balance"
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
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md disabled:opacity-50"
              aria-label={isNewAccount ? "Create" : "Save"}
            >
              {isSubmitting ? "Saving..." : isNewAccount ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Protected App
// ────────────────────────────────────────────────

function ProtectedApp({ state, dispatch }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AppContext.Provider value={value}>
      <div className="fixed top-0 left-0 right-0 h-12 z-40">
        <Topbar />
      </div>
      <div className="flex flex-1 pt-12">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          accounts={state.accounts}
          currentAccount={state.accounts.find((a) => a.id === state.currentAccountId)}
          onSwitchAccount={(id) => dispatch(switchAccountAction(id))}
          onCreateAccount={() => navigate("/edit-balance-pnl")}
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
                <Route path="/dashboard" element={<Dashboard />} />
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
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </div>
          </main>
        </div>
        <FloatingWidgets />
        {showManageModal && <ManageAccountsModal onClose={() => setShowManageModal(false)} navigate={navigate} />}
      </div>
    </AppContext.Provider>
  );
}

// ────────────────────────────────────────────────
// Public App
// ────────────────────────────────────────────────

function PublicApp() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

// ────────────────────────────────────────────────
// AppContent - Root layout
// ────────────────────────────────────────────────

function AppContent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  // Load data once on mount
  useEffect(() => {
    try {
      const { accounts, currentAccountId, data } = loadInitialState();
      dispatch({ type: "LOAD_DATA", payload: { accounts, currentAccountId, data } });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load your data. Please try refreshing." });
    }
  }, []);

  // Save changes (debounced)
  useDebouncedPersist(600);

  // Handle auth-like redirect
  useEffect(() => {
    if (state.loading) return;

    const isLoggedIn = !!state.currentAccountId;
    const publicPaths = ["/", "/login", "/register"];

    if (isLoggedIn && publicPaths.includes(location.pathname)) {
      navigate("/dashboard", { replace: true });
    } else if (!isLoggedIn && !publicPaths.includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate, state.loading, state.currentAccountId]);

  if (state.loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (state.error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{state.error}</div>;
  }

  const isLoggedIn = !!state.currentAccountId;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      {isLoggedIn ? <ProtectedApp state={state} dispatch={dispatch} /> : <PublicApp />}
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
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
