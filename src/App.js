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
import Backtest from "./pages/Backtest";
import AddTrade from "./components/ui/AddTrade";
import QuantitativeAnalysis from "./pages/QuantitativeAnalysis";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import { db, auth } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// ManageAccountsModal (updated to Firestore)
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
          {accounts.map((account) => (
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
                          <div>{account.totalTrades} trades • ${account.totalPnL.toFixed(2)} P&L</div>
                          <div>{account.totalJournals} journals • {account.totalNotes} notes</div>
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
          ))}
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

// EditBalancePNL (updated to Firestore)
function EditBalancePNL({ onSaved }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", startingBalance: 10000 });
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    if (location.state?.accountId) {
      // Edit existing
      const loadAccount = async () => {
        const accountRef = doc(db, "users", user.uid, "accounts", location.state.accountId);
        const accountSnap = await getDoc(accountRef);
        if (accountSnap.exists()) {
          const data = accountSnap.data();
          setForm({
            name: data.name,
            startingBalance: data.startingBalance,
          });
          setIsNewAccount(false);
        }
      };
      loadAccount();
    } else {
      // New
      setIsNewAccount(true);
      setForm({
        name: `Account ${Date.now().toString().slice(-3)}`,
        startingBalance: 10000,
      });
    }
  }, [location, navigate]);

  const saveAccount = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const user = auth.currentUser;
    if (!user) return;

    try {
      if (isNewAccount) {
        // Add new account
        const accountRef = await addDoc(collection(db, "users", user.uid, "accounts"), {
          name: form.name,
          startingBalance: Number(form.startingBalance),
          totalPnL: 0,
          createdAt: serverTimestamp(),
        });
        localStorage.setItem("currentAccountId", accountRef.id); // optional – keep for multi-account
        navigate("/dashboard", { replace: true });
      } else {
        // Update existing
        const accountRef = doc(db, "users", user.uid, "accounts", location.state.accountId);
        await updateDoc(accountRef, {
          name: form.name,
          startingBalance: Number(form.startingBalance),
        });
        navigate("/dashboard", { replace: true });
      }
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Account save error:", err);
    } finally {
      setIsSubmitting(false);
    }
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
              {isSubmitting ? "Saving..." : isNewAccount ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// AppContent (updated to Firestore for accounts, remove FloatingWidgets)
function AppContent() {
  const [open, setOpen] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setAccounts([]);
      setCurrentAccount(null);
      return;
    }

    const loadAccounts = async () => {
      const q = query(collection(db, "users", user.uid, "accounts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const loadedAccounts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(loadedAccounts);

      // Set current account to first one if none selected
      let currentId = localStorage.getItem("currentAccountId");
      if (!currentId || !loadedAccounts.find((a) => a.id === currentId)) {
        currentId = loadedAccounts[0]?.id || null;
        if (currentId) localStorage.setItem("currentAccountId", currentId);
      }

      setCurrentAccount(loadedAccounts.find((a) => a.id === currentId));
    };

    loadAccounts();
  }, []);

  const initializeAccounts = () => {
    // No longer needed – now in useEffect with Firestore
  };

  const createAccount = () => {
    navigate("/edit-balance-pnl");
  };

  const switchAccount = async (accountId) => {
    localStorage.setItem("currentAccountId", accountId);
    setCurrentAccount(accounts.find((a) => a.id === accountId));
    navigate("/dashboard", { replace: true });
  };

  const deleteAccount = async (accountId) => {
    if (!window.confirm("Delete this account? All data will be lost!")) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      // Delete account document
      await deleteDoc(doc(db, "users", user.uid, "accounts", accountId));
      
      // You can add deletion of subcollections if needed (trades, notes, journals) – but Firestore doesn't auto-delete them, so use a function if required
      // For now, we assume data is tied to account, but Firestore subcollections are separate

      const updated = accounts.filter((a) => a.id !== accountId);
      setAccounts(updated);
      if (localStorage.getItem("currentAccountId") === accountId || updated.length === 0) {
        localStorage.removeItem("currentAccountId");
        navigate("/", { replace: true });
        return;
      }

      switchAccount(updated[0].id);
    } catch (err) {
      console.error("Delete account error:", err);
    }
  };

  const resetAccount = async (accountId) => {
    if (!window.confirm("Reset all trades/notes/journals for this account?")) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      // Delete all trades
      const tradesQ = query(collection(db, "users", user.uid, "trades"));
      const tradesSnap = await getDocs(tradesQ);
      tradesSnap.forEach(async (d) => await deleteDoc(d.ref));

      // Delete notes
      const notesQ = query(collection(db, "users", user.uid, "notes"));
      const notesSnap = await getDocs(notesQ);
      notesSnap.forEach(async (d) => await deleteDoc(d.ref));

      // Delete journals
      const journalsQ = query(collection(db, "users", user.uid, "journals"));
      const journalsSnap = await getDocs(journalsQ);
      journalsSnap.forEach(async (d) => await deleteDoc(d.ref));

      // Reset totalPnL in account
      await updateDoc(doc(db, "users", user.uid, "accounts", accountId), {
        totalPnL: 0,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Reset account error:", err);
    }
  };

  const renameAccount = async (accountId, newName) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid, "accounts", accountId), {
        name: newName,
      });
      const updated = accounts.map((a) =>
        a.id === accountId ? { ...a, name: newName } : a
      );
      setAccounts(updated);
      setCurrentAccount(updated.find((a) => a.id === accountId));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Rename account error:", err);
    }
  };

  const isLoggedIn = !!auth.currentUser;

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
                    <Route path="/backtest" element={<Backtest />} />
                    <Route path="/quantitative-analysis" element={<QuantitativeAnalysis />} />
                    <Route path="/edit-balance-pnl" element={<EditBalancePNL onSaved={() => {}} />} />
                    <Route path="/trades/new" element={<AddTrade />} />
                    <Route path="*" element={<Dashboard currentAccount={currentAccount} />} />
                  </Routes>
                </div>
              </main>
            </div>

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
