import { NextResponse } from "next/server";
import { getMediaUpload } from "@/lib/cms";

type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const media = await getMediaUpload(id);

  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  return new NextResponse(Buffer.from(media.data, "base64"), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${media.filename.replace(/"/g, "")}"`,
      "Content-Length": String(media.size),
      "Content-Type": media.contentType,
    },
  });
}
