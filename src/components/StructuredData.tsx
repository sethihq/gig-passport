import { GigPassport } from "@/types";

interface WebAppStructuredDataProps {
  url?: string;
}

export function WebAppStructuredData({ url = "https://gigpassport.xyz" }: WebAppStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gig Passport",
    description: "Portable reputation for gig workers. Take your ratings anywhere.",
    url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Gig Passport",
    },
    potentialAction: {
      "@type": "ViewAction",
      target: url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface PassportStructuredDataProps {
  passport: GigPassport;
  url: string;
}

export function PassportStructuredData({ passport, url }: PassportStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: passport.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: passport.city,
      addressCountry: "IN",
    },
    identifier: {
      "@type": "PropertyValue",
      name: "Wallet Address",
      value: passport.walletAddress,
    },
    aggregateRating: passport.overallScore > 0 ? {
      "@type": "AggregateRating",
      ratingValue: passport.overallScore.toFixed(1),
      bestRating: "5",
      worstRating: "1",
      ratingCount: passport.ratings.length,
    } : undefined,
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
