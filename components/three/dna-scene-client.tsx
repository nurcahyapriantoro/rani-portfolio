'use client';

import dynamic from 'next/dynamic';

const DNAScene = dynamic(() => import('./dna-scene').then((m) => m.DNAScene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-32 h-32 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  )
});

export function DNASceneClient() {
  return <DNAScene />;
}