import type { Config, Context } from "@netlify/edge-functions";
import { isStaticAsset, detectAICrawler } from "./lib/crawler-utils.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

export default async function handler(
  request: Request,
  _context: Context
): Promise<Response | undefined> {
  const { pathname } = new URL(request.url);

  // Early-exit: skip static assets
  if (isStaticAsset(pathname)) {
    return undefined;
  }

  // Dual-signal AI crawler detection
  const detection = detectAICrawler(
    request.headers.get("User-Agent"),
    request.headers.get("Accept-Language"),
  );

  if (!detection.isCrawler) {
    return undefined;
  }

  // Umami analytics — track AI crawler hit, then pass through
  const umamiUrl = Deno.env.get("UMAMI_URL");
  const umamiWebsiteId = Deno.env.get("UMAMI_WEBSITE_ID");
  if (umamiUrl && umamiWebsiteId) {
    try {
      await fetch(`${umamiUrl}/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          type: "event",
          payload: {
            website: umamiWebsiteId,
            hostname: "www.patrickpuga.com",
            url: pathname,
            title: "AI Crawler",
            name: "ai-crawler",
            language: "en-US",
            referrer: "",
            screen: "1920x1080",
            data: {
              bot: request.headers.get("User-Agent") ?? "unknown",
              triggeredBy: detection.triggeredBy,
            },
          },
        }),
      });
    } catch {
      // Silently ignore analytics failures
    }
  }

  // Always pass through — no content rewriting
  return undefined;
}

export const config: Config = { path: "/*" };
