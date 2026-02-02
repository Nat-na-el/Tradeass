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
// Types (JSDoc for better DX in JS)
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
 * @typedef {Object} AccountTotals
 * @property {number} totalTrades
 * @property {number} totalJournals
 * @property {number} totalNotes
 * @property {number} totalPnL
 * @property {number} currentBalance
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
// Centralized state management
// ────────────────────────────────────────────────

const StateContext = createContext(null);
const DispatchContext = createContext(null);

const initialState = {
  accounts: [],
  currentAccountId: null,
  data: {}, // { [accountId]: { trades: [], journals: [], notes: [], dashboard: {} } }
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

// ────────────────────────────────────────────────
// Custom hook for accounts CRUD (extracted logic)
// ────────────────────────────────────────────────

function useAccounts() {
  const dispatch = useContext(DispatchContext);
  const createAccount = useCallback(
    (name, startingBalance) => {
      const id = `acc-${Date.now()}`;
      const account = {
        id,
        name: name.trim() || "New Account",
        startingBalance: Number(startingBalance) || 10000,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "CREATE_ACCOUNT", payload: { account } });
      return id;
    },
    [dispatch]
  );

  const updateAccount = useCallback(
    (id, updates) => {
      dispatch({ type: "UPDATE_ACCOUNT", payload: { id, updates } });
    },
    [dispatch]
  );

  const deleteAccount = useCallback(
    (id) => {
      dispatch({ type: "DELETE_ACCOUNT", payload: id });
      // Clean localStorage
      localStorage.removeItem(`${id}_trades`);
      localStorage.removeItem(`${id}_journals`);
      localStorage.removeItem(`${id}_notes`);
      localStorage.removeItem(`dashboard_${id}`);
    },
    [dispatch]
  );

  const resetAccountData = useCallback(
    (id) => {
      dispatch({ type: "RESET_ACCOUNT_DATA", payload: id });
    },
    [dispatch]
  );

  const switchAccount = useCallback(
    (id) => {
      dispatch({ type: "SWITCH_ACCOUNT", payload: id });
    },
    [dispatch]
  );

  const updateAccountData = useCallback(
    (id, key, value) => {
      dispatch({ type: "UPDATE_ACCOUNT_DATA", payload: { id, key, value } });
    },
    [dispatch]
  );

  return {
    createAccount,
    updateAccount,
    deleteAccount,
    resetAccountData,
    switchAccount,
    updateAccountData,
  };
}

// ────────────────────────────────────────────────
// Custom hook for app state
// ────────────────────────────────────────────────

function useApp() {
  const state = useContext(StateContext);
  const accountsCrud = useAccounts();

  // Memoized derived values
  const currentAccount = useMemo(
    () => state.accounts.find((a) => a.id === state.currentAccountId) || null,
    [state.accounts, state.currentAccountId]
  );

  const currentAccountData = useMemo(
    () => state.data[state.currentAccountId] || { trades: [], journals: [], notes: [], dashboard: {} },
    [state.data, state.currentAccountId]
  );

  // Centralized totals computation (only for current)
  const currentTotals = useMemo(() => {
    const { trades = [], journals = [], notes = [] } = currentAccountData;
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    return {
      totalTrades: trades.length,
      totalJournals: journals.length,
      totalNotes: notes.length,
      totalPnL,
      currentBalance: (currentAccount?.startingBalance || 0) + totalPnL,
    };
  }, [currentAccountData, currentAccount?.startingBalance]);

  return {
    ...state,
    ...accountsCrud,
    currentAccount,
    currentAccountData,
    currentTotals,
    accountDataForAll: state.data,
  };
}

// ────────────────────────────────────────────────
// Persistence (debounced, with ref for latest state)
// ────────────────────────────────────────────────

function useDebouncedPersist(delay = 1000) {
  const state = useContext(StateContext);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const persist = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState.loading || currentState.error || currentState.accounts.length === 0) return;

    try {
      localStorage.setItem("accounts", JSON.stringify(currentState.accounts));
      localStorage.setItem("currentAccountId", currentState.currentAccountId || "");
      Object.entries(currentState.data).forEach(([id, { trades, journals, notes, dashboard }]) => {
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

    const timeout = setTimeout(persist, delay);
    return () => clearTimeout(timeout);
  }, [state, persist, delay]);

  // Force save on unload
  useEffect(() => {
    const handleUnload = () => persist();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [persist]);
}

// ────────────────────────────────────────────────
// Load logic (extracted)
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
// Floating Widgets
// ────────────────────────────────────────────────

function FloatingWidgets() {
  const { currentAccount, currentTotals } = useApp();
  const location = useLocation();

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
        <div className="text-sm text-gray-700 dark:text-gray-300">Total P&L</div>
        <div className={`text-base font-bold ${currentTotals.totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
          ${currentTotals.totalPnL.toFixed(2)}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-sm text-gray-700 dark:text-gray-300">Current Balance</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">
          ${currentTotals.currentBalance.toFixed(2)}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-sm text-gray-700 dark:text-gray-300">Trades</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">{currentTotals.totalTrades}</div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-sm text-gray-700 dark:text-gray-300">Journals</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">{currentTotals.totalJournals}</div>
      </div>
      <div className="p-3 rounded-lg bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
        <div className="text-sm text-gray-700 dark:text-gray-300">Notes</div>
        <div className="text-base font-bold text-gray-800 dark:text-gray-200">{currentTotals.totalNotes}</div>
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
  const modalRef = useRef(null);

  // Basic focus trap and Esc close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    modalRef.current?.focus();

    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
      tabIndex={-1}
      ref={modalRef}
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
            const trades = accData.trades || [];
            const journals = accData.journals || [];
            const notes = accData.notes || [];
            const totalTrades = trades.length;
            const totalJournals = journals.length;
            const totalNotes = notes.length;
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
// Edit Balance PNL Modal
// ────────────────────────────────────────────────

function EditBalancePNL() {
  // Unchanged, as per previous
  // ...
}

// ────────────────────────────────────────────────
// Protected App (logged in)
// ────────────────────────────────────────────────

function ProtectedApp() {
  // Unchanged, but now uses split contexts
  // ...
}

// ────────────────────────────────────────────────
// Public App (not logged in)
// ────────────────────────────────────────────────

function PublicApp() {
  // Unchanged
  // ...
}

// ────────────────────────────────────────────────
// Main App Content
// ────────────────────────────────────────────────

function AppContent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  // Load on mount
  useEffect(() => {
    try {
      const { accounts, currentAccountId, data } = loadInitialState();
      dispatch({ type: "LOAD_DATA", payload: { accounts, currentAccountId, data } });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load your data. Please try refreshing." });
    }
  }, []);

  useDebouncedPersist();  // Called as hook

  // Redirect based on auth
  useEffect(() => {
    // Unchanged
  }, [location.pathname, navigate, state.loading, state.currentAccountId]);

  if (state.loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (state.error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{state.error}</div>;
  }

  const isLoggedIn = !!state.currentAccountId;

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100">
          {isLoggedIn ? <ProtectedApp /> : <PublicApp />}
        </div>
      </DispatchContext.Provider>
    </StateContext.Provider>
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
