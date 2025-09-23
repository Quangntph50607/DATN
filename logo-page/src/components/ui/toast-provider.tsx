"use client";
import React, { createContext, useState, useCallback, ReactNode, FC } from "react";

type Toast = {
  id: number;
  message: string;
  type?: "info" | "success" | "error" | "warning";
};

type ToastContextType = {
  toasts: Toast[];
  toast: (options: { message: string; type?: Toast["type"] }) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ message, type = "info" }: { message: string; type?: Toast["type"] }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            style={{
              marginBottom: 8,
              padding: 12,
              borderRadius: 4,
              color: "white",
              backgroundColor:
                type === "success"
                  ? "green"
                  : type === "error"
                  ? "red"
                  : type === "warning"
                  ? "orange"
                  : "gray",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              minWidth: 200,
              fontWeight: "bold",
            }}
          >
            {message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
