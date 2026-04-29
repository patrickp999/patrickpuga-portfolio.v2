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

  // Increment via Supabase REST API (PostgREST)
  // Read current count, then INSERT (new row) or PATCH (existing row).

  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  try {
    // Step 1: Read current row
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
    let writeRes: globalThis.Response;

    if (rows.length === 0) {
      // Step 2a: Row doesn't exist — INSERT
      writeRes = await fetch(`${supabaseUrl}/rest/v1/post_likes`, {
        method: "POST",
        headers,
        body: JSON.stringify({ slug, like_count: 1 }),
      });
    } else {
      // Step 2b: Row exists — PATCH to increment
      const newCount = rows[0].like_count + 1;
      writeRes = await fetch(
        `${supabaseUrl}/rest/v1/post_likes?slug=eq.${encodeURIComponent(slug)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ like_count: newCount }),
        },
      );
    }

    if (!writeRes.ok) {
      const errText = await writeRes.text();
      console.error("Supabase write error:", errText);
      return json({ error: "Failed to update like count" }, 502);
    }

    const [updated] = await writeRes.json();
    return json({ like_count: updated?.like_count ?? 1 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}

export const config: Config = {
  path: "/api/like",
  method: "POST",
};
