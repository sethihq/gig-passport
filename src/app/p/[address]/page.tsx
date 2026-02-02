import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PassportCard } from "@/components/PassportCard";
import { GigPassport } from "@/types";
import Link from "next/link";

interface Props {
  params: Promise<{ address: string }>;
}

async function getPassport(address: string): Promise<GigPassport | null> {
  try {
    // In development, read from file system
    // In production, this would be from database or blockchain
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      ".data",
      `${address.toLowerCase()}.json`
    );
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const passport = await getPassport(address);

  if (!passport) {
    return {
      title: "Passport Not Found | Gig Passport",
    };
  }

  return {
    title: `${passport.name}'s Gig Passport`,
    description: `${passport.name} from ${passport.city} • ${passport.overallScore.toFixed(1)} rating • ${passport.totalDeliveries.toLocaleString()} total deliveries across ${passport.ratings.length} platforms`,
    openGraph: {
      title: `${passport.name}'s Gig Passport`,
      description: `Verified gig worker with ${passport.overallScore.toFixed(1)} rating`,
    },
  };
}

export default async function PublicPassportPage({ params }: Props) {
  const { address } = await params;
  const passport = await getPassport(address);

  if (!passport) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-2xl">🛂</span>
            <span className="font-bold text-xl">Gig Passport</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Create Your Own →
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Verified Badge */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              On-Chain Verified Identity
            </span>
          </div>

          {/* Passport Card */}
          <PassportCard passport={passport} />

          {/* Verification Info */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-zinc-300">Verification Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Wallet Address</p>
                <p className="font-mono text-zinc-300 truncate">
                  {passport.walletAddress}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Created On</p>
                <p className="text-zinc-300">
                  {new Date(passport.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Network</p>
                <p className="text-zinc-300">Base</p>
              </div>
              <div>
                <p className="text-zinc-500">Verified Platforms</p>
                <p className="text-zinc-300">
                  {passport.ratings.filter((r) => r.verified).length} /{" "}
                  {passport.ratings.length}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 pt-4">
            <p className="text-zinc-400 text-sm">
              Want to verify your own gig reputation?
            </p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-all"
            >
              Create Your Gig Passport
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-zinc-500 text-sm">
          <p>Built on Base • Free Forever • Open Source</p>
        </div>
      </footer>
    </div>
  );
}
