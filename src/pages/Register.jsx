// Replace your existing handleEmailRegister with this
const handleEmailRegister = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    let accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    if (!accounts.find(acc => acc.id === uid)) {
      const account = {
        id: uid,
        name: email.split('@')[0] || "New Trader",
        startingBalance: 10000,
        totalPnL: 0,
        createdAt: new Date().toISOString(),
      };
      accounts.push(account);
      localStorage.setItem("accounts", JSON.stringify(accounts));

      localStorage.setItem(`${uid}_trades`, JSON.stringify([]));
      localStorage.setItem(`${uid}_notes`, JSON.stringify([]));
      localStorage.setItem(`${uid}_journals`, JSON.stringify([]));
      localStorage.setItem(`dashboard_${uid}`, JSON.stringify({}));
    }

    localStorage.setItem("currentAccountId", uid);
    navigate('/');
  } catch (err) {
    setError(err.message);
  }
};

// Replace your existing handleGoogleRegister with this
const handleGoogleRegister = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const uid = result.user.uid;

    let accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
    if (!accounts.find(acc => acc.id === uid)) {
      const account = {
        id: uid,
        name: result.user.displayName || result.user.email.split('@')[0] || "Google Trader",
        startingBalance: 10000,
        totalPnL: 0,
        createdAt: new Date().toISOString(),
      };
      accounts.push(account);
      localStorage.setItem("accounts", JSON.stringify(accounts));

      localStorage.setItem(`${uid}_trades`, JSON.stringify([]));
      localStorage.setItem(`${uid}_notes`, JSON.stringify([]));
      localStorage.setItem(`${uid}_journals`, JSON.stringify([]));
      localStorage.setItem(`dashboard_${uid}`, JSON.stringify({}));
    }

    localStorage.setItem("currentAccountId", uid);
    navigate('/');
  } catch (err) {
    setError(err.message);
  }
};
