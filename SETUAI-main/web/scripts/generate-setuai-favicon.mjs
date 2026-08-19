import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const publicDirectory = resolve(scriptDirectory, "..", "public");

const colors = {
  aqua: [105, 211, 205, 255],
  coral: [239, 101, 76, 255],
  cream: [250, 248, 241, 255],
  deep: [16, 44, 52, 255],
  gold: [246, 207, 99, 255],
};

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const value of buffer) {
    crc ^= value;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));

  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng(width, height, pixels) {
  const scanlines = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const scanlineOffset = y * (width * 4 + 1);
    const pixelOffset = y * width * 4;
    scanlines[scanlineOffset] = 0;
    pixels.copy(scanlines, scanlineOffset + 1, pixelOffset, pixelOffset + width * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(scanlines, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function fillPolygon(pixels, width, points, color) {
  const minX = Math.max(0, Math.floor(Math.min(...points.map(([x]) => x))));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(...points.map(([x]) => x))));
  const minY = Math.max(0, Math.floor(Math.min(...points.map(([, y]) => y))));
  const maxY = Math.min(width - 1, Math.ceil(Math.max(...points.map(([, y]) => y))));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      let inside = false;

      for (let current = 0, previous = points.length - 1; current < points.length; previous = current++) {
        const [currentX, currentY] = points[current];
        const [previousX, previousY] = points[previous];
        const intersects =
          (currentY > y) !== (previousY > y) &&
          x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX;

        if (intersects) inside = !inside;
      }

      if (inside) {
        const index = (y * width + x) * 4;
        pixels[index] = color[0];
        pixels[index + 1] = color[1];
        pixels[index + 2] = color[2];
        pixels[index + 3] = color[3];
      }
    }
  }
}

function fillRect(pixels, width, x, y, rectWidth, rectHeight, color) {
  const startX = Math.max(0, Math.floor(x));
  const endX = Math.min(width, Math.ceil(x + rectWidth));
  const startY = Math.max(0, Math.floor(y));
  const endY = Math.min(width, Math.ceil(y + rectHeight));

  for (let row = startY; row < endY; row += 1) {
    for (let column = startX; column < endX; column += 1) {
      const index = (row * width + column) * 4;
      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
      pixels[index + 3] = color[3];
    }
  }
}

function scalePolygon(points, scale) {
  return points.map(([x, y]) => [Math.round(x * scale), Math.round(y * scale)]);
}

function createSetuAiMark(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const scale = size / 512;

  fillRect(pixels, size, 0, 0, size, size, colors.deep);

  // A stepped S doubles as a bridge: clear at favicon scale, with three signal accents.
  const bridgeMark = [
    [92, 84],
    [400, 84],
    [400, 152],
    [168, 152],
    [168, 222],
    [392, 222],
    [392, 428],
    [120, 428],
    [120, 360],
    [324, 360],
    [324, 290],
    [96, 290],
    [96, 84],
  ];

  fillPolygon(pixels, size, scalePolygon(bridgeMark, scale), colors.cream);
  fillRect(pixels, size, 332 * scale, 84 * scale, 68 * scale, 68 * scale, colors.gold);
  fillRect(pixels, size, 244 * scale, 222 * scale, 72 * scale, 68 * scale, colors.coral);
  fillRect(pixels, size, 120 * scale, 360 * scale, 72 * scale, 68 * scale, colors.aqua);

  return pixels;
}

function createIco(png) {
  const header = Buffer.alloc(6);
  const entry = Buffer.alloc(16);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  entry[0] = 0;
  entry[1] = 0;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, png]);
}

await mkdir(publicDirectory, { recursive: true });

const assets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
];

for (const [fileName, size] of assets) {
  const png = encodePng(size, size, createSetuAiMark(size));
  await writeFile(resolve(publicDirectory, fileName), png);
}

const faviconPng = encodePng(256, 256, createSetuAiMark(256));
await writeFile(resolve(publicDirectory, "favicon.ico"), createIco(faviconPng));

console.log("Generated SetuAI favicon assets in public/.");
