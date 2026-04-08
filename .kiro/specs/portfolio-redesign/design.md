# Design Document: Portfolio Redesign

## Overview

This design covers an evolutionary refactor of the existing Gatsby 5 + TypeScript portfolio site. The redesign introduces a single dark theme, merges the Hero and About sections, replaces the tab-based work history with cards, adds a Projects section, introduces a Contentful-powered blog, redesigns the footer, updates navigation, and adds scroll-triggered fade-in animations via a custom `useFadeIn` hook.

The approach is incremental — existing files are modified in place where possible, new files are added for blog functionality, and no new npm dependencies are introduced (the `@contentful/rich-text-react-renderer` already in use handles blog rich text). `react-transition-group` remains for the Nav entrance animation but is replaced by `useFadeIn` + CSS for scroll-triggered section animations.

## Architecture

### Current Architecture

```
src/
├── components/       # Hero, About, WorkHistory, Contact, Nav, Menu, Layout, SocialLinks, seo
├── pages/            # index.tsx, 404.tsx
├── styles/
│   ├── theme.css     # Light/dark theme with prefers-color-scheme
│   ├── global.css    # Base styles, utility classes
│   └── components/   # Per-component CSS files
└── utils/            # constants.ts, useScrollDirection.ts
```

### Target Architecture

```
src/
├── components/           # Portfolio components (modified)
│   ├── Hero.tsx          # Merged hero + about (avatar, bio, tags)
│   ├── Experience.tsx    # Card-based, replaces WorkHistory.tsx
│   ├── ExperienceCard.tsx
│   ├── Projects.tsx      # New section
│   ├── ProjectCard.tsx   # New card component
│   ├── Contact.tsx       # Unchanged
│   ├── Footer.tsx        # New: email, location, resume link
│   ├── Nav.tsx           # Updated links, no Resume button
│   ├── Menu.tsx          # Updated links, no Resume link
│   ├── Layout.tsx        # Uses new Footer
│   ├── SocialLinks.tsx   # Unchanged
│   ├── seo.tsx           # Unchanged
│   └── index.ts          # Updated exports
├── blog/                 # Blog-specific components (NEW)
│   ├── BlogCard.tsx
│   ├── BlogPost.tsx      # Template for individual posts
│   └── index.ts
├── pages/
│   ├── index.tsx         # Updated section order, no About
│   ├── blog.tsx          # Blog index page (NEW)
│   └── 404.tsx
├── styles/
│   ├── theme.css         # Single dark theme
│   ├── global.css        # Updated utility classes (fade-in)
│   ├── components/
│   │   ├── hero.css      # Rewritten for merged layout
│   │   ├── experience.css # New card-based styles
│   │   ├── projects.css  # New two-column grid
│   │   ├── footer.css    # New footer styles
│   │   ├── nav.css       # Minor updates
│   │   ├── menu.css      # Minor updates
│   │   ├── contact.css   # Simplified
│   │   └── layout.css    # Minor updates
│   └── blog/             # Blog-specific CSS (NEW)
│       ├── blog-index.css
│       └── blog-post.css
├── templates/            # Gatsby page templates (NEW)
│   └── blog-post.tsx     # Used by gatsby-node.ts
└── utils/
    ├── constants.ts      # Updated nav links, removed resume
    ├── useScrollDirection.ts  # Unchanged
    └── useFadeIn.ts      # New Intersection Observer hook
```

### Data Flow

```mermaid
graph TD
    A[Contentful CMS] -->|gatsby-source-contentful| B[Gatsby GraphQL Layer]
    B -->|Hero query| C[Hero.tsx - name, subtitle, bio, avatar, tags]
    B -->|Job query| D[Experience.tsx - job cards]
    B -->|BlogPost query| E[Blog Index / Blog Post pages]
    F[gatsby-node.ts] -->|createPages| G[/blog/slug pages]
    H[useFadeIn hook] -->|IntersectionObserver| I[Experience cards, Project cards, section headings]
    J[theme.css] -->|CSS custom properties| K[All components]
```

## Components and Interfaces

### Theme System (`theme.css`)

Remove all light theme variables, `prefers-color-scheme` media query, and `data-theme` overrides. Define a single `:root` block:

```css
:root {
  --bg: #0F172A;
  --surface: #1E293B;
  --text: #E2E8F0;
  --muted: #64748B;
  --border: #334155;
  --accent: #0EA5E9;
  --accent-hover: #38BDF8;
  --surface-light: #F8FAFC;
  --tag-bg: #E0F2FE;
  --tag-text: #0369A1;
  --radius: 12px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 6px 24px rgba(0, 0, 0, 0.4);
}
```

The `--primary` and `--primary-700` references throughout existing CSS will be replaced with `--accent` and `--accent-hover`. The `--hero-name` variable is removed (name uses `--text`).

**IMPORTANT — Global CSS variable replacement:** All files under `src/styles/` must be searched for `--primary` and `--primary-700` references and updated to `--accent` and `--accent-hover` respectively. This includes `global.css`, `nav.css`, `menu.css`, `contact.css`, `layout.css`, and any other file referencing the old variables. A full grep across `src/styles/` must be performed before considering the theme step complete.

### Nav Component (`Nav.tsx`)

**Changes:**
- Update `DEFAULT_LINKS` in `constants.ts` to: Experience (`#experience`), Projects (`#projects`), Blog (`/blog`), Contact (`#contact`)
- Remove `RESUME_HREF` export and all resume-related code
- Blog link uses Gatsby `<Link to="/blog">` instead of anchor scroll
- Remove the resume `<a>` from the nav item list
- `navItemCount` no longer adds +1 for resume

**Interface (unchanged shape, different data):**
```typescript
// constants.ts
export const DEFAULT_LINKS = [
  { url: "#experience", name: "Experience" },
  { url: "#projects", name: "Projects" },
  { url: "/blog", name: "Blog" },
  { url: "#contact", name: "Contact" },
] as const;
```

### Menu Component (`Menu.tsx`)

**Changes:**
- Remove `resumeHref` prop entirely
- Remove the resume `<a>` element from the drawer
- Links array now drives all items (Blog link uses Gatsby `<Link>`)

```typescript
type Props = {
  open: boolean;
  onClose: () => void;
  links: ReadonlyArray<{ readonly url: string; readonly name: string }>;
};
```

### Hero Component (`Hero.tsx`) — Merged Hero + About

**Changes:**
- Accepts avatar image data, bio text, and tags array in addition to name/subtitle
- Renders: avatar (GatsbyImage), name, tagline, bio paragraph, tech tag pills
- Uses a load-triggered fade-in (existing `react-transition-group` approach or simple CSS animation on mount) — NOT scroll-triggered
- Removes the mobile social links from hero (social links stay in Contact/Footer)
- The `HeroContent` type expands:

```typescript
export type HeroContent = {
  name: string;
  subtitle: string;  // "Software engineer, AI explorer."
  bio: string;       // 3-4 sentence bio
  tags: string[];    // ["React", "TypeScript", ...]
  avatar?: IGatsbyImageData | null;
};
```

**IMPORTANT — Bio is Contentful rich text:** The `description.raw` field from the About content type is a Contentful rich text JSON string, not a plain string. It must be parsed with `JSON.parse()` and rendered via `documentToReactComponents` from `@contentful/rich-text-react-renderer` — the same pattern used in the existing `About.tsx`. Do NOT pass it directly into a `<p>` tag.

**Layout:** Centered column with avatar on top (or left on desktop), name + tagline, bio (rendered as rich text), then tag pills below.

### Experience Component (`Experience.tsx`) — Replaces WorkHistory

**Changes:**
- Replaces tab-based layout with a vertical stack of `ExperienceCard` components
- Section id changes from `work-history` to `experience`
- Heading text: "Experience"
- Each card gets a stagger delay via `useFadeIn`

```typescript
type ExperienceProps = {
  data?: ContentfulJobNode[] | null;
};
```

### ExperienceCard Component (`ExperienceCard.tsx`) — New

```typescript
type ExperienceCardProps = {
  company: string;
  title: string;
  dateRange: string;
  description: Document | null;  // Contentful rich text
  companyUrl?: string | null;
  index: number;  // for stagger delay
};
```

Renders: company initials circle (first letters of company name, styled `--accent` border), job title, date range, rich text description, and tech tags (if available from Contentful).

### Projects Component (`Projects.tsx`) — New

```typescript
type ProjectData = {
  name: string;
  description: string;
  tags: string[];
  githubUrl: string;
  gradient: string;  // CSS gradient for thumbnail
};

type ProjectsProps = {
  projects: ProjectData[];
};
```

Two-column CSS grid on desktop (>640px), single column on mobile. Section heading "Projects" with the heading-with-rule style.

### ProjectCard Component (`ProjectCard.tsx`) — New

```typescript
type ProjectCardProps = ProjectData & {
  index: number;  // for stagger delay
};
```

Renders: gradient thumbnail div, project name, description, tech tag pills, GitHub icon link.

### Footer Component (`Footer.tsx`) — New

Replaces the inline `<footer>` in Layout.tsx.

```typescript
const Footer: React.FC = () => (
  <footer className="footer">
    <span>[email]</span>
    <span>Denver, CO</span>
    <a href="/Patrick_Puga_Resume.pdf" download>Download resume ↓</a>
  </footer>
);
```

### Layout Component (`Layout.tsx`)

**Changes:**
- Import and render `<Footer />` instead of inline `<footer>` with copyright
- No other structural changes

### useFadeIn Hook (`src/utils/useFadeIn.ts`) — New

```typescript
function useFadeIn(options?: { delay?: number; threshold?: number }): React.RefObject<HTMLElement>;
```

**Behavior:**
1. Creates a `ref` and an `IntersectionObserver`
2. When the element enters the viewport (default threshold 0.15), adds a `.visible` CSS class
3. Unobserves the element immediately (one-shot)
4. If `delay` is provided, sets `--delay` CSS custom property on the element
5. If `prefers-reduced-motion: reduce` is active, skips observer setup and immediately adds `.visible`
6. Cleans up observer on unmount

**CSS classes (in `global.css`):**

```css
.fade-in {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 450ms ease var(--delay, 0ms),
              transform 450ms ease var(--delay, 0ms);
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .fade-in {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

### Blog Components

#### BlogCard (`src/blog/BlogCard.tsx`)

```typescript
type BlogCardProps = {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
};
```

Renders a card linking to `/blog/{slug}` with title, formatted date, and excerpt.

#### Blog Index Page (`src/pages/blog.tsx`)

- Queries `allContentfulBlogPost(sort: { date: DESC })`
- Renders a list of `BlogCard` components wrapped in `Layout`
- Uses `useFadeIn` for card animations

#### Blog Post Template (`src/templates/blog-post.tsx`)

- Receives `pageContext.slug` from `gatsby-node.ts`
- Queries single `contentfulBlogPost(slug: { eq: $slug })`
- Renders title, date, and rich text body via `documentToReactComponents`
- If body is null/empty, renders "This post has no content yet."
- Wrapped in `Layout`

#### gatsby-node.ts (New file)

```typescript
import type { GatsbyNode } from "gatsby";
import path from "path";

export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql<{
    allContentfulBlogPost: { nodes: Array<{ slug: string }> };
  }>(`
    query BlogPages {
      allContentfulBlogPost { nodes { slug } }
    }
  `);

  result.data?.allContentfulBlogPost.nodes.forEach((node) => {
    createPage({
      path: `/blog/${node.slug}`,
      component: path.resolve("src/templates/blog-post.tsx"),
      context: { slug: node.slug },
    });
  });
};
```

### Contentful Blog Post Content Type

The `BlogPost` content type must be created in Contentful with these fields:

| Field   | Type       | Required | Notes                        |
|---------|------------|----------|------------------------------|
| title   | Short text | Yes      | Display name of the post     |
| slug    | Short text | Yes      | URL-safe identifier, unique  |
| date    | Date       | Yes      | Publication date             |
| body    | Rich text  | No       | Full post content            |
| excerpt | Short text | No       | Summary for index cards      |

No changes to `gatsby-config.ts` are needed — `gatsby-source-contentful` already pulls all content types from the configured space.

## Data Models

### Existing Contentful Types (unchanged)

**Hero** — `contentfulHero`: `greeting`, `name`, `subtitle`, `blurb`

**About** — `contentfulAbout`: `title`, `skills`, `avatar` (asset), `description` (rich text)
- The avatar and skills fields from the About content type will now be consumed by the Hero component instead of About
- The About content type remains in Contentful — do NOT delete it. Only the `About.tsx` component is removed from the codebase

**Job** — `contentfulJob`: `date`, `order`, `company`, `dateRange`, `title`, `location`, `url` (rich text containing link), `description` (rich text)

### New Contentful Type

**BlogPost** — `contentfulBlogPost`: `title`, `slug`, `date`, `body` (rich text), `excerpt`

### Projects Data

**Projects** — Before implementation, check whether a `Project` content type already exists in the Contentful space by introspecting the GraphQL layer (e.g., query for `allContentfulProject`). If a Project content type exists, source project data from Contentful like all other content. If it does not exist, flag it and confirm with the user before defaulting to a hardcoded array. The preference is to add a Project content type in Contentful to keep all content CMS-managed.

**Fallback (only if no Contentful Project type exists and user confirms):** Use a static placeholder array in `Projects.tsx`:

```typescript
const PROJECTS: ProjectData[] = [
  {
    name: "AI Project Name",
    description: "Short description of the AI project.",
    tags: ["Python", "LLM", "AWS"],
    githubUrl: "https://github.com/patrickp999/project-1",
    gradient: "linear-gradient(135deg, #0F172A, #1E293B)",
  },
  {
    name: "Dev Tool Name",
    description: "Short description of the dev tool.",
    tags: ["TypeScript", "Node.js", "CLI"],
    githubUrl: "https://github.com/patrickp999/project-2",
    gradient: "linear-gradient(135deg, #1E1B4B, #312E81)",
  },
];
```

### Updated GraphQL Query (`index.tsx`)

**IMPORTANT — Use existing queries as source of truth:** The existing `index.tsx` page query already has working field names for Hero, About, and Job content types. Use those exact field names rather than assuming from this design doc. The examples below are illustrative — verify against the actual Contentful schema via the existing queries before writing new ones.

```graphql
query IndexPage {
  hero: allContentfulHero {
    nodes { greeting, blurb, name, subtitle }
  }
  about: allContentfulAbout(limit: 1) {
    nodes {
      avatar {
        gatsbyImageData(layout: CONSTRAINED, width: 640, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
        title
      }
      description { raw }
      skills
    }
  }
  allContentfulJob(sort: { order: ASC }) {
    nodes {
      company, dateRange, title, location, order
      url { raw }
      description { raw }
    }
  }
}
```

The `about` query remains but its data feeds into the Hero component (avatar, bio, skills as tags).

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Tag list renders all provided tags

*For any* non-empty array of tag strings, rendering the tag list should produce output containing every tag string from the input array.

**Validates: Requirements 3.4**

### Property 2: ExperienceCard renders all required fields

*For any* valid job data object (with non-empty company, title, dateRange, and description), rendering an ExperienceCard should produce output containing the company name, job title, and date range.

**Validates: Requirements 4.2**

### Property 3: ProjectCard renders all required fields

*For any* valid project data object (with non-empty name, description, tags, and githubUrl), rendering a ProjectCard should produce output containing the project name, description, all tech tags, and a link to the GitHub URL.

**Validates: Requirements 5.3**

### Property 4: Blog index renders one card per post with correct links

*For any* non-empty array of blog post objects (each with title, date, excerpt, and slug), rendering the blog index should produce exactly one card per post, and each card's link should point to `/blog/{slug}`.

**Validates: Requirements 7.2, 7.4**

### Property 5: Blog post template renders all required fields

*For any* blog post data object with non-empty title, date, and body, rendering the blog post template should produce output containing the title, formatted date, and body content.

**Validates: Requirements 8.2**

### Property 6: useFadeIn one-shot observation

*For any* DOM element observed by useFadeIn, when the IntersectionObserver callback fires with `isIntersecting: true`, the hook shall add the `.visible` class to the element and call `unobserve` on that element exactly once.

**Validates: Requirements 10.1, 10.3**

### Property 7: useFadeIn applies delay as CSS custom property

*For any* numeric delay value passed to useFadeIn, the observed element's inline style shall contain `--delay` set to `{delay}ms`.

**Validates: Requirements 10.4**

### Property 8: Card stagger delay equals index × 100ms

*For any* list of N cards (Experience or Project) rendered with stagger, the card at index `i` shall have a `--delay` CSS custom property value of `i * 100` milliseconds.

**Validates: Requirements 10.7, 10.8**

### Property 9: useFadeIn respects prefers-reduced-motion

*For any* element using useFadeIn, when `prefers-reduced-motion: reduce` is active, the element shall have the `.visible` class applied immediately without creating an IntersectionObserver.

**Validates: Requirements 10.10**

## Error Handling

| Scenario | Handling |
|----------|----------|
| Contentful Hero/About data missing | Hero falls back to `HERO_FALLBACK` constants (existing behavior) |
| Contentful Job data empty | Experience section renders "No experience data available" message |
| Contentful BlogPost data empty | Blog index renders "No posts yet" message |
| Blog post body is null | Blog post template renders "This post has no content yet." |
| Blog post slug missing | gatsby-node.ts skips entries with falsy slug |
| Avatar image missing | Hero renders without image (no broken img) |
| IntersectionObserver unsupported | useFadeIn falls back to immediately showing elements (`.visible` class applied on mount) |
| Rich text parse failure | Existing `try/catch` pattern in `getRichTextContent` returns null, component renders nothing for that field |

## Testing Strategy

### Unit Tests (Example-Based)

- Nav renders exactly four links in correct order (Req 2.1)
- Nav does not render About or Resume links (Req 2.6, 2.7)
- Menu renders four links without Resume (Req 2.8)
- Blog link uses Gatsby `<Link>` with `to="/blog"` (Req 2.5)
- Hero renders avatar, name, tagline, bio (Req 3.1–3.3)
- Experience section heading says "Experience" (Req 4.5)
- Projects section heading says "Projects" (Req 5.6)
- Footer renders email, "Denver, CO", and resume download link (Req 6.1, 6.2)
- Blog post with null body shows fallback message (Req 8.5)
- Index page section order: Hero, Experience, Projects, Contact (Req 12.1)

### Property-Based Tests

Property-based tests use a PBT library (e.g., `fast-check`) with minimum 100 iterations per property. Each test is tagged with its design property reference.

| Property | Tag | What It Tests |
|----------|-----|---------------|
| Property 1 | `Feature: portfolio-redesign, Property 1: Tag list renders all provided tags` | Random tag arrays → all appear in rendered output |
| Property 2 | `Feature: portfolio-redesign, Property 2: ExperienceCard renders all required fields` | Random job data → company, title, dateRange in output |
| Property 3 | `Feature: portfolio-redesign, Property 3: ProjectCard renders all required fields` | Random project data → name, description, tags, github link in output |
| Property 4 | `Feature: portfolio-redesign, Property 4: Blog index renders one card per post with correct links` | Random blog post arrays → correct card count and link hrefs |
| Property 5 | `Feature: portfolio-redesign, Property 5: Blog post template renders all required fields` | Random post data → title, date, body in output |
| Property 6 | `Feature: portfolio-redesign, Property 6: useFadeIn one-shot observation` | Mock IntersectionObserver → visible class added, unobserve called once |
| Property 7 | `Feature: portfolio-redesign, Property 7: useFadeIn applies delay as CSS custom property` | Random delay numbers → --delay set correctly |
| Property 8 | `Feature: portfolio-redesign, Property 8: Card stagger delay equals index × 100ms` | Random card counts → each card's --delay = index * 100 |
| Property 9 | `Feature: portfolio-redesign, Property 9: useFadeIn respects prefers-reduced-motion` | Mock reduced motion → visible class immediate, no observer |

### Integration Tests

- gatsby-node.ts creates pages for each blog post slug (Req 8.1)
- GraphQL queries return expected Contentful data shapes (Req 4.3, 7.3, 9.2)

### Smoke Tests

- theme.css contains only dark theme variables (Req 1.1–1.3)
- No `prefers-color-scheme` media query in theme.css (Req 1.2)
- Blog components exist in `src/blog/` directory (Req 13.1)
- Blog CSS exists in `src/styles/blog/` directory (Req 13.2)
- No new npm dependencies added to package.json (Req 11.2)

### Files to Delete

- `src/components/About.tsx` — functionality merged into Hero
- `src/components/WorkHistory.tsx` — replaced by Experience + ExperienceCard
- `src/styles/components/about.css` — replaced by updated hero.css
- `src/styles/components/work-history.css` — replaced by experience.css
