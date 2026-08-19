import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { saveMediaUpload } from "@/lib/cms";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedTypes = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function filenameToAlt(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasValidSignature(bytes: Uint8Array, type: keyof typeof allowedTypes) {
  if (type === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }

  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === "image/gif") {
    return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38;
  }

  if (type === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return false;
}

export async function POST(request: Request) {
  const authError = await requireAdminApi(request, {
    allowedContentTypes: ["multipart/form-data"],
  });
  if (authError) return authError;

  const formData = await request.formData().catch(() => null);
  const image = formData?.get("image");

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  if (image.size <= 0 || image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
  }

  const type = image.type as keyof typeof allowedTypes;
  const extension = allowedTypes[type];

  if (!extension) {
    return NextResponse.json({ error: "Use a PNG, JPG, WebP, or GIF image" }, { status: 400 });
  }

  const bytes = new Uint8Array(await image.arrayBuffer());

  if (!hasValidSignature(bytes, type)) {
    return NextResponse.json({ error: "Uploaded file does not match its image type" }, { status: 400 });
  }

  const id = randomUUID();
  const src = `/api/media/${id}`;

  await saveMediaUpload({
    id,
    filename: `${filenameToAlt(image.name) || "image"}.${extension}`,
    contentType: type,
    size: image.size,
    alt: filenameToAlt(image.name),
    data: Buffer.from(bytes).toString("base64"),
  });

  return NextResponse.json({
    ok: true,
    src,
    alt: filenameToAlt(image.name),
    size: image.size,
    type,
  });
}
