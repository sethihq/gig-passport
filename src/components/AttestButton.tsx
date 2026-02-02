"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GigPassport } from "@/types";
import {
  createPassportAttestation,
  getEASSigner,
  getAttestationUrl,
  getTransactionUrl,
} from "@/lib/eas";
import { haptic } from "@/hooks/use-haptic";

interface AttestButtonProps {
  passport: GigPassport;
  onAttestationComplete: (uid: string, txHash: string) => void;
}

export function AttestButton({
  passport,
  onAttestationComplete,
}: AttestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "confirming" | "attesting" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    uid: string;
    txHash: string;
  } | null>(null);

  const handleAttest = async () => {
    haptic.medium();
    setStatus("confirming");
    setError(null);

    try {
      const signer = await getEASSigner();
      if (!signer) {
        throw new Error("Could not connect to wallet");
      }

      setStatus("attesting");

      const attestResult = await createPassportAttestation(passport, signer);

      if (!attestResult.success) {
        haptic.error();
        throw new Error(attestResult.error || "Attestation failed");
      }

      haptic.success();
      setResult({
        uid: attestResult.uid!,
        txHash: attestResult.txHash!,
      });
      setStatus("success");
      onAttestationComplete(attestResult.uid!, attestResult.txHash!);
    } catch (err) {
      haptic.error();
      console.error("Attestation error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  };

  // Already attested
  if (passport.attestationUID) {
    return (
      <Button
        variant="outline"
        className="border-green-600 text-green-400 hover:bg-green-900/20"
        onClick={() =>
          window.open(getAttestationUrl(passport.attestationUID!), "_blank")
        }
      >
        ✓ View On-Chain
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => {
          haptic.light();
          setIsOpen(true);
        }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 btn-interactive"
        aria-label="Create on-chain attestation for passport"
      >
        ⛓️ Attest On-Chain
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Attest Your Passport On-Chain</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {status === "idle" && (
              <>
                <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">What this does:</h4>
                  <ul className="text-sm text-zinc-400 space-y-1">
                    <li>• Creates a permanent record on Base blockchain</li>
                    <li>• Anyone can verify your reputation is real</li>
                    <li>• Cannot be deleted or modified</li>
                    <li>• Uses Ethereum Attestation Service (EAS)</li>
                  </ul>
                </div>

                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong>Cost:</strong> ~$0.01 in ETH gas on Base
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Make sure you have some ETH on Base network
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                    className="flex-1 border-zinc-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAttest}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Attest Now
                  </Button>
                </div>
              </>
            )}

            {status === "confirming" && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔐</div>
                <p className="font-medium">Confirm in your wallet</p>
                <p className="text-sm text-zinc-400 mt-2">
                  Please approve the transaction in your wallet
                </p>
              </div>
            )}

            {status === "attesting" && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 animate-pulse">⛓️</div>
                <p className="font-medium">Creating attestation...</p>
                <p className="text-sm text-zinc-400 mt-2">
                  This may take a few seconds
                </p>
              </div>
            )}

            {status === "success" && result && (
              <div className="text-center py-4 space-y-4">
                <div className="text-5xl">✅</div>
                <div>
                  <p className="font-medium text-green-400">
                    Attestation Created!
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Your passport is now permanently on-chain
                  </p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-3 text-left">
                  <p className="text-xs text-zinc-500">Attestation UID</p>
                  <p className="text-xs font-mono text-zinc-300 truncate">
                    {result.uid}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      window.open(getAttestationUrl(result.uid), "_blank")
                    }
                    variant="outline"
                    className="flex-1 border-zinc-700"
                  >
                    View on EAS
                  </Button>
                  <Button
                    onClick={() =>
                      window.open(getTransactionUrl(result.txHash), "_blank")
                    }
                    variant="outline"
                    className="flex-1 border-zinc-700"
                  >
                    View Tx
                  </Button>
                </div>

                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Done
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-4 space-y-4">
                <div className="text-5xl">❌</div>
                <div>
                  <p className="font-medium text-red-400">Attestation Failed</p>
                  <p className="text-sm text-zinc-400 mt-1">{error}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="outline"
                    className="flex-1 border-zinc-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setStatus("idle");
                      setError(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
