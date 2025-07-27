"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const Cursor = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Smooth the cursor movement with spring physics
  const springConfig = { damping: 25, stiffness: 300 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);
  const scale = useSpring(isHovered ? 1.5 : 1, {
    damping: 15,
    stiffness: 300
  });

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Show cursor after component mounts
    setIsVisible(true);

    // Hide default cursor
    document.body.style.cursor = 'none';

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12); // Center the cursor
      cursorY.set(e.clientY - 12); // Center the cursor
    };

    // Check for hoverable elements
    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    // Add event listeners
    window.addEventListener('mousemove', moveCursor);
    
    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      // Cleanup
      window.removeEventListener('mousemove', moveCursor);
      document.body.style.cursor = 'auto';
      
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [cursorX, cursorY]);

  // Don't render on mobile or during SSR
  if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none w-6 h-6 rounded-full bg-blue-500 mix-blend-difference"
      style={{
        x,
        y,
        scale,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease, transform 0.1s ease-out',
      }}
    />
  );
};

export default Cursor;
