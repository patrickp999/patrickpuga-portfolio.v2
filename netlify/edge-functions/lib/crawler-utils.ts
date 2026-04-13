const STATIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map',
  '.webp', '.avif', '.json', '.xml', '.webmanifest',
] as const;

export function isStaticAsset(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return STATIC_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export type TriggerSignal = 'both';

export interface DetectionResult {
  isCrawler: boolean;
  triggeredBy: TriggerSignal | null;
}

export const AI_CRAWLER_UAS = [
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

  // Conservative: require BOTH signals to match
  if (uaMatch && langAbsent) {
    return { isCrawler: true, triggeredBy: 'both' };
  }
  return { isCrawler: false, triggeredBy: null };
}

export function mapPathToTextFile(pathname: string): string {
  const stripped = pathname.replace(/^\/+|\/+$/g, '');
  const segment = stripped === '' ? 'index' : stripped;
  return `/ai-content/${segment}.txt`;
}
