"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GigPassport, PlatformRating, PLATFORMS } from "@/types";
import { toast } from "@/hooks/use-toast";
import { haptic } from "@/hooks/use-haptic";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";

// Dynamic imports for code splitting - these load only when needed
const PassportBook = dynamic(
  () => import("@/components/passport").then((mod) => mod.PassportBook),
  {
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
    ssr: false,
  }
);

const AddPlatformModal = dynamic(
  () => import("@/components/AddPlatformModal").then((mod) => mod.AddPlatformModal),
  { ssr: false }
);

const QRCodeModal = dynamic(
  () => import("@/components/QRCodeModal").then((mod) => mod.QRCodeModal),
  { ssr: false }
);

const AttestButton = dynamic(
  () => import("@/components/AttestButton").then((mod) => mod.AttestButton),
  { ssr: false }
);

export default function Home() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<"connect" | "create" | "view" | "loading">("connect");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [passport, setPassport] = useState<GigPassport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if passport exists in localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Simulate brief loading for smooth transition
    const timer = setTimeout(() => {
      if (isConnected && address) {
        const saved = window.localStorage.getItem(`passport-${address}`);
        if (saved) {
          setPassport(JSON.parse(saved));
          setStep("view");
        } else {
          setStep("create");
        }
      } else {
        setStep("connect");
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [isConnected, address]);

  // Save passport to localStorage and sync to API whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (passport && address) {
      window.localStorage.setItem(`passport-${address}`, JSON.stringify(passport));
      fetch(`/api/passport/${address}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passport),
      }).catch(console.error);
    }
  }, [passport, address]);

  const calculateOverallScore = (ratings: PlatformRating[]) => {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((acc, r) => acc + r.rating, 0);
    return total / ratings.length;
  };

  const calculateTotalDeliveries = (ratings: PlatformRating[]) => {
    return ratings.reduce((acc, r) => acc + r.totalDeliveries, 0);
  };

  const handleCreatePassport = () => {
    if (!name || !city || !address) return;

    haptic.success();
    const newPassport: GigPassport = {
      walletAddress: address,
      name,
      city,
      ratings: [],
      overallScore: 0,
      totalDeliveries: 0,
      createdAt: new Date().toISOString(),
    };

    setPassport(newPassport);
    setStep("view");
    toast.success("Passport created!", "Start adding your platforms");
  };

  const handleAddRating = (rating: PlatformRating) => {
    if (!passport) return;

    haptic.success();
    const platform = PLATFORMS.find(p => p.id === rating.platformId);
    const newRatings = [...passport.ratings, rating];
    const updated: GigPassport = {
      ...passport,
      ratings: newRatings,
      overallScore: calculateOverallScore(newRatings),
      totalDeliveries: calculateTotalDeliveries(newRatings),
    };

    setPassport(updated);
    toast.success("Stamp added!", `${platform?.name || "Platform"} added to your passport`);
  };

  const handleShare = async () => {
    haptic.light();
    const url = `${window.location.origin}/p/${address}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Gig Passport",
          text: `Check out my verified gig reputation!`,
          url,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!", "Share it with employers");
    }
  };

  const handleAttestationComplete = (uid: string, txHash: string) => {
    if (!passport) return;
    haptic.success();
    const updated: GigPassport = {
      ...passport,
      attestationUID: uid,
      attestationTxHash: txHash,
    };
    setPassport(updated);
    toast.success("Passport sealed!", "Your reputation is now on-chain");
  };

  // Refs for keyboard shortcut triggers
  const addStampRef = useRef<HTMLButtonElement>(null);
  const qrCodeRef = useRef<HTMLButtonElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "s",
      ctrl: true,
      action: () => step === "view" && handleShare(),
      description: "Share passport",
    },
    {
      key: "a",
      ctrl: true,
      action: () => step === "view" && addStampRef.current?.click(),
      description: "Add stamp",
    },
    {
      key: "q",
      ctrl: true,
      action: () => step === "view" && qrCodeRef.current?.click(),
      description: "Show QR code",
    },
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header - Mobile optimized */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🛂</span>
            <span className="font-semibold text-base sm:text-lg tracking-tight">
              Gig Passport
            </span>
          </div>
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="max-w-sm mx-auto py-6 space-y-4">
            <div className="flex items-center gap-4 justify-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
          </div>
        )}

        {/* Hero Section - Mobile first */}
        {!isLoading && step === "connect" && (
          <div className="max-w-2xl mx-auto text-center py-8 sm:py-16 space-y-6 sm:space-y-8">
            <h1 className="text-heading-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Own Your Reputation
            </h1>
            <p className="text-body-lg text-muted-foreground max-w-md mx-auto text-balance">
              Build 5 years on Zomato, lose it switching to Swiggy? Not anymore.
              Your ratings, portable and on-chain.
            </p>

            {/* Stats - Compact on mobile */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-sm mx-auto py-4 sm:py-6">
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
                <p className="text-xl sm:text-2xl font-bold text-blue-500">10M+</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Gig Workers
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
                <p className="text-xl sm:text-2xl font-bold text-purple-500">0</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Portable Ratings
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
                <p className="text-xl sm:text-2xl font-bold text-pink-500">∞</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Lost Chances
                </p>
              </div>
            </div>

            {/* Features - Stack on mobile */}
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 py-4">
              <Card className="text-left sm:text-center">
                <CardContent className="p-4 sm:pt-6 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                  <span className="text-2xl sm:text-3xl shrink-0">🔗</span>
                  <div className="sm:mt-2">
                    <h3 className="font-semibold text-sm sm:text-base">On-Chain Proof</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                      Ratings on Base. Verifiable by anyone.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="text-left sm:text-center">
                <CardContent className="p-4 sm:pt-6 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                  <span className="text-2xl sm:text-3xl shrink-0">🌐</span>
                  <div className="sm:mt-2">
                    <h3 className="font-semibold text-sm sm:text-base">Portable</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                      One link, all your work history.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="text-left sm:text-center">
                <CardContent className="p-4 sm:pt-6 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                  <span className="text-2xl sm:text-3xl shrink-0">🛡️</span>
                  <div className="sm:mt-2">
                    <h3 className="font-semibold text-sm sm:text-base">You Own It</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                      Your wallet, your reputation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <div className="pt-2 sm:pt-4">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    onClick={openConnectModal}
                    size="lg"
                    className="w-full sm:w-auto touch-target"
                  >
                    Connect Wallet to Start
                  </Button>
                )}
              </ConnectButton.Custom>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                Free forever • Built on Base
              </p>
            </div>
          </div>
        )}

        {/* Create Passport Form - Mobile optimized */}
        {!isLoading && step === "create" && (
          <div className="max-w-sm mx-auto py-6 sm:py-10 space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-heading-md">Create Your Passport</h2>
              <p className="text-body-sm text-muted-foreground">
                Set up your gig identity
              </p>
            </div>

            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Raj Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="touch-target"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g., Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="touch-target"
                  />
                </div>

                <Button
                  onClick={handleCreatePassport}
                  disabled={!name || !city}
                  className="w-full touch-target"
                >
                  Create Passport
                </Button>
              </CardContent>
            </Card>

            <p className="text-center text-[10px] text-muted-foreground text-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        )}

        {/* View Passport - Mobile first */}
        {!isLoading && step === "view" && passport && (
          <div className="max-w-sm sm:max-w-md mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Passport Book */}
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <PassportBook passport={passport} />
            </div>

            {/* Actions - Full width on mobile */}
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Passport actions">
              <AddPlatformModal
                onAdd={handleAddRating}
                existingPlatforms={passport.ratings.map((r) => r.platformId)}
              >
                <Button
                  ref={addStampRef}
                  className="w-full touch-target text-sm btn-interactive"
                  aria-label="Add platform stamp to passport (⌘A)"
                >
                  + Stamp
                </Button>
              </AddPlatformModal>

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full touch-target text-sm btn-interactive"
                aria-label="Share passport link (⌘S)"
              >
                Share
              </Button>

              <QRCodeModal
                url={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${address}`}
                name={passport.name}
              >
                <Button
                  ref={qrCodeRef}
                  variant="outline"
                  className="w-full touch-target text-sm btn-interactive"
                  aria-label="Show QR code for passport (⌘Q)"
                >
                  QR
                </Button>
              </QRCodeModal>
            </div>

            {/* Empty state hint */}
            {passport.ratings.length === 0 && (
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Add stamps for platforms you work on
                  </p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {PLATFORMS.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${p.color}20` }}
                      >
                        <Image
                          src={p.logo}
                          alt={p.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            if (target.parentElement) {
                              target.parentElement.innerHTML = `<span class="text-sm">${p.emoji}</span>`;
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attestation Section */}
            {passport.ratings.length > 0 && (
              <Card className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-teal-700 dark:text-teal-400">
                        {passport.attestationUID
                          ? "✓ On-Chain Verified"
                          : "Seal Your Passport"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {passport.attestationUID
                          ? "Permanent on Base"
                          : "Make it permanent on Base"}
                      </p>
                    </div>
                    <AttestButton
                      passport={passport}
                      onAttestationComplete={handleAttestationComplete}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer - Minimal on mobile */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground">
          Built on Base • Free Forever •{" "}
          <span className="hidden sm:inline">Press ? for shortcuts</span>
        </p>
      </footer>

      {/* Keyboard shortcuts help dialog */}
      <KeyboardShortcutsHelp />
    </div>
  );
}
