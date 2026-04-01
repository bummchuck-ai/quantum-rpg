'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';

export default function UpgradePrompt() {
  const { showUpgradePrompt, setShowUpgradePrompt, setShowPricing, usage } = useAuthStore();

  if (!showUpgradePrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xs mx-4 bg-gray-900 border border-amber-500/40 rounded-lg shadow-[0_0_20px_rgba(255,191,0,0.1)] p-5 text-center">
        <div className="text-3xl mb-2">&#9889;</div>
        <h3 className="text-amber-400 font-bold mb-1">Tageslimit erreicht</h3>
        <p className="text-gray-300 text-sm mb-1">
          Du hast heute {usage?.dailyLimit || 5} von {usage?.dailyLimit || 5} GM-Anfragen genutzt.
        </p>
        {(usage?.credits ?? 0) > 0 && (
          <p className="text-gray-400 text-xs mb-4">
            Du hast noch {usage?.credits} Credits. Diese werden automatisch verwendet.
          </p>
        )}
        <div className="space-y-2">
          <button
            onClick={() => { setShowUpgradePrompt(false); setShowPricing(true); }}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded transition-colors text-sm"
          >
            Upgrade oder Credits kaufen
          </button>
          <button
            onClick={() => setShowUpgradePrompt(false)}
            className="w-full py-1.5 text-gray-400 hover:text-white text-xs"
          >
            Morgen weiterspielen
          </button>
        </div>
      </div>
    </div>
  );
}
