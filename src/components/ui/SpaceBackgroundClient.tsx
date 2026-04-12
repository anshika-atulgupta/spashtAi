'use client';

import dynamic from 'next/dynamic';

const SpaceBackground = dynamic(
  () => import('@/components/ui/SpaceBackground'),
  { ssr: false }
);

export default function SpaceBackgroundClient() {
  return <SpaceBackground />;
}
