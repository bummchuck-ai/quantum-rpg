'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import IntroCrawl from '@/components/create/IntroCrawl';

export default function CrawlPage() {
  const router = useRouter();

  return (
    <IntroCrawl onComplete={() => router.push('/play')} />
  );
}
