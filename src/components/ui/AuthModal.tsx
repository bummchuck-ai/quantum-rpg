'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = mode === 'login'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-[0_0_30px_rgba(0,255,255,0.1)] p-6">
        <h2 className="text-xl font-bold text-cyan-400 text-center mb-1">
          {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Melde dich an, um mit dem Game Master zu spielen
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded p-2 mb-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none text-sm"
            required
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none text-sm"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 text-white font-medium rounded transition-colors text-sm"
          >
            {loading ? '...' : mode === 'login' ? 'Einloggen' : 'Registrieren'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-xs">oder</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded transition-colors text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Mit Google anmelden
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-cyan-400 hover:text-cyan-300 text-xs"
          >
            {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Einloggen'}
          </button>
        </div>

        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-white text-lg"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
