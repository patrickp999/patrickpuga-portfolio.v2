import type { Config, Context } from "@netlify/edge-functions";

/**
 * Edge function: POST /api/like
 *
 * Accepts { "slug": "some-post-slug" } and upserts the like count
 * in the Supabase `post_likes` table using the service role key.
 *
 * Rate-limited to 1 like per IP per post per 24 hours using an
 * in-memory map (resets on cold start — good enough for abuse protection).
 */

// ── Rate-limit store (per-isolate) ──────────────────────────────
const RATE_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 hours
const rateLimitMap = new Map<string, number>(); // key → timestamp

function isRateLimited(ip: string, slug: string): boolean {
  const key = `${ip}::${slug}`;
  const last = rateLimitMap.get(key);
  const now = Date.now();

  if (last && now - last < RATE_LIMIT_MS) {
    return true;
  }

  rateLimitMap.set(key, now);
  return false;
}

// ── Helpers ─────────────────────────────────────────────────────
function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Handler ─────────────────────────────────────────────────────
export default async function handler(request: Request, context: Context): Promise<Response> {
  // Only accept POST
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // Parse body
  let slug: string;
  try {
    const body = await request.json();
    slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!slug) {
    return json({ error: "slug is required" }, 400);
  }

  // Rate-limit check
  const ip = context.ip || "unknown";
  if (isRateLimited(ip, slug)) {
    return json({ error: "Rate limited — try again later" }, 429);
  }

  // Env vars
  const supabaseUrl = Netlify.env.get("SUPABASE_URL");
  const serviceRoleKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Server misconfiguration" }, 500);
  }

  // Upsert via Supabase REST API (PostgREST)
  // Uses the Prefer header to get the updated row back and to upsert on conflict.
  // The RPC approach is cleaner for increment-on-conflict, so we use a two-step:
  // 1. Try to read the current count
  // 2. Upsert with the incremented value
  // Actually, PostgREST supports upsert with `on_conflict`, but not increment.
  // Safest approach: use a Supabase RPC or raw SQL via the REST API.
  // Since we can't guarantee an RPC exists, we'll do a read-then-upsert.

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  try {
    // Step 1: Read current count
    const readRes = await fetch(
      `${supabaseUrl}/rest/v1/post_likes?slug=eq.${encodeURIComponent(slug)}&select=like_count`,
      { headers },
    );

    if (!readRes.ok) {
      const errText = await readRes.text();
      console.error("Supabase read error:", errText);
      return json({ error: "Failed to read like count" }, 502);
    }

    const rows = await readRes.json();
    const currentCount: number = rows.length > 0 ? rows[0].like_count : 0;
    const newCount = currentCount + 1;

    // Step 2: Upsert with new count
    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/post_likes`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "return=representation,resolution=merge-duplicates",
      },
      body: JSON.stringify({ slug, like_count: newCount }),
    });

    if (!upsertRes.ok) {
      const errText = await upsertRes.text();
      console.error("Supabase upsert error:", errText);
      return json({ error: "Failed to update like count" }, 502);
    }

    const [updated] = await upsertRes.json();
    return json({ like_count: updated?.like_count ?? newCount });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}

export const config: Config = {
  path: "/api/like",
  method: "POST",
};
