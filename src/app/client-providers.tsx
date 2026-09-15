"use client";

import { useEffect } from "react";
import { initializeAuth } from "@/lib/auth";
import { initializeTheme } from "@/stores/app-store";
import { ToastProvider } from "@/components/ui/toast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAuth();
    initializeTheme();
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
}
