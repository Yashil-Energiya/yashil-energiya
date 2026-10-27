import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import TextToSVG from "text-to-svg";
import { siteUrl } from "@/lib/seo";
import { SANITY_CDN_HOSTNAME } from "@/lib/sanity-image";
import { publicEnv } from "@/lib/public-env";

// cdn.sanity.io serves every Sanity project; only this project's images pass.
const sanityImagePathPrefix = `/images/${publicEnv.sanityProjectId}/${publicEnv.sanityDataset}/`;
const siteHostname = new URL(siteUrl).hostname;
const publicDirectory = path.join(process.cwd(), "public");
const notoSansBoldPath = path.join(
  publicDirectory,
  "fonts",
  "noto-sans-bold.ttf",
);
const textToSvg = TextToSVG.loadSync(notoSansBoldPath);

export const runtime = "nodejs";

async function readPublicFile(pathname: string) {
  const publicPath = path.join(publicDirectory, pathname);
  const normalizedPath = path.normalize(publicPath);

  if (!normalizedPath.startsWith(publicDirectory)) {
    throw new Error("Invalid public file path");
  }

  return readFile(normalizedPath);
}

function wrapText(text: string, maxLineLength: number, maxLines: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];

  for (const word of words) {
    const currentLine = lines[lines.length - 1];

    if (!currentLine) {
      lines.push(word);
      continue;
    }

    if (`${currentLine} ${word}`.length <= maxLineLength) {
      lines[lines.length - 1] = `${currentLine} ${word}`;
      continue;
    }

    if (lines.length === maxLines) {
      lines[lines.length - 1] = `${currentLine.replace(/\.+$/, "")}...`;
      break;
    }

    lines.push(word);
  }

  return lines.slice(0, maxLines);
}

function createTextPath({
  text,
  x,
  y,
  fontSize,
  anchor = "left top",
}: {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  anchor?: "left top" | "center middle";
}) {
  const d = textToSvg.getD(text, {
    x,
    y,
    fontSize,
    anchor,
  });

  return `<path d="${d}" fill="#ffffff"/>`;
}

function createOverlay(title: string, cta: string) {
  const titleLines = wrapText(title, 33, 3);
  const titlePaths = titleLines
    .map(
      (line, index) =>
        createTextPath({
          text: line,
          x: 74,
          y: 244 + index * 58,
          fontSize: 44,
        }),
    )
    .join("");
  const brandPath = createTextPath({
    text: "Yashil Energiya",
    x: 74,
    y: 108,
    fontSize: 26,
  });
  const ctaPath = createTextPath({
    text: cta,
    x: 163,
    y: 527,
    fontSize: 22,
    anchor: "center middle",
  });

  return Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#07150d" stop-opacity="0.82"/>
          <stop offset="0.58" stop-color="#07150d" stop-opacity="0.28"/>
          <stop offset="1" stop-color="#07150d" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#shade)"/>
      <rect x="74" y="74" width="78" height="6" rx="3" fill="#159447"/>
      ${brandPath}
      ${titlePaths}
      <rect x="74" y="500" width="178" height="54" rx="8" fill="#159447"/>
      ${ctaPath}
    </svg>
  `);
}

async function loadSourceImage(sourceUrl: URL) {
  if (sourceUrl.hostname === siteHostname) {
    return readPublicFile(sourceUrl.pathname);
  }

  const imageResponse = await fetch(sourceUrl, {
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!imageResponse.ok) {
    return null;
  }

  return Buffer.from(await imageResponse.arrayBuffer());
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("src");
  // Every distinct URL is rendered anew, so cap the text a caller can make us
  // draw. The site sends titles of at most 86 characters and short CTAs.
  const title = request.nextUrl.searchParams.get("title")?.slice(0, 120);
  const ctaParam = request.nextUrl.searchParams.get("cta");
  const cta = (ctaParam || "Read article").slice(0, 24);

  if (!source) {
    return new NextResponse("Missing image source", { status: 400 });
  }

  let sourceUrl: URL;

  try {
    sourceUrl = new URL(source);
  } catch {
    return new NextResponse("Invalid image source", { status: 400 });
  }

  if (
    sourceUrl.protocol !== "https:" ||
    (sourceUrl.hostname !== siteHostname &&
      !(
        sourceUrl.hostname === SANITY_CDN_HOSTNAME &&
        sourceUrl.pathname.startsWith(sanityImagePathPrefix)
      ))
  ) {
    return new NextResponse("Unsupported image source", { status: 400 });
  }

  const imageBuffer = await loadSourceImage(sourceUrl);
  if (!imageBuffer) {
    return new NextResponse("Image source unavailable", { status: 502 });
  }

  const image = sharp(imageBuffer)
    .resize(1200, 630, {
      fit: "cover",
      position: "center",
    });

  if (title) {
    image.composite([
      {
        input: createOverlay(title, cta),
        top: 0,
        left: 0,
      },
    ]);
  }

  const optimizedImage = await image
    .jpeg({
      quality: 78,
      mozjpeg: true,
    })
    .toBuffer();

  return new NextResponse(new Uint8Array(optimizedImage), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
