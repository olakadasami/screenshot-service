import { browserPool } from "@/lib/browserPool";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { url, width, height, deviceScaleFactor } = await request.json();
  const page = await browserPool.requirePage();

  let image: Uint8Array<ArrayBufferLike>;
  try {
    await page.setViewport({ width, height, deviceScaleFactor });
    await page.goto(url, {
      waitUntil: "networkidle0",
    });
    image = await page.screenshot({
      type: "png",
      fullPage: false,
      encoding: "binary",
    });
  } finally {
    await browserPool.releasePage(page);
  }

  return new NextResponse(image, {
    headers: {
      "Content-Type": "image/png",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
