import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_DIGITS = 6;
const TOTP_STEP_SECONDS = 30;

export function generateTotpSecret() {
  return base32Encode(randomBytes(20));
}

export function formatTotpSecret(secret: string) {
  return secret.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

export function createOtpAuthUri({
  issuer,
  account,
  secret,
}: {
  issuer: string;
  account: string;
  secret: string;
}) {
  const label = `${issuer}:${account}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

export function verifyTotpCode(secret: string, code: string) {
  const normalized = code.replace(/\D/g, "");
  if (normalized.length !== TOTP_DIGITS) return false;

  const currentStep = Math.floor(Date.now() / 1000 / TOTP_STEP_SECONDS);
  return [-1, 0, 1].some((offset) => safeCodeEqual(normalized, generateTotpCode(secret, currentStep + offset)));
}

function safeCodeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

function generateTotpCode(secret: string, counter: number) {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  let value = counter;

  for (let index = 7; index >= 0; index -= 1) {
    buffer[index] = value & 0xff;
    value = Math.floor(value / 256);
  }

  const digest = createHmac("sha1", key).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

function base32Encode(buffer: Buffer) {
  let bits = "";
  let output = "";

  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, "0");
    output += BASE32_ALPHABET[parseInt(chunk, 2)];
  }

  return output;
}

function base32Decode(secret: string) {
  const clean = secret.toUpperCase().replace(/=|\s/g, "");
  let bits = "";

  for (const character of clean) {
    const value = BASE32_ALPHABET.indexOf(character);
    if (value === -1) throw new Error("Invalid TOTP secret.");
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(parseInt(bits.slice(index, index + 8), 2));
  }

  return Buffer.from(bytes);
}
