import { publicSiteContent } from "@/lib/initiative-content";
import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/cms";

export const runtime = "nodejs";

export async function GET() {
  const content = publicSiteContent(await getSiteContent());
  return NextResponse.json({ content });
}
