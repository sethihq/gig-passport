export type Platform = {
  id: string;
  name: string;
  logo: string; // URL to logo image
  emoji: string; // Fallback emoji
  color: string;
  secondaryColor?: string;
};

export type PlatformRating = {
  platformId: string;
  rating: number;
  totalDeliveries: number;
  joinedDate: string;
  verified: boolean;
  proofUrl?: string;
  proofScreenshot?: string; // Base64 encoded screenshot for MVP
};

export type GigPassport = {
  walletAddress: string;
  name: string;
  city: string;
  ratings: PlatformRating[];
  overallScore: number;
  totalDeliveries: number;
  createdAt: string;
  attestationUID?: string;
  attestationTxHash?: string;
};

// Using Google Favicon API for reliable logo access
export const PLATFORMS: Platform[] = [
  {
    id: "zomato",
    name: "Zomato",
    logo: "https://www.google.com/s2/favicons?domain=zomato.com&sz=128",
    emoji: "🍕",
    color: "#E23744",
    secondaryColor: "#C62B38",
  },
  {
    id: "swiggy",
    name: "Swiggy",
    logo: "https://www.google.com/s2/favicons?domain=swiggy.com&sz=128",
    emoji: "🍔",
    color: "#FC8019",
    secondaryColor: "#E06F10",
  },
  {
    id: "uber",
    name: "Uber",
    logo: "https://www.google.com/s2/favicons?domain=uber.com&sz=128",
    emoji: "🚗",
    color: "#000000",
    secondaryColor: "#1A1A1A",
  },
  {
    id: "ola",
    name: "Ola",
    logo: "https://www.google.com/s2/favicons?domain=olacabs.com&sz=128",
    emoji: "🛺",
    color: "#1C8C3C",
    secondaryColor: "#147030",
  },
  {
    id: "rapido",
    name: "Rapido",
    logo: "https://www.google.com/s2/favicons?domain=rapido.bike&sz=128",
    emoji: "🏍️",
    color: "#FFCC00",
    secondaryColor: "#E6B800",
  },
  {
    id: "dunzo",
    name: "Dunzo",
    logo: "https://www.google.com/s2/favicons?domain=dunzo.com&sz=128",
    emoji: "📦",
    color: "#00D09C",
    secondaryColor: "#00B386",
  },
  {
    id: "zepto",
    name: "Zepto",
    logo: "https://www.google.com/s2/favicons?domain=zeptonow.com&sz=128",
    emoji: "⚡",
    color: "#8B5CF6",
    secondaryColor: "#7C3AED",
  },
  {
    id: "blinkit",
    name: "Blinkit",
    logo: "https://www.google.com/s2/favicons?domain=blinkit.com&sz=128",
    emoji: "🛒",
    color: "#F8CB46",
    secondaryColor: "#E6B830",
  },
  {
    id: "porter",
    name: "Porter",
    logo: "https://www.google.com/s2/favicons?domain=porter.in&sz=128",
    emoji: "🚚",
    color: "#2563EB",
    secondaryColor: "#1D4ED8",
  },
  {
    id: "urbancompany",
    name: "Urban Company",
    logo: "https://www.google.com/s2/favicons?domain=urbancompany.com&sz=128",
    emoji: "🔧",
    color: "#6366F1",
    secondaryColor: "#4F46E5",
  },
];
