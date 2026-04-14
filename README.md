# patrickpuga.com — Portfolio v2

Personal portfolio built with Gatsby and TypeScript, designed for both human visitors and AI crawlers — and instrumented to tell them apart. Contentful handles content management, Netlify handles deployment, and a self-hosted Umami instance on Railway tracks analytics without cookies, ads, or third-party data collection.

## Stack

| Layer | Tech |
|---|---|
| Framework | Gatsby 5 + TypeScript |
| Styling | Plain CSS (no utility framework) |
| CMS | Contentful |
| Hosting | Netlify |
| Analytics | Umami (self-hosted on Railway) |

## Features

- **Blog at `/blog`** — integrated directly on the same domain to consolidate domain authority rather than a separate subdomain
- **AI crawler tracking** — custom Umami events identify and segment LLM crawler traffic separately from human visitors
- **Cookie-free analytics** — Umami collects no personal data and requires no consent banner
- **Scroll-triggered animations** — Intersection Observer with `prefers-reduced-motion` support
- **Semantic HTML** — `<article>`, `<time>`, `<nav>`, `<address>`, and proper heading hierarchy for AI crawler legibility

## Local Development

```shell
# Install dependencies
npm install

# Start dev server
npm run develop
# → http://localhost:8000

# GraphQL explorer
# → http://localhost:8000/___graphql
```

## Environment Variables

Create a `.env.development` and `.env.production` file at the project root:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
```

Umami vars are set directly in the Netlify dashboard (not in `.env` files) — see the Analytics Setup section below.

## Analytics Setup (Umami on Railway)

Analytics run on a self-hosted [Umami](https://umami.is/) instance deployed to [Railway](https://railway.app/) on the free tier.

**Why self-hosted?**
- No data sharing with third parties
- Cookie-free by default — no consent banner needed
- Full control over what gets tracked

To deploy your own Umami instance on Railway, follow the [official Umami docs](https://umami.is/docs/running-on-railway).

### AI Crawler Tracking (`netlify/edge-functions/ai-analytics.ts`)

A Netlify edge function runs on every request (`path: "/*"`) and fires a custom Umami event when AI crawler traffic is detected. Static assets are skipped immediately via extension check to avoid unnecessary processing.

**Detection uses two signals, not one:**

| Signal | How |
|---|---|
| User-Agent match | Checked against a list of known LLM crawler UAs (`GPTBot`, `ClaudeBot`, `PerplexityBot`, etc.) |
| Missing `Accept-Language` | Most crawlers don't send this header; real browsers always do |

Either signal alone is enough to trigger tracking. Both signals firing together is recorded as `triggeredBy: "both"` in the event payload, which makes it easy to filter in Umami and assess detection confidence.

Each event includes:
- `bot` — the raw User-Agent string (or `"unknown"`)
- `matchedAs` — which crawler pattern matched
- `triggeredBy` — `"ua"`, `"accept-language"`, or `"both"`
- `url` — the pathname that was crawled

The function always returns `undefined` — it never modifies or blocks the response. Crawlers see exactly what human visitors see.

**Required environment variables (Netlify dashboard):**

```env
UMAMI_URL=https://your-umami-instance.railway.app
UMAMI_WEBSITE_ID=your_umami_website_id
```

## Content (Contentful)

Blog posts and experience entries are managed in Contentful and pulled at build time via `gatsby-source-contentful`. The blog lives at `/blog` with individual posts at `/blog/:slug`.

Relevant content types:
- `blogPost` — title, slug, publishDate, body (Rich Text), tags
- `experience` — company, role, dates, blurb, tech tags, logo

## Deployment

The site deploys automatically to Netlify on push to `main`. Build command: `gatsby build`. Publish directory: `public/`.

## Project Structure

```
src/
├── components/       # Shared UI components
├── pages/            # Gatsby pages (index, blog, 404)
├── templates/        # Blog post template
├── styles/           # Global CSS and variables
└── types/            # TypeScript type definitions
```

## Design Decisions

- **Single dark theme** — no light/dark toggle
- **Blog on same domain** — `/blog` rather than `blog.patrickpuga.com` to keep link equity consolidated
- **No edge-function content switching** — crawlers see exactly what humans see; no cloaking risk