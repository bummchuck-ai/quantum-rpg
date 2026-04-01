'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const PLANS = [
  {
    name: 'Free',
    price: '0 €',
    period: '',
    features: ['5 GM-Anfragen / Tag', 'Character erstellen', 'Grundlegende Abenteuer'],
    priceId: null,
    highlight: false,
  },
  {
    name: 'Standard',
    price: '4,99 €',
    period: '/ Monat',
    features: ['30 GM-Anfragen / Tag', 'Alle Features', 'Erweiterte Quests'],
    priceId: 'price_1THN7XJHJP8oL7R34UUTsQ73',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '9,99 €',
    period: '/ Monat',
    features: ['100 GM-Anfragen / Tag', 'Alle Features', 'Priority Support', 'Exklusive Inhalte'],
    priceId: 'price_1THN7YJHJP8oL7R3lvCngsFV',
    highlight: true,
  },
];

const CREDIT_PACKS = [
  { name: '10 Credits', price: '0,99 €', priceId: 'price_1THN79JHJP8oL7R3wdyukevp' },
  { name: '50 Credits', price: '3,99 €', priceId: 'price_1THN7AJHJP8oL7R38zVN1wnf' },
  { name: '150 Credits', price: '9,99 €', priceId: 'price_1THN7BJHJP8oL7R3piiiNgMu', best: true },
];

export default function PricingModal() {
  const { showPricing, setShowPricing, session, usage } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  if (!showPricing) return null;

  const handleCheckout = async (priceId: string) => {
    if (!session) return;
    setLoading(priceId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Error handling
    }
    setLoading(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-2xl mx-4 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-[0_0_30px_rgba(0,255,255,0.1)] p-6">
        <button
          onClick={() => setShowPricing(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-white text-lg"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-cyan-400 text-center mb-1">Quantum Verse Abos</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          {usage ? `Aktuell: ${usage.tier.charAt(0).toUpperCase() + usage.tier.slice(1)}` : 'Wähle deinen Plan'}
        </p>

        {/* Subscription Plans */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`rounded-lg p-4 border ${
                plan.highlight
                  ? 'border-cyan-500 bg-cyan-950/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <h3 className="text-white font-bold text-sm">{plan.name}</h3>
              <div className="mt-1">
                <span className="text-xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 text-xs">{plan.period}</span>
              </div>
              <ul className="mt-3 space-y-1">
                {plan.features.map(f => (
                  <li key={f} className="text-gray-300 text-xs flex items-start gap-1">
                    <span className="text-cyan-400 mt-0.5">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.priceId && usage?.tier !== plan.name.toLowerCase() && (
                <button
                  onClick={() => handleCheckout(plan.priceId!)}
                  disabled={loading === plan.priceId}
                  className={`mt-3 w-full py-1.5 rounded text-xs font-medium transition-colors ${
                    plan.highlight
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  } disabled:opacity-50`}
                >
                  {loading === plan.priceId ? '...' : 'Auswählen'}
                </button>
              )}
              {usage?.tier === plan.name.toLowerCase() && (
                <div className="mt-3 w-full py-1.5 rounded text-xs font-medium text-center text-cyan-400 border border-cyan-500/30">
                  Aktiv
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Credit Packs */}
        <h3 className="text-white font-bold text-sm mb-3">Credits nachkaufen</h3>
        <p className="text-gray-400 text-xs mb-3">1 Credit = 1 GM-Anfrage. Nutzbar wenn dein Tageslimit erreicht ist.</p>
        <div className="grid grid-cols-3 gap-3">
          {CREDIT_PACKS.map(pack => (
            <button
              key={pack.name}
              onClick={() => handleCheckout(pack.priceId)}
              disabled={loading === pack.priceId}
              className={`rounded-lg p-3 border text-left transition-colors ${
                pack.best
                  ? 'border-yellow-500/50 bg-yellow-950/20 hover:bg-yellow-950/30'
                  : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
              } disabled:opacity-50`}
            >
              {pack.best && <span className="text-yellow-400 text-[10px] font-bold">BEST VALUE</span>}
              <div className="text-white font-bold text-sm">{pack.name}</div>
              <div className="text-gray-400 text-xs">{pack.price}</div>
            </button>
          ))}
        </div>

        {usage && (
          <div className="mt-4 text-center text-gray-500 text-xs">
            Credits: {usage.credits} | Heute: {usage.dailyUsed}/{usage.dailyLimit} Anfragen
          </div>
        )}
      </div>
    </div>
  );
}
