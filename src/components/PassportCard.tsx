"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GigPassport, PLATFORMS } from "@/types";

interface PassportCardProps {
  passport: GigPassport;
  compact?: boolean;
}

export function PassportCard({ passport, compact = false }: PassportCardProps) {
  const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 text-white overflow-hidden">
      {/* Header with gradient */}
      <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-blue-500">
            <AvatarFallback className="bg-blue-600 text-xl font-bold">
              {passport.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{passport.name}</h2>
            <p className="text-zinc-400 text-sm">{passport.city}</p>
            <p className="text-zinc-500 text-xs font-mono mt-1">
              {passport.walletAddress.slice(0, 6)}...
              {passport.walletAddress.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-400">
              {passport.overallScore.toFixed(1)}
            </div>
            <p className="text-xs text-zinc-400">Overall Score</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex justify-between bg-zinc-800/50 rounded-lg p-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">
              {passport.totalDeliveries.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-400">Total Trips</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {passport.ratings.length}
            </p>
            <p className="text-xs text-zinc-400">Platforms</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {passport.ratings.filter((r) => r.verified).length}
            </p>
            <p className="text-xs text-zinc-400">Verified</p>
          </div>
        </div>

        {/* Platform Ratings */}
        {!compact && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-400">
              Platform Ratings
            </h3>
            <div className="space-y-2">
              {passport.ratings.map((rating) => {
                const platform = getPlatform(rating.platformId);
                if (!platform) return null;
                return (
                  <div
                    key={rating.platformId}
                    className="flex items-center justify-between bg-zinc-800/30 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: platform.color }}
                      >
                        <Image
                          src={platform.logo}
                          alt={platform.name}
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            if (target.parentElement) {
                              target.parentElement.innerHTML = `<span class="text-sm">${platform.emoji}</span>`;
                            }
                          }}
                        />
                      </div>
                      <span className="font-medium">{platform.name}</span>
                      {rating.verified && (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/20 text-green-400 text-xs"
                        >
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-2">
                      {rating.proofScreenshot && (
                        <span title="Has screenshot proof" className="text-sm">
                          📸
                        </span>
                      )}
                      <div>
                        <span className="font-bold text-yellow-400">
                          ★ {rating.rating.toFixed(1)}
                        </span>
                        <p className="text-xs text-zinc-500">
                          {rating.totalDeliveries} trips
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
          <p className="text-xs text-zinc-500">
            Issued on Base • {new Date(passport.createdAt).toLocaleDateString()}
          </p>
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            GIG PASSPORT
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
