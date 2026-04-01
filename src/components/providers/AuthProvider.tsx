'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AuthModal from '@/components/ui/AuthModal';
import PricingModal from '@/components/ui/PricingModal';
import UpgradePrompt from '@/components/ui/UpgradePrompt';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore(s => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      {children}
      <AuthModal />
      <PricingModal />
      <UpgradePrompt />
    </>
  );
}
