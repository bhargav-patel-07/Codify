import React from 'react';

interface GridBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const GridBackground = ({ children, className = '' }: GridBackgroundProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Grid pattern */}
      <div className="absolute inset-0 -z-10 bg-grid-gray-100 [mask-image:linear-gradient(to_bottom,transparent,white_20%,white_80%,transparent)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />
      </div>
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
