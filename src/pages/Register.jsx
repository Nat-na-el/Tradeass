// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Register with email + password
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem('currentAccountId', userCredential.user.uid);
      createUserAccount(userCredential.user.uid, email); // Auto-create separate data
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // Register with Google
  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem('currentAccountId', result.user.uid);
      createUserAccount(result.user.uid, result.user.email); // Auto-create separate data
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // Auto-create local account entry for new user (separate trades/notes)
  const createUserAccount = (uid, email) => {
    const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    if (!accounts.find(a => a.id === uid)) {
      const newAccount = {
        id: uid,
        name: email.split('@')[0], // e.g., "abebech" from email
        startingBalance: 10000,
        totalPnL: 0,
        createdAt: new Date().toISOString(),
      };
      accounts.unshift(newAccount);
      localStorage.setItem('accounts', JSON.stringify(accounts));

      // Create empty data for this user (separate from others)
      localStorage.setItem(`${uid}_trades`, JSON.stringify([]));
      localStorage.setItem(`${uid}_notes`, JSON.stringify([]));
      localStorage.setItem(`${uid}_journals`, JSON.stringify([]));
      localStorage.setItem(`dashboard_${uid}`, JSON.stringify({}));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Create Tradeass Account</h1>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        <form onSubmit={handleEmailRegister} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              className="mt-1"
            />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 mt-2">
            Create Account
          </Button>
        </form>

        <div className="my-6 text-center text-gray-500 dark:text-gray-400">or</div>

        <Button
          onClick={handleGoogleRegister}
          variant="outline"
          className="w-full flex items-center justify-center gap-3 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.44-3.39-7.44-7.565s3.345-7.565 7.44-7.565c2.33 0 3.918.98 4.82 1.83l3.28-3.16C18.72 1.45 15.66 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.87 11.52-11.74 0-.79-.085-1.39-.185-1.99H12.24z"
            />
          </svg>
          Sign up with Google
        </Button>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
