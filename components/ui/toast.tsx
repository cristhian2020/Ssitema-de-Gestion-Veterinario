"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-5",
              t.type === "success" &&
                "bg-white/95 border-[#34c759]/30 text-[#1d1d1f]",
              t.type === "error" &&
                "bg-white/95 border-[#ff3b30]/30 text-[#1d1d1f]",
              t.type === "info" &&
                "bg-white/95 border-[#0066cc]/30 text-[#1d1d1f]"
            )}
          >
            <div className="flex items-center gap-3">
              {t.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-[#34c759] shrink-0" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-5 h-5 text-[#ff3b30] shrink-0" />
              )}
              {t.type === "info" && (
                <Info className="w-5 h-5 text-[#0066cc] shrink-0" />
              )}
              <span className="text-sm font-medium tracking-tight">
                {t.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#8e8e93] hover:text-[#1d1d1f] p-1 rounded-full hover:bg-[#f5f5f7] shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
