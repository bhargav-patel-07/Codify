"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SmoothCursor with no SSR
const SmoothCursor = dynamic(
  () => import('@/components/ui/cursor'),
  { 
    ssr: false,
    loading: () => null
  }
);

// Client-side only component for cursor
export default function CursorWrapper() {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const isTouchDevice = () => {
      // Temporarily disable touch device detection for testing
      return false;
      // return (
      //   'ontouchstart' in window || 
      //   navigator.maxTouchPoints > 0 || 
      //   window.matchMedia('(pointer:coarse)').matches ||
      //   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      // );
    };
    
    // Only render the cursor if it's not a touch device
    setShouldRender(!isTouchDevice());
  }, []);

  if (!shouldRender) return null;
  return <SmoothCursor />;
}
