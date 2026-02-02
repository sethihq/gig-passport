"use client";

import dynamic from "next/dynamic";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatus } from "@/components/NetworkStatus";

const Web3Provider = dynamic(
  () => import("./Web3Provider").then((mod) => mod.Web3Provider),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <ToastProvider position="bottom-center">
          {children}
          <NetworkStatus />
        </ToastProvider>
      </Web3Provider>
    </ErrorBoundary>
  );
}
