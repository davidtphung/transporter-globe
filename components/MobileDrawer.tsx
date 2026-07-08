"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function MobileDrawer({ open, title, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="drawer-scrim" aria-label="Close details panel" onClick={onClose} />
      <div className="drawer-panel">
        <header>
          <h2>{title}</h2>
          <button type="button" aria-label="Close details panel" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}