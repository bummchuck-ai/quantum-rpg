import { create } from 'zustand';
import { supabase } from '../lib/supabase-client';
import type { User, Session } from '@supabase/supabase-js';

interface UsageInfo {
  tier: string;
  dailyUsed: number;
  dailyLimit: number;
  dailyRemaining: number;
  credits: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  usage: UsageInfo | null;
  loading: boolean;
  showAuthModal: boolean;
  showPricing: boolean;
  showUpgradePrompt: boolean;

  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchUsage: () => Promise<void>;
  setShowAuthModal: (show: boolean) => void;
  setShowPricing: (show: boolean) => void;
  setShowUpgradePrompt: (show: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  usage: null,
  loading: true,
  showAuthModal: false,
  showPricing: false,
  showUpgradePrompt: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, session, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session });
      if (session) get().fetchUsage();
    });

    if (session) get().fetchUsage();
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    set({ showAuthModal: false });
    return {};
  },

  signUpWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    set({ showAuthModal: false });
    return {};
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/play` },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, usage: null });
  },

  fetchUsage: async () => {
    const { session } = get();
    if (!session) return;
    try {
      const res = await fetch('/api/usage', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const usage = await res.json();
        set({ usage });
      }
    } catch {
      // Silent fail — usage display will show defaults
    }
  },

  setShowAuthModal: (show) => set({ showAuthModal: show }),
  setShowPricing: (show) => set({ showPricing: show }),
  setShowUpgradePrompt: (show) => set({ showUpgradePrompt: show }),
}));
