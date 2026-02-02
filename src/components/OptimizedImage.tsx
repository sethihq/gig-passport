"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  fallback?: React.ReactNode;
  blurColor?: string;
}

// Simple blur data URL generator
function generateBlurDataURL(color: string = "#1a1a1a"): string {
  // Convert hex to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Create a tiny SVG with the color
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="rgb(${r},${g},${b})" width="1" height="1"/></svg>`;
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

export function OptimizedImage({
  fallback,
  blurColor = "#1a1a1a",
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={cn(
        className,
        "transition-opacity duration-300",
        isLoading ? "opacity-0" : "opacity-100"
      )}
      placeholder="blur"
      blurDataURL={generateBlurDataURL(blurColor)}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
      }}
    />
  );
}

// Platform logo component with optimized loading
interface PlatformLogoProps {
  src: string;
  name: string;
  emoji: string;
  color: string;
  size?: number;
  className?: string;
}

export function PlatformLogo({
  src,
  name,
  emoji,
  color,
  size = 24,
  className,
}: PlatformLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span
        className={cn("flex items-center justify-center", className)}
        style={{ fontSize: size * 0.7 }}
      >
        {emoji}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={cn("object-contain", className)}
      onError={() => setHasError(true)}
    />
  );
}
