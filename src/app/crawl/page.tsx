'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/store/characterStore';
import IntroCrawl from '@/components/create/IntroCrawl';

export default function CrawlPage() {
  const router = useRouter();
  const { players, activePlayerIndex } = useCharacterStore();
  const player = players[activePlayerIndex];

  const handleComplete = useCallback(() => {
    router.push('/play');
  }, [router]);

  // Guard: redirect if no character data
  if (!player?.species || !player?.career) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }

  return (
    <IntroCrawl onComplete={handleComplete} />
  );
}
