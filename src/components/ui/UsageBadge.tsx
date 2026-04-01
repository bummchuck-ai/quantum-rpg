'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';

export default function UsageBadge() {
  const { user, usage, setShowPricing } = useAuthStore();

  if (!user || !usage) return null;

  const pct = Math.round((usage.dailyUsed / usage.dailyLimit) * 100);
  const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-cyan-500';

  return (
    <button
      onClick={() => setShowPricing(true)}
      className="flex items-center gap-2 px-2 py-1 bg-gray-800/80 border border-gray-700/50 rounded text-xs hover:border-cyan-500/30 transition-colors"
      title="Abo & Credits"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <span className="text-gray-400">{usage.dailyRemaining}/{usage.dailyLimit}</span>
      </div>
      {usage.credits > 0 && (
        <span className="text-yellow-400">+{usage.credits}C</span>
      )}
    </button>
  );
}
