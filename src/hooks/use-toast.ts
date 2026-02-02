"use client";

import { toastManager } from "@/components/ui/toast";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    return toastManager.add({
      title: options.title,
      description: options.description,
      type: options.type,
      timeout: options.duration ?? 4000,
    });
  };

  const success = (title: string, description?: string) => {
    return toast({ title, description, type: "success" });
  };

  const error = (title: string, description?: string) => {
    return toast({ title, description, type: "error" });
  };

  const info = (title: string, description?: string) => {
    return toast({ title, description, type: "info" });
  };

  const warning = (title: string, description?: string) => {
    return toast({ title, description, type: "warning" });
  };

  const loading = (title: string, description?: string) => {
    return toast({ title, description, type: "loading", duration: 60000 });
  };

  const dismiss = (_id: string) => {
    // Toast auto-dismisses; manual dismiss not supported by base-ui
  };

  return {
    toast,
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
  };
}

// Simple function for non-hook contexts
export const toast = {
  success: (title: string, description?: string) => {
    return toastManager.add({ title, description, type: "success", timeout: 4000 });
  },
  error: (title: string, description?: string) => {
    return toastManager.add({ title, description, type: "error", timeout: 4000 });
  },
  info: (title: string, description?: string) => {
    return toastManager.add({ title, description, type: "info", timeout: 4000 });
  },
  warning: (title: string, description?: string) => {
    return toastManager.add({ title, description, type: "warning", timeout: 4000 });
  },
  loading: (title: string, description?: string) => {
    return toastManager.add({ title, description, type: "loading", timeout: 60000 });
  },
  dismiss: (_id: string) => {
    // Toast auto-dismisses; manual dismiss not supported by base-ui
  },
};
