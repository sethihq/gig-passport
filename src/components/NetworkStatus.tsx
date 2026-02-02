"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { Button } from "@/components/ui/button";

export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { isUpdateAvailable, update } = useServiceWorker();
  const [showReconnected, setShowReconnected] = useState(false);

  // Show "Back online" message briefly when reconnecting
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium safe-top"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-yellow-900 rounded-full animate-pulse" />
              You&apos;re offline. Some features may be unavailable.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Online Toast */}
      <AnimatePresence>
        {showReconnected && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span>✓</span>
              Back online
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Banner */}
      <AnimatePresence>
        {isUpdateAvailable && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-[100] bg-blue-500 text-white p-4 rounded-lg shadow-lg sm:left-auto sm:right-4 sm:w-auto sm:max-w-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Update available</p>
                <p className="text-sm text-blue-100">Refresh to get the latest version</p>
              </div>
              <Button
                onClick={update}
                size="sm"
                variant="secondary"
                className="shrink-0 bg-white text-blue-600 hover:bg-blue-50"
              >
                Refresh
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
