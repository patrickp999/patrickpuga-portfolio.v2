import type { Config, Context } from "@netlify/edge-functions";

declare const Deno: { env: { get(key: string): string | undefined } };

const STATIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map',
  '.webp', '.avif', '.json', '.xml', '.webmanifest',
] as const;

export function isStaticAsset(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return STATIC_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export type TriggerSignal = 'ua' | 'accept-language' | 'both';

export interface DetectionResult {
  isCrawler: boolean;
  triggeredBy: TriggerSignal | null;
}

const AI_CRAWLER_UAS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  'Google-Extended', 'Claude-Web', 'ClaudeBot',
  'anthropic-ai', 'Bytespider', 'CCBot',
  'PerplexityBot', 'Amazonbot', 'FacebookBot',
  'Applebot-Extended', 'cohere-ai', 'DiffBot',
] as const;

export function detectAICrawler(
  userAgent: string | null,
  acceptLanguage: string | null,
): DetectionResult {
  const uaLower = userAgent?.toLowerCase() ?? '';
  const uaMatch = AI_CRAWLER_UAS.some((id) => uaLower.includes(id.toLowerCase()));
  const langAbsent = acceptLanguage === null;

  if (uaMatch && langAbsent) {
    return { isCrawler: true, triggeredBy: 'both' };
  }
  if (uaMatch) {
    return { isCrawler: true, triggeredBy: 'ua' };
  }
  if (langAbsent) {
    return { isCrawler: true, triggeredBy: 'accept-language' };
  }
  return { isCrawler: false, triggeredBy: null };
}

export function mapPathToTextFile(pathname: string): string {
  const stripped = pathname.replace(/^\/+|\/+$/g, '');
  const segment = stripped === '' ? 'index' : stripped;
  return `/ai-content/${segment}.txt`;
}

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

  // Umami analytics — track AI crawler event before responding
  const umamiUrl = "https://umami-production-1099.up.railway.app";
  const umamiWebsiteId = "8881017b-fb72-41ad-ba87-7a7cbad7d93c";
  if (umamiUrl && umamiWebsiteId) {
    try {
      const umamiRes = await fetch(`${umamiUrl}/api/send`, {
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
      const umamiBody = await umamiRes.text();
      console.log("Umami response status:", umamiRes.status);
      console.log("Umami response body:", umamiBody);
    } catch (err) {
      console.error("Umami fetch error:", err);
    }
  }

  // Map request path to corresponding .txt file and fetch it
  const textFilePath = mapPathToTextFile(pathname);
  const textFileUrl = new URL(textFilePath, request.url);
  const textResponse = await fetch(textFileUrl);

  if (!textResponse.ok) {
    return undefined;
  }

  return new Response(textResponse.body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Served-For": "ai-crawler",
    },
  });
}

export const config: Config = { path: "/*" };
