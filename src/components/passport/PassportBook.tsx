"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { GigPassport } from "@/types";
import { PlatformStamp, VerifiedStamp } from "./PlatformStamp";

interface PassportBookProps {
  passport: GigPassport;
  onPageChange?: (page: number) => void;
}

export function PassportBook({ passport, onPageChange }: PassportBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(passport.ratings.length / 2) + 1;

  const goToPage = useCallback(
    (page: number) => {
      if (page < 0 || page > totalPages || isFlipping) return;
      setIsFlipping(true);
      setCurrentPage(page);
      onPageChange?.(page);
      setTimeout(() => setIsFlipping(false), 700);
    },
    [totalPages, onPageChange, isFlipping]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 80;
      if (info.offset.x < -threshold && currentPage < totalPages) {
        goToPage(currentPage + 1);
      } else if (info.offset.x > threshold && currentPage > 0) {
        goToPage(currentPage - 1);
      }
      dragX.set(0);
    },
    [currentPage, totalPages, goToPage, dragX]
  );

  // Subtle drag rotation effect
  const dragRotateY = useTransform(dragX, [-200, 0, 200], [-15, 0, 15]);

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* 3D Book Container */}
      <div
        ref={containerRef}
        className="passport-book-container relative aspect-[3/4] w-full"
        style={{ perspective: "2000px" }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            rotateY: dragRotateY,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          onDrag={(_, info) => dragX.set(info.offset.x)}
        >
          {/* Book Base Shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-black/20 blur-xl rounded-full" />

          {/* Book Spine - 3D effect */}
          <div className="absolute left-0 top-0 bottom-0 w-5 sm:w-6 z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-l-md shadow-inner" />
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-amber-950 to-transparent" />
            {/* Spine stitching */}
            <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-[2px] flex flex-col gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-full h-2 bg-amber-700/40 rounded-full" />
              ))}
            </div>
            {/* Gold text on spine */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
              <span className="text-[8px] font-serif tracking-[0.3em] text-amber-400/80 uppercase">
                Gig Passport
              </span>
            </div>
          </div>

          {/* Page Stack Effect (visible pages beneath) */}
          <div className="absolute top-1 bottom-1 right-0 w-2 ml-5 sm:ml-6 z-0">
            <div className="absolute inset-0 right-0 w-[3px] bg-stone-100 rounded-r-[1px]" />
            <div className="absolute inset-0 right-[3px] w-[2px] bg-stone-200 rounded-r-[1px]" />
            <div className="absolute inset-0 right-[5px] w-[2px] bg-stone-300 rounded-r-[1px]" />
          </div>

          {/* Pages */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              className="absolute inset-0 ml-5 sm:ml-6 rounded-r-lg overflow-hidden cursor-pointer z-10"
              style={{
                transformOrigin: "left center",
                transformStyle: "preserve-3d",
              }}
              initial={{
                rotateY: currentPage === 0 ? 0 : 90,
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                rotateY: 0,
                opacity: 1,
                scale: 1,
              }}
              exit={{
                rotateY: -90,
                opacity: 0,
                scale: 0.98,
              }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
              onClick={() => currentPage === 0 && goToPage(1)}
            >
              {currentPage === 0 ? (
                <PassportCover passport={passport} />
              ) : currentPage === 1 ? (
                <InfoPage passport={passport} />
              ) : (
                <StampsPage
                  ratings={passport.ratings.slice(
                    (currentPage - 2) * 2,
                    (currentPage - 2) * 2 + 2
                  )}
                  pageNumber={currentPage}
                  hasAttestation={!!passport.attestationUID}
                />
              )}

              {/* Page edge highlight */}
              <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-white/40 via-white/20 to-white/40" />
            </motion.div>
          </AnimatePresence>

          {/* Dynamic page shadow during flip */}
          <div
            className="absolute inset-0 ml-5 sm:ml-6 pointer-events-none rounded-r-lg z-20"
            style={{
              background: "linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.06) 100%)",
            }}
          />
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-5">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0 || isFlipping}
          className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-stone-300 dark:hover:bg-stone-600 active:scale-95"
          aria-label="Previous page"
        >
          ‹
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              disabled={isFlipping}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentPage === i
                  ? "bg-amber-600 dark:bg-amber-500 w-6"
                  : "bg-stone-300 dark:bg-stone-600 w-2 hover:bg-stone-400 dark:hover:bg-stone-500"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages || isFlipping}
          className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-stone-300 dark:hover:bg-stone-600 active:scale-95"
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      {/* Instructions */}
      {currentPage === 0 && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs text-stone-500 dark:text-stone-400 mt-3"
        >
          Tap to open • Swipe to browse
        </motion.p>
      )}
    </div>
  );
}

// Premium Passport Cover
function PassportCover({ passport }: { passport: GigPassport }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Base gradient - deep navy blue like real passport */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Leather texture overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between p-5 sm:p-6">

        {/* Top Section - Country Header */}
        <div className="text-center space-y-1 pt-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            <span className="text-amber-400/80 text-xs">✦</span>
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          </div>
          <h1 className="text-sm sm:text-base font-serif tracking-[0.25em] text-amber-100/90 uppercase">
            Republic of India
          </h1>
          <p className="text-[10px] sm:text-xs text-amber-200/50 tracking-[0.15em] uppercase">
            भारत गणराज्य
          </p>
        </div>

        {/* Center - Emblem with holographic ring */}
        <div className="relative flex-1 flex items-center justify-center py-4">
          {/* Outer decorative ring */}
          <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-amber-500/20" />
          <div className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-amber-500/10" />

          {/* Animated holographic ring */}
          <motion.div
            className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, rgba(251,191,36,0.1), rgba(147,51,234,0.2), rgba(59,130,246,0.2), rgba(16,185,129,0.1), rgba(251,191,36,0.1))",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Main emblem circle */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 p-[2px] shadow-lg shadow-amber-900/50">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
              {/* Inner gold ring */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-amber-500/40 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl">🛂</span>
                  <p className="text-[8px] sm:text-[10px] text-amber-400/70 font-medium tracking-wider mt-1">
                    VERIFIED
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passport Title */}
        <div className="text-center space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-serif tracking-[0.2em] text-amber-100 uppercase font-medium">
              Gig Passport
            </h2>
            <p className="text-[10px] sm:text-xs text-amber-200/40 tracking-[0.1em]">
              पासपोर्ट
            </p>
          </div>

          {/* Name plate - embossed style */}
          <div className="relative mt-2">
            <div className="bg-gradient-to-b from-amber-900/30 to-amber-950/30 rounded px-4 py-2 border border-amber-700/20">
              <p className="text-sm sm:text-base font-medium text-amber-100 tracking-wide">
                {passport.name}
              </p>
              <p className="text-[10px] text-amber-300/50 mt-0.5">{passport.city}</p>
            </div>
          </div>

          {/* Chip */}
          <div className="flex justify-center pt-2">
            <div className="relative w-10 h-7 sm:w-12 sm:h-8 rounded-sm bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 shadow-md">
              <div className="absolute inset-[3px] rounded-[2px] bg-gradient-to-br from-amber-300 to-amber-400">
                {/* Chip circuit lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border border-amber-600/50 rounded-sm" />
                </div>
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-600/30" />
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-amber-600/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-amber-500/30 rounded-tl" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-amber-500/30 rounded-tr" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-amber-500/30 rounded-bl" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-amber-500/30 rounded-br" />

      {/* Side holographic strip */}
      <div className="absolute right-0 top-0 bottom-0 w-2 sm:w-3 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(251,191,36,0.3), rgba(147,51,234,0.3), rgba(59,130,246,0.3), rgba(251,191,36,0.3))",
          }}
          animate={{ y: ["-100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// Info Page with official document styling
function InfoPage({ passport }: { passport: GigPassport }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Security paper background */}
      <SecurityPaperBackground />

      <div className="relative z-10 p-4 sm:p-5 h-full flex flex-col">
        {/* Header with official styling */}
        <div className="text-center border-b-2 border-teal-700/30 pb-3 mb-4">
          <p className="text-[9px] sm:text-[10px] tracking-[0.2em] text-teal-700/60 uppercase">
            Personal Identification
          </p>
          <h2 className="text-sm sm:text-base font-serif text-teal-900 tracking-wide mt-1">
            Holder Information
          </h2>
        </div>

        {/* Machine Readable Zone style header */}
        <div className="bg-teal-900/5 border border-teal-700/20 rounded px-3 py-2 mb-4">
          <p className="font-mono text-[9px] sm:text-[10px] text-teal-700/70 tracking-wider">
            P&lt;IND{passport.name.toUpperCase().replace(/\s/g, "&lt;").slice(0, 20).padEnd(20, "&lt;")}
          </p>
        </div>

        {/* Info Grid */}
        <div className="flex-1 space-y-3">
          <InfoRow label="Surname / Nom" value={passport.name.split(" ").slice(-1)[0]} />
          <InfoRow label="Given Names / Prénoms" value={passport.name.split(" ").slice(0, -1).join(" ") || passport.name} />
          <InfoRow label="City / Ville" value={passport.city} />
          <InfoRow
            label="Wallet ID / Identifiant"
            value={`${passport.walletAddress.slice(0, 8)}...${passport.walletAddress.slice(-6)}`}
            mono
          />
          <InfoRow
            label="Date of Issue / Date d'émission"
            value={new Date(passport.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).toUpperCase()}
          />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <InfoBox label="Platforms" value={passport.ratings.length.toString()} />
            <InfoBox label="Total Trips" value={passport.totalDeliveries.toLocaleString("en-IN")} />
          </div>
          <InfoBox
            label="Overall Rating"
            value={passport.overallScore > 0 ? `★ ${passport.overallScore.toFixed(2)}` : "—"}
            highlight
          />
        </div>

        {/* Verification Stamp */}
        {passport.attestationUID && (
          <VerifiedStamp date={passport.createdAt} type="BASE" />
        )}

        {/* Page Number */}
        <div className="text-center pt-2 mt-auto">
          <span className="text-[9px] text-teal-600/60 font-mono">
            Page 1 / {Math.ceil(passport.ratings.length / 2) + 1}
          </span>
        </div>
      </div>
    </div>
  );
}

// Stamps Page
function StampsPage({
  ratings,
  pageNumber,
  hasAttestation,
}: {
  ratings: GigPassport["ratings"];
  pageNumber: number;
  hasAttestation: boolean;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <SecurityPaperBackground />

      <div className="relative z-10 p-4 sm:p-5 h-full flex flex-col">
        {/* Header */}
        <div className="text-center border-b border-teal-700/20 pb-2 mb-4">
          <p className="text-[9px] sm:text-[10px] tracking-[0.15em] text-teal-700/60 uppercase">
            Visa / Entry Stamps
          </p>
        </div>

        {/* Stamps Container */}
        <div className="flex-1 flex flex-col gap-4 py-2">
          {ratings.map((rating, index) => (
            <PlatformStamp
              key={rating.platformId}
              platformId={rating.platformId}
              rating={rating.rating}
              deliveries={rating.totalDeliveries}
              date={rating.joinedDate}
              verified={rating.verified || hasAttestation}
              index={index}
            />
          ))}

          {ratings.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-teal-600/50">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-teal-600/30 flex items-center justify-center mb-3">
                <span className="text-2xl opacity-50">📋</span>
              </div>
              <p className="text-xs">No stamps on this page</p>
            </div>
          )}

          {ratings.length === 1 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-600/20 flex items-center justify-center">
                <span className="text-[10px] text-teal-600/40 text-center px-2">
                  Space for next stamp
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Page Number */}
        <div className="text-center pt-2 mt-auto">
          <span className="text-[9px] text-teal-600/60 font-mono">
            Page {pageNumber}
          </span>
        </div>
      </div>
    </div>
  );
}

// Security Paper Background with guilloche pattern
function SecurityPaperBackground() {
  return (
    <div className="absolute inset-0">
      {/* Base paper color */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-teal-50" />

      {/* Wavy guilloche lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none">
        <defs>
          <pattern id="guilloche" x="0" y="0" width="80" height="16" patternUnits="userSpaceOnUse">
            <path
              d="M0 8 Q 20 0, 40 8 T 80 8"
              fill="none"
              stroke="#0d9488"
              strokeWidth="0.5"
            />
            <path
              d="M0 12 Q 20 4, 40 12 T 80 12"
              fill="none"
              stroke="#0d9488"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#guilloche)" />
      </svg>

      {/* Microprint border */}
      <div className="absolute inset-2 border border-teal-700/10 rounded">
        <div className="absolute inset-1 border border-teal-700/5 rounded" />
      </div>

      {/* Subtle watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <span className="text-8xl sm:text-9xl font-serif text-teal-900 rotate-[-15deg]">GIG</span>
      </div>

      {/* Corner rosettes */}
      <div className="absolute top-2 left-2 w-8 h-8 opacity-[0.06]">
        <svg viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="none" stroke="#0d9488" strokeWidth="0.5" />
          <circle cx="16" cy="16" r="10" fill="none" stroke="#0d9488" strokeWidth="0.5" />
          <circle cx="16" cy="16" r="6" fill="none" stroke="#0d9488" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute top-2 right-2 w-8 h-8 opacity-[0.06]">
        <svg viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="none" stroke="#0d9488" strokeWidth="0.5" />
          <circle cx="16" cy="16" r="10" fill="none" stroke="#0d9488" strokeWidth="0.5" />
          <circle cx="16" cy="16" r="6" fill="none" stroke="#0d9488" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}

// Info Row for official document style
function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[8px] sm:text-[9px] text-teal-600/70 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-xs sm:text-sm text-teal-900 font-medium ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </p>
    </div>
  );
}

// Info Box for statistics
function InfoBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded border px-3 py-2 ${
      highlight
        ? "bg-teal-50 border-teal-200"
        : "bg-white/50 border-teal-700/10"
    }`}>
      <p className="text-[8px] sm:text-[9px] text-teal-600/70 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-sm sm:text-base font-semibold ${highlight ? "text-teal-700" : "text-teal-900"}`}>
        {value}
      </p>
    </div>
  );
}
