import type { Config, Context } from "@netlify/edge-functions";

declare const Deno: { env: { get(key: string): string | undefined } };

const STATIC_EXTENSIONS = [
  ".js",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".map",
  ".webp",
  ".avif",
  ".json",
  ".xml",
  ".webmanifest",
] as const;

const AI_CRAWLER_UAS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "Claude-Web",
  "ClaudeBot",
  "anthropic-ai",
  "Bytespider",
  "CCBot",
  "PerplexityBot",
  "Amazonbot",
  "FacebookBot",
  "Applebot-Extended",
  "cohere-ai",
  "DiffBot",
] as const;

export default async function handler(
  request: Request,
  _context: Context,
): Promise<Response | undefined> {
  try {
    const { pathname } = new URL(request.url);

    // Early-exit: skip static assets
    const lower = pathname.toLowerCase();
    if (STATIC_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      return undefined;
    }

    // Dual-signal AI crawler detection
    const ua = request.headers.get("User-Agent");
    const lang = request.headers.get("Accept-Language");
    const uaLower = ua?.toLowerCase() ?? "";
    const uaMatch = AI_CRAWLER_UAS.some((id) => uaLower.includes(id.toLowerCase()));
    const langAbsent = lang === null;

    // Single-signal: trigger if EITHER signal matches
    if (!uaMatch && !langAbsent) {
      return undefined;
    }

    const triggeredBy = uaMatch && langAbsent ? "both" : uaMatch ? "ua" : "accept-language";
    const matchedAs = AI_CRAWLER_UAS.find((id) => uaLower.includes(id.toLowerCase())) ?? "unknown";

    // Umami analytics — track AI crawler hit
    const umamiUrl = Deno.env.get("UMAMI_URL");
    const umamiWebsiteId = Deno.env.get("UMAMI_WEBSITE_ID");
    if (umamiUrl && umamiWebsiteId) {
      fetch(`${umamiUrl}/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
              bot: ua ?? "unknown",
              matchedAs,
              triggeredBy,
            },
          },
        }),
      }).catch(() => {});
    }
  } catch {
    // Never crash — always pass through
  }

  return undefined;
}

export const config: Config = { path: "/*" };
