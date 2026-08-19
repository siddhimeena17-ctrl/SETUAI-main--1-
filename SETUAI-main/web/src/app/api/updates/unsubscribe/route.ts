import { NextResponse } from "next/server";
import { unsubscribeSubscriber } from "@/lib/cms";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const subscriber = token ? await unsubscribeSubscriber(token) : null;
  const destination = new URL("/updates", request.url);
  destination.searchParams.set("subscription", subscriber ? "unsubscribed" : "invalid");
  return NextResponse.redirect(destination, { status: 303 });
}
