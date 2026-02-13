"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { FiCheck, FiX, FiAlertCircle, FiInfo } from "react-icons/fi";

/* ─── Types ─── */

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

/* ─── Context ─── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ─── Icon map ─── */

const icons: Record<ToastType, ReactNode> = {
  success: <FiCheck className="h-4 w-4" />,
  error: <FiX className="h-4 w-4" />,
  info: <FiInfo className="h-4 w-4" />,
  warning: <FiAlertCircle className="h-4 w-4" />,
};

const bgColors: Record<ToastType, string> = {
  success: "bg-primary text-primary-foreground",
  error: "bg-destructive text-white",
  info: "bg-foreground text-background",
  warning: "bg-yellow-500 text-white",
};

/* ─── Single toast item ─── */

function ToastItem({
  toast: t,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Schedule exit
    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(t.id), 300);
    }, t.duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [t.id, t.duration, onRemove]);

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 ${bgColors[t.type]} ${
        visible && !exiting
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2"
      }`}
    >
      <span className="shrink-0">{icons[t.type]}</span>
      <span>{t.message}</span>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(t.id), 300);
        }}
        className="ml-auto shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <FiX className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Provider + Toaster ─── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "success", duration: number = 3000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast, showToast: addToast }}>
      {children}
      {/* Toast container — fixed bottom-center */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
