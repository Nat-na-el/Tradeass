// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';           // adjust path if needed
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        syncFirebaseUserToLocalAccount(currentUser);
      } else {
        localStorage.removeItem('currentAccountId');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ────────────────────────────────────────────────
// Your existing sync logic (moved here so it's reusable)
function syncFirebaseUserToLocalAccount(user: User) {
  const uid = user.uid;
  let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  let account = accounts.find((acc: any) => acc.id === uid);

  if (!account) {
    account = {
      id: uid,
      name: user.displayName || user.email?.split('@')[0] || 'Trader',
      startingBalance: 10000,
      totalPnL: 0,
      createdAt: new Date().toISOString(),
    };
    accounts.push(account);
    localStorage.setItem('accounts', JSON.stringify(accounts));

    localStorage.setItem(`${uid}_trades`, JSON.stringify([]));
    localStorage.setItem(`${uid}_notes`, JSON.stringify([]));
    localStorage.setItem(`${uid}_journals`, JSON.stringify([]));
    localStorage.setItem(`dashboard_${uid}`, JSON.stringify({}));
  }

  localStorage.setItem('currentAccountId', uid);
}
