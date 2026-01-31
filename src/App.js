import React, { useState, useEffect } from "react";
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

// FloatingWidgets — ONLY on dashboard
function FloatingWidgets({ currentAccount }) {
  const location = useLocation();
  const shouldShow = location.pathname === "/dashboard" && currentAccount;
  if (!shouldShow) return null;

  const currentId = localStorage.getItem("currentAccountId");
  const trades = JSON.parse(localStorage.getItem(`${currentId}_trades`) || "[]");
  const journals = JSON.parse(localStorage.getItem(`${currentId}_journals`) || "[]");
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

// ManageAccountsModal (unchanged)
function ManageAccountsModal({
  accounts,
  onClose,
  onDeleteAccount,
  onResetAccount,
  onRenameAccount,
  onCreateAccount,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

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
            const trades = JSON.parse(localStorage.getItem(`${account.id}_trades`) || "[]");
            const journals = JSON.parse(localStorage.getItem(`${account.id}_journals`) || "[]");
            const notes = JSON.parse(localStorage.getItem(`${account.id}_notes`) || "[]");
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
                          onClick={() => {
                            onRenameAccount(account.id, editName || account.name);
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
          onClick={onCreateAccount}
          className="w-full p-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
        >
          + Create New Account
        </button>
      </div>
    </div>
  );
}

// EditBalancePNL (unchanged)
function EditBalancePNL({ onSaved }) {
  const navigate = useNavigate();
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

      localStorage.setItem(`${newAccountId}_trades`, JSON.stringify([]));
      localStorage.setItem(`${newAccountId}_notes`, JSON.stringify([]));
      localStorage.setItem(`${newAccountId}_journals`, JSON.stringify([]));
      localStorage.setItem(`dashboard_${newAccountId}`, JSON.stringify({}));
      localStorage.setItem("currentAccountId", newAccountId);
      localStorage.setItem("accounts", JSON.stringify(accounts));

      navigate("/dashboard", { replace: true });
    } else {
      const accountIndex = accounts.findIndex(
        (a) => a.id === location.state.accountId
      );
      accounts[accountIndex] = { ...accounts[accountIndex], ...form };
      localStorage.setItem("accounts", JSON.stringify(accounts));
      navigate("/dashboard", { replace: true });
    }

    setIsSubmitting(false);
    if (onSaved) onSaved();
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
              {isSubmitting ? "Creating..." : isNewAccount ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main content
function AppContent() {
  const [open, setOpen] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initializeAccounts();
  }, []);

  useEffect(() => {
    const currentId = localStorage.getItem("currentAccountId");
    const isLoggedIn = !!currentId;

    const publicPaths = ["/", "/login", "/register"];

    if (isLoggedIn && publicPaths.includes(location.pathname)) {
      navigate("/dashboard", { replace: true });
    }

    if (!isLoggedIn && !publicPaths.includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate]);

  const initializeAccounts = () => {
    let storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    let currentId = localStorage.getItem("currentAccountId");

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
    navigate("/edit-balance-pnl");
  };

  const switchAccount = (accountId) => {
    localStorage.setItem("currentAccountId", accountId);
    navigate("/dashboard", { replace: true });
  };

  const deleteAccount = (accountId) => {
    let updated = accounts.filter((a) => a.id !== accountId);
    localStorage.removeItem(`${accountId}_trades`);
    localStorage.removeItem(`${accountId}_notes`);
    localStorage.removeItem(`${accountId}_journals`);
    localStorage.removeItem(`dashboard_${accountId}`);
    const currentId = localStorage.getItem("currentAccountId");

    if (currentId === accountId || updated.length === 0) {
      localStorage.removeItem("currentAccountId");
      localStorage.setItem("accounts", JSON.stringify(updated));
      navigate("/", { replace: true });
      return;
    }

    localStorage.setItem("accounts", JSON.stringify(updated));
    navigate("/dashboard", { replace: true });
  };

  const resetAccount = (accountId) => {
    localStorage.setItem(`${accountId}_trades`, JSON.stringify([]));
    localStorage.setItem(`${accountId}_notes`, JSON.stringify([]));
    localStorage.setItem(`${accountId}_journals`, JSON.stringify([]));
    localStorage.setItem(`dashboard_${accountId}`, JSON.stringify({}));
    navigate("/dashboard", { replace: true });
  };

  const renameAccount = (accountId, newName) => {
    const updated = accounts.map((a) =>
      a.id === accountId ? { ...a, name: newName } : a
    );
    localStorage.setItem("accounts", JSON.stringify(updated));
    navigate("/dashboard", { replace: true });
  };

  const isLoggedIn = !!localStorage.getItem("currentAccountId");

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100">
      {isLoggedIn && (
        <>
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
                marginLeft: open ? "calc(15rem + 8px)" : "calc(5rem + 8px)",
                maxWidth: open
                  ? "calc(100vw - 15rem - 8px)"
                  : "calc(100vw - 5rem - 8px)",
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
                    <Route path="/edit-balance-pnl" element={<EditBalancePNL onSaved={() => {}} />} />
                    <Route path="/trades/new" element={<AddTrade />} />
                    <Route path="*" element={<Dashboard currentAccount={currentAccount} />} />
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
