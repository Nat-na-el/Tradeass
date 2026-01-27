import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeProvider } from "./components/ThemeProvider";

import { AuthProvider, useAuth } from "./AuthContext";

import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import FloatingWidgets from "./components/FloatingWidgets";

import Dashboard from "./pages/Dashboard";
import DailyJournal from "./pages/DailyJournal";
import Trades from "./pages/Trades";
import Notebook from "./pages/Notebook";
import Reports from "./pages/Reports";
import Challenges from "./pages/Challenges";
import MentorMode from "./pages/MentorMode";
import SettingsPage from "./pages/SettingsPage";
import BacktestJournal from "./pages/BacktestJournal";
import QuantitativeAnalysis from "./pages/QuantitativeAnalysis";
import EditBalancePNL from "./pages/EditBalancePNL";
import AddTrade from "./pages/AddTrade";
import Login from "./pages/Login";

import ManageAccountsModal from "./components/modals/ManageAccountsModal";


// ------------------------- PROTECTED ROUTE ------------------------- //
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mr-2"
        />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return children;
}

// ------------------------- MAIN APP CONTENT ------------------------- //
function MainApp({
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
  return (
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
                <Route path="/" element={<Dashboard currentAccount={currentAccount} />} />
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

                {/* DO NOT ALLOW LOGIN WHEN LOGGED IN */}
                <Route path="/login" element={<Navigate to="/" replace />} />
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
  );
}

// ------------------------- APP CONTENT ------------------------- //

function AppContent() {
  const [open, setOpen] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);

  const { isLoggedIn, loading } = useAuth();

  // ----------------- ACCOUNT INITIALIZATION ----------------- //
  useEffect(() => {
    initializeAccounts();
  }, []);

  const initializeAccounts = () => {
    let storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    let currentId = localStorage.getItem("currentAccountId");

    // Always create main account
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

      localStorage.setItem(`${defaultAccountId}_trades`, JSON.stringify([]));
      localStorage.setItem(`${defaultAccountId}_notes`, JSON.stringify([]));
      localStorage.setItem(`${defaultAccountId}_journals`, JSON.stringify([]));
      localStorage.setItem(`dashboard_${defaultAccountId}`, JSON.stringify({}));

      currentId = defaultAccountId;
    }

    // Fix invalid current account ID
    if (!currentId || !storedAccounts.find((a) => a.id === currentId)) {
      currentId = storedAccounts[0].id;
      localStorage.setItem("currentAccountId", currentId);
    }

    setAccounts(storedAccounts);
    const current = storedAccounts.find((a) => a.id === currentId);
    setCurrentAccount(current);
  };

  // ------------------ ACCOUNT ACTIONS ------------------ //
  const createAccount = () => {
    window.location.href = "/edit-balance-pnl";
  };

  const switchAccount = (id) => {
    localStorage.setItem("currentAccountId", id);
    window.location.reload();
  };

  const deleteAccount = (id) => {
    let updated = accounts.filter((a) => a.id !== id);

    // Delete all related data
    localStorage.removeItem(`${id}_trades`);
    localStorage.removeItem(`${id}_notes`);
    localStorage.removeItem(`${id}_journals`);
    localStorage.removeItem(`dashboard_${id}`);

    let newId = localStorage.getItem("currentAccountId");

    if (newId === id || updated.length === 0) {
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
    } else {
      localStorage.setItem("accounts", JSON.stringify(updated));
    }

    window.location.reload();
  };

  const resetAccount = (id) => {
    localStorage.setItem(`${id}_trades`, JSON.stringify([]));
    localStorage.setItem(`${id}_notes`, JSON.stringify([]));
    localStorage.setItem(`${id}_journals`, JSON.stringify([]));
    localStorage.setItem(`dashboard_${id}`, JSON.stringify({}));
    window.location.reload();
  };

  const renameAccount = (id, name) => {
    const updated = accounts.map((a) => (a.id === id ? { ...a, name } : a));
    localStorage.setItem("accounts", JSON.stringify(updated));
    window.location.reload();
  };

  // ------------------ PUBLIC LOGIN ROUTES ------------------ //
  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    );
  }

  // ------------------ FULL APP ------------------ //
  return (
    <ThemeProvider>
      <Router>
        <ProtectedRoute>
          <MainApp
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
        </ProtectedRoute>
      </Router>
    </ThemeProvider>
  );
}

// ------------------------- ROOT APP ------------------------- //
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
