import { NextResponse } from "next/server";
import { confirmSubscriber } from "@/lib/cms";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const subscriber = token ? await confirmSubscriber(token) : null;
  const destination = new URL("/updates", request.url);
  destination.searchParams.set("subscription", subscriber ? "confirmed" : "invalid");
  return NextResponse.redirect(destination, { status: 303 });
}
