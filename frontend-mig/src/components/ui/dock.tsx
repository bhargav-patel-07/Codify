"use client";

import React, { Children, cloneElement } from "react";
import "./Dock.css";

export type DockItemData = {
  icon: React.ReactNode;
  label?: React.ReactNode; // Made label optional
  onClick: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  baseItemSize: number;
};

function DockItem({
  children,
  className = "",
  onClick,
  baseItemSize,
}: DockItemProps) {
  return (
    <div
      style={{
        width: baseItemSize,
        height: baseItemSize,
      }}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {children}
    </div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};

function DockLabel({ children, className = "" }: DockLabelProps) {
  return (
    <div className={`dock-label ${className}`}>
      {children}
    </div>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

function DockIcon({ children, className = "" }: DockIconProps) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = "",
  panelHeight = 68,
  baseItemSize = 50,
}: DockProps) {
  return (
    <div className="dock-outer">
      <div
        className={`dock-panel ${className}`}
        style={{
          height: `${panelHeight}px`,
        }}
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            baseItemSize={baseItemSize}
            className={item.className}
          >
            <DockIcon>{item.icon}</DockIcon>
            {item.label && <DockLabel>{item.label}</DockLabel>}
          </DockItem>
        ))}
      </div>
    </div>
  );
}
