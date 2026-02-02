import React, { createContext, useContext, useState, useEffect, useReducer, useMemo } from "react";
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

// Centralized state management using Context + Reducer
const AppContext = createContext();

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
    case "CREATE_ACCOUNT":
      const newAccounts = [action.payload.account, ...state.accounts];
      return {
        ...state,
        accounts: newAccounts,
        data: {
          ...state.data,
          [action.payload.account.id]: { trades: [], journals: [], notes: [], dashboard: {} },
        },
        currentAccountId: action.payload.account.id,
      };
    case "UPDATE_ACCOUNT":
      const updatedAccounts = state.accounts.map((a) =>
        a.id === action.payload.id ? { ...a, ...action.payload.updates } : a
      );
      return { ...state, accounts: updatedAccounts };
    case "DELETE_ACCOUNT":
      const { [action.payload]: deletedData, ...remainingData } = state.data;
      const filteredAccounts = state.accounts.filter((a) => a.id !== action.payload);
      let newCurrentId = state.currentAccountId === action.payload ? filteredAccounts[0]?.id : state.currentAccountId;
      return {
        ...state,
        accounts: filteredAccounts,
        data: remainingData,
        currentAccountId: newCurrentId,
      };
    case "RESET_ACCOUNT":
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload]: { trades: [], journals: [], notes: [], dashboard: {} },
        },
      };
    case "SWITCH_ACCOUNT":
      return { ...state, currentAccountId: action.payload };
    // Add more actions for updating trades/journals/notes if needed in future
    default:
      return state;
  }
};

function useAppState() {
  return useContext(AppContext);
}

// Persistence helper
function persistState(state) {
  try {
    localStorage.setItem("accounts", JSON.stringify(state.accounts));
    localStorage.setItem("currentAccountId", state.currentAccountId);
    Object.entries(state.data).forEach(([id, accountData]) => {
      localStorage.setItem(`${id}_trades`, JSON.stringify(accountData.trades));
      localStorage.setItem(`${id}_journals`, JSON.stringify(accountData.journals));
      localStorage.setItem(`${id}_notes`, JSON.stringify(accountData.notes));
      localStorage.setItem(`dashboard_${id}`, JSON.stringify(accountData.dashboard));
    });
  } catch (error) {
    console.error("Failed to persist state:", error);
  }
}

// FloatingWidgets - now uses context
function FloatingWidgets() {
  const { currentAccount, accountData } = useAppState();
  const location = useLocation();

  const publicPaths = ["/", "/login", "/register"];
  if (publicPaths.includes(location.pathname) || !currentAccount) {
    return null;
  }

  const { trades = [], journals = [], notes = [] } = accountData || {};

  const totalTrades = trades.length;
  const totalJournals = journals.length;
  const totalNotes = notes.length;
  const totalPnL = useMemo(() => trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0), [trades]);
  const currentBalance = currentAccount.startingBalance + totalPnL;

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

// ManageAccountsModal - now uses context and computes per account
function ManageAccountsModal({ onClose }) {
  const { accounts, dispatch, accountDataForAll } = useAppState();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const deleteAccount = (accountId) => {
    if (!window.confirm("Delete this account? All data will be lost!")) return;
    dispatch({ type: "DELETE_ACCOUNT", payload: accountId });
    onClose();
  };

  const resetAccount = (accountId) => {
    if (!window.confirm("Reset all trades/notes/journals for this account?")) return;
    dispatch({ type: "RESET_ACCOUNT", payload: accountId });
    onClose();
  };

  const renameAccount = (accountId, newName) => {
    dispatch({
      type: "UPDATE_ACCOUNT",
      payload: { id: accountId, updates: { name: newName } },
    });
    setEditingId(null);
    setEditName("");
  };

  const createAccount = () => {
    onClose();
    // Navigate to create
    useNavigate()("/edit-balance-pnl");
  };

  if (accounts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
            const accountData = accountDataForAll[account.id] || {};
            const trades = accountData.trades || [];
            const journals = accountData.journals || [];
            const notes = accountData.notes || [];
            const totalTrades = trades.length;
            const totalJournals = journals.length;
            const totalNotes = notes.length;
            const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);

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
                          onClick={() => renameAccount(account.id, editName || account.name)}
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
                            <div>{totalTrades} trades • ${totalPnL.toFixed(2)} P&L</div>
                            <div>{totalJournals} journals • {totalNotes} notes</div>
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
          onClick={createAccount}
          className="w-full p-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
        >
          + Create New Account
        </button>
      </div>
    </div>
  );
}

// EditBalancePNL - updated to use dispatch
function EditBalancePNL() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppState().dispatch; // Get dispatch from context
  const [form, setForm] = useState({ name: "", startingBalance: 10000 });
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.accountId) {
      const { accounts } = useAppState();
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
        name: `Account ${Date.now().toString().slice(-4)}`, // Better uniqueness
        startingBalance: 10000,
      });
    }
  }, [location]);

  const saveAccount = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (isNewAccount) {
      const newAccountId = `acc-${Date.now()}`;
      const newAccount = {
        id: newAccountId,
        name: form.name,
        startingBalance: Number(form.startingBalance),
        totalPnL: 0,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "CREATE_ACCOUNT", payload: { account: newAccount } });
      navigate("/dashboard");
    } else {
      dispatch({
        type: "UPDATE_ACCOUNT",
        payload: {
          id: location.state.accountId,
          updates: {
            name: form.name,
            startingBalance: Number(form.startingBalance),
          },
        },
      });
      navigate("/dashboard");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
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
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
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
              {isSubmitting ? "Saving..." : isNewAccount ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// AppContent
function AppContent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [open, setOpen] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Load data once
  useEffect(() => {
    function loadData() {
      try {
        const storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
        let currentId = localStorage.getItem("currentAccountId");
        if (!currentId || !storedAccounts.find((a) => a.id === currentId)) {
          currentId = storedAccounts[0]?.id || null;
          if (currentId) localStorage.setItem("currentAccountId", currentId);
        }

        const data = {};
        storedAccounts.forEach((account) => {
          data[account.id] = {
            trades: JSON.parse(localStorage.getItem(`${account.id}_trades`) || "[]"),
            journals: JSON.parse(localStorage.getItem(`${account.id}_journals`) || "[]"),
            notes: JSON.parse(localStorage.getItem(`${account.id}_notes`) || "[]"),
            dashboard: JSON.parse(localStorage.getItem(`dashboard_${account.id}`) || "{}"),
          };
        });

        dispatch({
          type: "LOAD_DATA",
          payload: { accounts: storedAccounts, currentAccountId: currentId, data },
        });
      } catch (error) {
        console.error("Failed to load data:", error);
        dispatch({ type: "SET_ERROR", payload: "Failed to load application data. Please try refreshing." });
      }
    }
    loadData();
  }, []);

  // Persist on state change (debounce for performance if needed in future)
  useEffect(() => {
    if (!state.loading) {
      persistState(state);
    }
  }, [state]);

  // Auth redirect
  useEffect(() => {
    if (state.loading) return;
    const isLoggedIn = !!state.currentAccountId;
    const publicPaths = ["/", "/login", "/register"];

    if (isLoggedIn && publicPaths.includes(location.pathname)) {
      navigate("/dashboard");
    } else if (!isLoggedIn && !publicPaths.includes(location.pathname)) {
      navigate("/login");
    }
  }, [location.pathname, navigate, state.loading, state.currentAccountId]);

  const currentAccount = useMemo(() => state.accounts.find((a) => a.id === state.currentAccountId), [state.accounts, state.currentAccountId]);
  const accountData = useMemo(() => state.data[state.currentAccountId], [state.data, state.currentAccountId]);

  // Compute accountDataForAll once
  const accountDataForAll = state.data;

  const value = {
    ...state,
    dispatch,
    currentAccount,
    accountData,
    accountDataForAll,
  };

  if (state.loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (state.error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{state.error}</div>;
  }

  const isLoggedIn = !!state.currentAccountId;

  return (
    <AppContext.Provider value={value}>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100">
        {isLoggedIn && (
          <>
            <div className="fixed top-0 left-0 right-0 h-12 z-40">
              <Topbar />
            </div>

            <div className="flex flex-1 pt-12">
              <Sidebar
                open={open}
                setOpen={setOpen}
                accounts={state.accounts}
                currentAccount={currentAccount}
                onSwitchAccount={(id) => dispatch({ type: "SWITCH_ACCOUNT", payload: id })}
                onCreateAccount={() => navigate("/edit-balance-pnl")}
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

              {showManageModal && (
                <ManageAccountsModal
                  onClose={() => setShowManageModal(false)}
                />
              )}
            </div>
          </>
        )}

        {!isLoggedIn && (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        )}
      </div>
    </AppContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
