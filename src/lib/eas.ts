import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { GigPassport } from "@/types";

// EAS Contract Addresses on Base
export const EAS_CONFIG = {
  base: {
    easContract: "0x4200000000000000000000000000000000000021",
    schemaRegistry: "0x4200000000000000000000000000000000000020",
    // Pre-registered schema for Gig Passport
    // Schema: "string name, string city, uint8 platformCount, uint32 totalDeliveries, uint8 overallScore"
    // You'll need to register this schema first, or use an existing one
    schemaUID:
      "0x0000000000000000000000000000000000000000000000000000000000000000", // Replace after registering
  },
  baseSepolia: {
    easContract: "0x4200000000000000000000000000000000000021",
    schemaRegistry: "0x4200000000000000000000000000000000000020",
    schemaUID:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
  },
};

// Simple schema that doesn't require pre-registration for demo
// Using the "string data" schema which is commonly available
export const SIMPLE_SCHEMA_UID =
  "0x27d06e3659317e9a4f8154d1e849eb53d43d91fb4f219884d1684f86d797804a"; // Common "string data" schema on Base

export type AttestationResult = {
  success: boolean;
  uid?: string;
  error?: string;
  txHash?: string;
};

export async function createPassportAttestation(
  passport: GigPassport,
  signer: JsonRpcSigner
): Promise<AttestationResult> {
  try {
    const eas = new EAS(EAS_CONFIG.base.easContract);
    eas.connect(signer);

    // Encode passport data as JSON string for simple schema
    const passportData = JSON.stringify({
      name: passport.name,
      city: passport.city,
      platforms: passport.ratings.map((r) => ({
        platform: r.platformId,
        rating: r.rating,
        deliveries: r.totalDeliveries,
      })),
      overallScore: passport.overallScore,
      totalDeliveries: passport.totalDeliveries,
      timestamp: Date.now(),
    });

    // Use SchemaEncoder for the simple string schema
    const schemaEncoder = new SchemaEncoder("string data");
    const encodedData = schemaEncoder.encodeData([
      { name: "data", value: passportData, type: "string" },
    ]);

    const tx = await eas.attest({
      schema: SIMPLE_SCHEMA_UID,
      data: {
        recipient: passport.walletAddress,
        expirationTime: BigInt(0), // No expiration
        revocable: true,
        data: encodedData,
      },
    });

    const uid = await tx.wait();

    // Get transaction hash from the receipt
    const receipt = tx.receipt;
    const txHash = receipt?.hash || "";

    return {
      success: true,
      uid,
      txHash,
    };
  } catch (error) {
    console.error("Attestation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getEASSigner(): Promise<JsonRpcSigner | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    console.error("Failed to get signer:", error);
    return null;
  }
}

export function getAttestationUrl(uid: string): string {
  return `https://base.easscan.org/attestation/view/${uid}`;
}

export function getTransactionUrl(txHash: string): string {
  return `https://basescan.org/tx/${txHash}`;
}
