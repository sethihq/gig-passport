import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Simple file-based storage for development
// In production, use a database or on-chain storage
const DATA_DIR = path.join(process.cwd(), ".data");
const getFilePath = (address: string) =>
  path.join(DATA_DIR, `${address.toLowerCase()}.json`);

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory exists
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    await ensureDataDir();

    const filePath = getFilePath(address);
    const data = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: "Passport not found" }, { status: 404 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    await ensureDataDir();

    const passport = await request.json();

    // Validate that the wallet address matches
    if (passport.walletAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ error: "Address mismatch" }, { status: 400 });
    }

    const filePath = getFilePath(address);
    await fs.writeFile(filePath, JSON.stringify(passport, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving passport:", error);
    return NextResponse.json(
      { error: "Failed to save passport" },
      { status: 500 }
    );
  }
}
