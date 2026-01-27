// Replace your AppContent function with this version:

function AppContent() {
  const [open, setOpen] = useState(true);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    initializeAccounts();
  }, []);

  useEffect(() => {
    if (!loading && !isLoggedIn && window.location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, loading, navigate]);

  const initializeAccounts = () => {
    let storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    let currentId = localStorage.getItem("currentAccountId");

    // ✅ ALWAYS HAVE MAIN ACCOUNT
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

      // ✅ PRESERVE MAIN TRADES
      if (!localStorage.getItem(`${defaultAccountId}_trades`)) {
        localStorage.setItem(`${defaultAccountId}_trades`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`${defaultAccountId}_notes`)) {
        localStorage.setItem(`${defaultAccountId}_notes`, JSON.stringify([]));
      }
      if (!localStorage.getItem(`${defaultAccountId}_journals`)) {
        localStorage.setItem(
          `${defaultAccountId}_journals`,
          JSON.stringify([]),
        );
      }
      if (!localStorage.getItem(`dashboard_${defaultAccountId}`)) {
        localStorage.setItem(
          `dashboard_${defaultAccountId}`,
          JSON.stringify({}),
        );
      }
      currentId = defaultAccountId;
    }

    // ✅ FIX CURRENT ID
    if (!currentId || !storedAccounts.find((a) => a.id === currentId)) {
      currentId = storedAccounts[0].id;
      localStorage.setItem("currentAccountId", currentId);
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

    // ✅ IF DELETED CURRENT - CREATE NEW MAIN
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

  // Only show login page if not logged in
  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </Router>
      </ThemeProvider>
    );
  }

  // Show full app if logged in
  return (
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
                    <Route
                      path="/"
                      element={<Dashboard currentAccount={currentAccount} />}
                    />
                    <Route path="/journal" element={<DailyJournal />} />
                    <Route path="/trades" element={<Trades />} />
                    <Route path="/notebook" element={<Notebook />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/challenges" element={<Challenges />} />
                    <Route path="/mentor" element={<MentorMode />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/backtest" element={<BacktestJournal />} />
                    <Route
                      path="/quantitative-analysis"
                      element={<QuantitativeAnalysis />}
                    />
                    <Route
                      path="/edit-balance-pnl"
                      element={<EditBalancePNL onSaved={() => {}} />}
                    />
                    <Route path="/trades/new" element={<AddTrade />} />
                    <Route path="/login" element={<Login />} />
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
  );
}

// Keep the same export default function App()
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}