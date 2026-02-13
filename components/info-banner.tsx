"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";

interface InfoBannerProps {
  message: string;
}

export function InfoBanner({ message }: InfoBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="w-full border-b bg-background">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <p className="text-sm text-muted-foreground">{message}</p>
        <button
          onClick={() => setVisible(false)}
          className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Fermer"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
