"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { PLATFORMS } from "@/types";

interface PlatformStampProps {
  platformId: string;
  rating: number;
  deliveries: number;
  date: string;
  verified?: boolean;
  index?: number;
}

export function PlatformStamp({
  platformId,
  rating,
  deliveries,
  date,
  verified = false,
  index = 0,
}: PlatformStampProps) {
  const platform = PLATFORMS.find((p) => p.id === platformId);
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).toUpperCase();

  // Deterministic rotation for authentic stamp look
  const hash = platformId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rotation = ((hash + index * 17) % 10) - 5;
  const offsetX = ((hash + index * 7) % 20) - 10;

  if (!platform) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: rotation - 15 }}
      animate={{ scale: 1, opacity: 1, rotate: rotation }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.15,
      }}
      className="relative"
      style={{ marginLeft: `${offsetX}px` }}
    >
      {/* Authentic passport stamp design */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${platform.color}08 0%, ${platform.color}15 100%)`,
        }}
      >
        {/* Stamp content - horizontal card style */}
        <div className="relative flex items-center gap-3 p-3 sm:p-4">
          {/* Circular stamp with logo */}
          <div className="relative shrink-0">
            {/* Outer ring with dashed border */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
              style={{
                border: `2px solid ${platform.color}`,
                boxShadow: `inset 0 0 0 2px ${platform.color}20`,
              }}
            >
              {/* Inner content */}
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${platform.color}15` }}
              >
                <Image
                  src={platform.logo}
                  alt={platform.name}
                  width={28}
                  height={28}
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML = `<span class="text-lg sm:text-xl">${platform.emoji}</span>`;
                  }}
                />
              </div>
            </div>

            {/* Verified checkmark */}
            {verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="flex-1 min-w-0">
            {/* Platform name */}
            <h3
              className="font-semibold text-sm sm:text-base truncate"
              style={{ color: platform.color }}
            >
              {platform.name}
            </h3>

            {/* Rating and deliveries */}
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs sm:text-sm font-bold"
                style={{ color: platform.color }}
              >
                ★ {rating.toFixed(1)}
              </span>
              <span className="text-teal-400 text-xs">•</span>
              <span className="text-xs text-teal-700">
                {deliveries.toLocaleString("en-IN")} trips
              </span>
            </div>

            {/* Date */}
            <p className="text-[10px] sm:text-xs text-teal-600/60 mt-1 font-mono tracking-wider">
              Since {formattedDate}
            </p>
          </div>

          {/* Right side - circular date stamp */}
          <div
            className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex flex-col items-center justify-center"
            style={{
              borderColor: `${platform.color}40`,
              borderStyle: "dashed",
            }}
          >
            <span
              className="text-[10px] sm:text-xs font-bold"
              style={{ color: platform.color }}
            >
              {rating.toFixed(1)}
            </span>
            <span className="text-[8px] text-teal-600/50 uppercase">Rating</span>
          </div>
        </div>

        {/* Ink texture overlay for authenticity */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Bottom border accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${platform.color}30, transparent)`,
          }}
        />
      </div>
    </motion.div>
  );
}

// Circular verified stamp for attestation
export function VerifiedStamp({ date, type }: { date: string; type: string }) {
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <motion.div
      initial={{ scale: 0, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: -8, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
      className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24">
        {/* SVG stamp design */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Outer dashed ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="#0d9488"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />
          {/* Middle solid ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#0d9488"
            strokeWidth="2"
            opacity="0.8"
          />
          {/* Inner ring */}
          <circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke="#0d9488"
            strokeWidth="1"
            opacity="0.4"
          />
          {/* Curved text path */}
          <defs>
            <path
              id="topArc"
              d="M 15 50 A 35 35 0 0 1 85 50"
              fill="none"
            />
            <path
              id="bottomArc"
              d="M 85 50 A 35 35 0 0 1 15 50"
              fill="none"
            />
          </defs>
          <text className="text-[7px] uppercase tracking-wider" fill="#0d9488" opacity="0.8">
            <textPath href="#topArc" startOffset="50%" textAnchor="middle">
              On-Chain Verified
            </textPath>
          </text>
          <text className="text-[7px] uppercase tracking-wider" fill="#0d9488" opacity="0.8">
            <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
              {formattedDate} • {type}
            </textPath>
          </text>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-teal-600 text-lg sm:text-xl">✓</span>
          <span className="text-[8px] sm:text-[10px] font-bold text-teal-700 tracking-wider">
            SEALED
          </span>
        </div>

        {/* Ink bleed effect */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </motion.div>
  );
}

// Circular entry stamp variant for special occasions
export function EntryStamp({
  text,
  date,
  color = "#0d9488",
}: {
  text: string;
  date: string;
  color?: string;
}) {
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).toUpperCase();

  return (
    <motion.div
      initial={{ scale: 0, rotate: 15, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
      className="relative"
    >
      <div
        className="w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center"
        style={{ borderColor: color }}
      >
        <span className="text-xs font-bold" style={{ color }}>
          {text}
        </span>
        <span className="text-[8px]" style={{ color: `${color}80` }}>
          {formattedDate}
        </span>
      </div>
    </motion.div>
  );
}
