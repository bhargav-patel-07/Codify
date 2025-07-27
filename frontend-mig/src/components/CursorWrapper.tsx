"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Cursor with no SSR
const Cursor = dynamic(
  () => import('@/components/ui/cursor').then(mod => mod.SmoothCursor),
  { ssr: false }
);

export default function CursorWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  // Only render on non-touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
    return <Cursor />;
  }
  
  return null;
}
