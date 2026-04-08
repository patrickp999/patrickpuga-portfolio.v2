# Implementation Plan: Portfolio Redesign

## Overview

Incremental refactor of the Gatsby 5 + TypeScript portfolio site: single dark theme, merged Hero/About, card-based Experience, new Projects section, Nav updates, scroll animations via `useFadeIn`, Contentful-powered blog, and footer redesign. Implementation follows the order specified in the design brief, with each step building on the previous.

## Tasks

- [x] 1. CSS custom property color system — dark theme
  - [x] 1.1 Rewrite `src/styles/theme.css` to a single `:root` block with dark theme values
    - Replace the entire file contents: remove the light-theme `:root`, the `prefers-color-scheme: dark` media query, and the `data-theme` attribute overrides
    - New `:root` must define: `--bg: #0F172A`, `--surface: #1E293B`, `--text: #E2E8F0`, `--muted: #64748B`, `--border: #334155`, `--accent: #0EA5E9`, `--accent-hover: #38BDF8`, `--surface-light: #F8FAFC`, `--tag-bg: #E0F2FE`, `--tag-text: #0369A1`, `--radius: 12px`, `--shadow-sm`, `--shadow-md`
    - Remove `--primary`, `--primary-700`, `--hero-name`, and old `--accent` / `--accent-700` variables entirely
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Global find-and-replace of `--primary` and `--primary-700` across all files under `src/styles/`
    - Grep `src/styles/` for every occurrence of `--primary` and `--primary-700`
    - Replace `--primary-700` → `--accent-hover` and `--primary` → `--accent` in each file
    - Files known to reference these: `global.css` (anchor colors, `.pill`), `nav.css` (`.nav-link:hover`, `.resume-link`, hamburger lines), `menu.css`, `contact.css`, `hero.css` (`.hero-title`), `about.css` (heading rule, skills, company link), `work-history.css` (tabs, heading rule, list markers), `layout.css`
    - After replacement, verify no remaining `--primary` references exist via a final grep
    - _Requirements: 1.1, 1.4_

  - [x] 1.3 Update `src/components/seo.tsx` theme-color meta tags
    - Replace the two `prefers-color-scheme` theme-color meta tags with a single `<meta name="theme-color" content="#0F172A" />` (no media attribute)
    - _Requirements: 1.4_

- [x] 2. Checkpoint — Theme complete
  - Ensure all theme changes compile cleanly (`gatsby build` or `tsc --noEmit`). Ask the user if questions arise.

- [x] 3. Merged Hero/About section
  - [x] 3.1 Expand `HeroContent` type and update `Hero.tsx` to render avatar, bio, and tags
    - Update `HeroContent` in `Hero.tsx`: add `bio: string` (raw rich text JSON string from Contentful), `tags: string[]`, `avatar?: IGatsbyImageData | null`
    - Import `GatsbyImage` and `getImage` from `gatsby-plugin-image`
    - The `description.raw` field from the About content type is Contentful rich text (a JSON string), NOT a plain string. Follow the same pattern used in the existing `About.tsx`: parse it with `JSON.parse()` and render via `documentToReactComponents` from `@contentful/rich-text-react-renderer`. Do NOT pass `description.raw` directly into a `<p>` tag.
    - Render: avatar image (using `GatsbyImage`), name, tagline (`subtitle`), bio (rendered as rich text), and tech tag pills
    - Tag pills use `--tag-bg` background and `--tag-text` color
    - Keep the existing `react-transition-group` load-triggered fade-in for the hero (NOT scroll-triggered)
    - Remove the mobile `SocialLinks` from the hero section (social links stay in Contact/Footer)
    - Update `HERO_FALLBACK` in `constants.ts` to include `bio` and `tags` defaults
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 10.6_

  - [ ]* 3.2 Write property test: Tag list renders all provided tags
    - **Property 1: Tag list renders all provided tags**
    - **Validates: Requirements 3.4**

  - [x] 3.3 Rewrite `src/styles/components/hero.css` for the merged layout
    - Centered column layout: avatar on top, name + tagline, bio, tag pills below
    - Style `.hero-tags` container as a flex-wrap list of pill elements
    - Style `.hero-avatar` with border-radius and constrained width
    - Preserve responsive adjustments for mobile (≤640px)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.4 Update `src/pages/index.tsx` to pass About data into Hero and remove About section
    - Keep the `about` GraphQL query but pass `aboutNode.avatar`, `aboutNode.description`, and `aboutNode.skills` into the `Hero` component as `bio`, `tags`, and `avatar` props
    - `description.raw` is Contentful rich text (JSON string) — pass it as-is and let Hero render it via `documentToReactComponents` (same pattern as existing `About.tsx`)
    - Remove the `<About data={aboutNode} />` render call
    - Remove the `About` import
    - Use existing GraphQL field names from the current `pageQuery` (e.g., `avatar.gatsbyImageData`, `description.raw`, `skills`) — do NOT change field names
    - _Requirements: 3.1, 3.6, 12.1, 12.2_

  - [x] 3.5 Delete `src/components/About.tsx` and `src/styles/components/about.css`
    - Remove `About.tsx` from the codebase
    - Remove `about.css` from the codebase
    - Do NOT remove the About content type from Contentful — only the component file is deleted
    - Update `src/components/index.ts` to remove the `About` export
    - _Requirements: 3.6_

- [x] 4. Checkpoint — Hero/About merge complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Experience card layout
  - [x] 5.1 Create `src/components/ExperienceCard.tsx`
    - Props: `company`, `title`, `dateRange`, `description` (Contentful rich text `Document | null`), `companyUrl` (optional), `index` (for stagger delay)
    - Render: company initials circle (first letters of company name, `--accent` border), job title, date range, rich text description via `documentToReactComponents`
    - Apply `useFadeIn` with `delay: index * 100` for stagger animation
    - Add `className="fade-in"` to the card wrapper
    - _Requirements: 4.2, 10.7_

  - [ ]* 5.2 Write property test: ExperienceCard renders all required fields
    - **Property 2: ExperienceCard renders all required fields**
    - **Validates: Requirements 4.2**

  - [x] 5.3 Create `src/components/Experience.tsx`
    - Replace the tab-based WorkHistory with a vertical stack of `ExperienceCard` components
    - Section `id="experience"`, heading text "Experience" with heading-with-rule style
    - Source data from existing Contentful Job content type (same GraphQL fields as current `allContentfulJob` query)
    - Apply `useFadeIn` to the section heading so it fades in before cards
    - If no jobs data, render "No experience data available" message
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 10.9_

  - [x] 5.4 Create `src/styles/components/experience.css`
    - Card styles: `--surface` background, `--border` border, `--radius` border-radius
    - Company initials circle: `--accent` border color
    - Heading-with-rule style matching existing pattern (flex + `::after` rule)
    - Responsive: stack cards vertically on all viewports
    - _Requirements: 4.1, 4.2, 4.5, 11.1, 11.3_

  - [ ]* 5.5 Write property test: Card stagger delay equals index × 100ms
    - **Property 8: Card stagger delay equals index × 100ms**
    - **Validates: Requirements 10.7, 10.8**

  - [x] 5.6 Update `src/pages/index.tsx` to use Experience instead of WorkHistory
    - Replace `<WorkHistory>` with `<Experience>` component
    - Pass `allContentfulJob.nodes` to Experience
    - Update imports
    - _Requirements: 4.1, 12.1_

  - [x] 5.7 Delete `src/components/WorkHistory.tsx` and `src/styles/components/work-history.css`
    - Remove both files from the codebase
    - Update `src/components/index.ts` to replace `WorkHistory` export with `Experience` export
    - _Requirements: 4.1_

- [x] 6. Checkpoint — Experience section complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Projects section
  - [x] 7.1 Create `src/components/ProjectCard.tsx`
    - Props: `name`, `description`, `tags`, `githubUrl`, `gradient`, `index` (for stagger)
    - Render: gradient thumbnail div, project name, description, tech tag pills, GitHub icon link (using `FaGithub` from `react-icons`)
    - Apply `useFadeIn` with `delay: index * 100` for stagger animation
    - _Requirements: 5.3, 5.4, 10.8_

  - [ ]* 7.2 Write property test: ProjectCard renders all required fields
    - **Property 3: ProjectCard renders all required fields**
    - **Validates: Requirements 5.3**

  - [x] 7.3 Create `src/components/Projects.tsx`
    - Before hardcoding any project data, query the GraphQL layer for `allContentfulProject` to check if a Project content type exists in Contentful
    - If it exists: source project data from Contentful (do NOT hardcode)
    - If it does NOT exist: flag it and ASK the user before defaulting to a static placeholder array
    - Two-column CSS grid on desktop (>640px), single column on mobile
    - Section `id="projects"`, heading "Projects" with heading-with-rule style
    - Apply `useFadeIn` to the section heading
    - _Requirements: 5.1, 5.2, 5.5, 5.6, 5.7, 10.9_

  - [x] 7.4 Create `src/styles/components/projects.css`
    - Two-column grid layout with gap
    - Card styles consistent with experience cards
    - Gradient thumbnail styling
    - Tag pills reusing theme variables
    - Responsive single-column at ≤640px
    - _Requirements: 5.1, 5.2, 11.1, 11.3_

  - [x] 7.5 Wire Projects into `src/pages/index.tsx`
    - Add `<Projects>` between `<Experience>` and `<Contact>` in the render order
    - Add GraphQL query for project data if sourced from Contentful
    - Section order: Hero, Experience, Projects, Contact
    - _Requirements: 5.7, 12.1_

- [x] 8. Checkpoint — Projects section complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Nav update
  - [x] 9.1 Update `DEFAULT_LINKS` in `src/utils/constants.ts`
    - Change to: `[{ url: "#experience", name: "Experience" }, { url: "#projects", name: "Projects" }, { url: "/blog", name: "Blog" }, { url: "#contact", name: "Contact" }]`
    - Remove `RESUME_HREF` export
    - Update `navItemCount` to no longer add +1 for resume
    - _Requirements: 2.1, 2.6, 2.7_

  - [x] 9.2 Update `src/components/Nav.tsx`
    - Remove all resume-related code: the synthetic "resume" item in the nav list, the `RESUME_HREF` import, and the resume `<a>` element
    - Blog link (`/blog`) must use Gatsby `<Link to="/blog">` instead of anchor scroll — add conditional rendering: if `url.startsWith("#")` use `<a>`, else use `<Link>`
    - Remove the `RESUME_HREF` import from constants
    - _Requirements: 2.1, 2.5, 2.6, 2.7_

  - [x] 9.3 Update `src/components/Menu.tsx`
    - Remove `resumeHref` prop from the `Props` type
    - Remove the resume `<a>` element from the drawer
    - Blog link uses Gatsby `<Link>` (already handled by existing `url.startsWith("#")` conditional)
    - Update the `Menu` call site in `Nav.tsx` to stop passing `resumeHref`
    - _Requirements: 2.8_

  - [x] 9.4 Update `src/styles/components/nav.css`
    - Remove `.resume-link` styles (no longer needed)
    - _Requirements: 2.7_

- [x] 10. Checkpoint — Nav update complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Scroll animation system
  - [x] 11.1 Create `src/utils/useFadeIn.ts` hook
    - Implement `useFadeIn(options?: { delay?: number; threshold?: number }): React.RefObject<HTMLElement>`
    - Use `IntersectionObserver` with configurable threshold (default 0.15)
    - On intersection (`isIntersecting: true`): add `.visible` class, call `unobserve` (one-shot)
    - If `delay` provided: set `--delay` CSS custom property on the element as `${delay}ms`
    - If `prefers-reduced-motion: reduce` is active: skip observer, immediately add `.visible`
    - If `IntersectionObserver` is not supported: immediately add `.visible` (fallback)
    - Clean up observer on unmount
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.10_

  - [ ]* 11.2 Write property test: useFadeIn one-shot observation
    - **Property 6: useFadeIn one-shot observation**
    - **Validates: Requirements 10.1, 10.3**

  - [ ]* 11.3 Write property test: useFadeIn applies delay as CSS custom property
    - **Property 7: useFadeIn applies delay as CSS custom property**
    - **Validates: Requirements 10.4**

  - [ ]* 11.4 Write property test: useFadeIn respects prefers-reduced-motion
    - **Property 9: useFadeIn respects prefers-reduced-motion**
    - **Validates: Requirements 10.10**

  - [x] 11.5 Add `.fade-in` and `.fade-in.visible` CSS classes to `src/styles/global.css`
    - `.fade-in`: `opacity: 0; transform: translateY(24px); transition: opacity 450ms ease var(--delay, 0ms), transform 450ms ease var(--delay, 0ms)`
    - `.fade-in.visible`: `opacity: 1; transform: translateY(0)`
    - `@media (prefers-reduced-motion: reduce)` override: `opacity: 1; transform: none; transition: none`
    - _Requirements: 10.2, 10.10_

  - [x] 11.6 Wire `useFadeIn` into Experience, ExperienceCard, Projects, and ProjectCard components
    - Ensure section headings for Experience and Projects use `useFadeIn` (no delay)
    - Ensure each ExperienceCard and ProjectCard uses `useFadeIn` with `delay: index * 100`
    - Add `className="fade-in"` to all animated elements
    - Verify Hero does NOT use scroll-triggered animation (keeps load-triggered fade)
    - _Requirements: 10.6, 10.7, 10.8, 10.9_

- [x] 12. Checkpoint — Scroll animations complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Blog index and post template via Contentful
  - [x] 13.1 Create `src/blog/` directory with `BlogCard.tsx` and `index.ts`
    - `BlogCard` props: `title`, `date`, `excerpt`, `slug`
    - Renders a card linking to `/blog/${slug}` with title, formatted date, and excerpt
    - Apply `useFadeIn` for card animation
    - _Requirements: 7.2, 7.4, 7.6, 13.1_

  - [ ]* 13.2 Write property test: Blog index renders one card per post with correct links
    - **Property 4: Blog index renders one card per post with correct links**
    - **Validates: Requirements 7.2, 7.4**

  - [x] 13.3 Create `src/styles/blog/blog-index.css` and `src/styles/blog/blog-post.css`
    - Blog index: card list layout, card hover states
    - Blog post: article typography, date styling, body content
    - Use theme CSS custom properties for all colors
    - _Requirements: 7.5, 8.3, 11.1, 11.3, 13.2_

  - [x] 13.4 Create `src/pages/blog.tsx` — Blog index page
    - Query `allContentfulBlogPost(sort: { date: DESC })` for title, date, excerpt, slug
    - Render list of `BlogCard` components wrapped in `Layout`
    - If no posts, render "No posts yet" message
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 13.5 Create `src/templates/blog-post.tsx` — Blog post template
    - Receives `pageContext.slug` from `gatsby-node.ts`
    - Queries single `contentfulBlogPost(slug: { eq: $slug })` for title, date, body (raw)
    - Renders title, formatted date, and rich text body via `documentToReactComponents`
    - If body is null/empty, renders "This post has no content yet."
    - Wrapped in `Layout`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 13.6 Write property test: Blog post template renders all required fields
    - **Property 5: Blog post template renders all required fields**
    - **Validates: Requirements 8.2**

  - [x] 13.7 Create `gatsby-node.ts` to programmatically create blog post pages
    - Verify no `gatsby-node.ts` or `gatsby-node.js` exists at the project root before creating (confirmed: none exists in this repo)
    - Query `allContentfulBlogPost` for slugs
    - Create a page at `/blog/${slug}` for each entry using `src/templates/blog-post.tsx`
    - Skip entries with falsy slug
    - _Requirements: 8.1, 9.2_

- [x] 14. Checkpoint — Blog complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Footer cleanup with resume link
  - [x] 15.1 Create `src/components/Footer.tsx`
    - Render: email address, "Denver, CO" text, and "Download resume ↓" link pointing to `/Patrick_Puga_Resume.pdf`
    - Resume link uses `download` attribute or `target="_blank"`
    - Minimal, centered layout
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 15.2 Create `src/styles/components/footer.css`
    - Centered flex layout with gap between items
    - Use `--muted` for text, `--accent` for link hover
    - Border-top separator using `--border`
    - _Requirements: 6.1, 11.1, 11.3_

  - [x] 15.3 Update `src/components/Layout.tsx` to use the new Footer component
    - Replace the inline `<footer>` with `<Footer />` import and render
    - _Requirements: 6.4, 12.3_

  - [x] 15.4 Update `src/components/index.ts` exports
    - Add `Footer` and `Experience` exports
    - Ensure `About` and `WorkHistory` exports are removed (if not already done in earlier steps)
    - Verify all new components are properly exported
    - _Requirements: 6.4_

- [x] 16. Final checkpoint — Ensure all tests pass
  - Run `tsc --noEmit` to verify no type errors
  - Verify no remaining `--primary` or `--primary-700` references in `src/styles/`
  - Verify section order on index page: Hero, Experience, Projects, Contact
  - Verify no About section rendered on index page
  - Verify no Resume link in Nav or Menu
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Do NOT hardcode data for content that can be sourced from Contentful — always check the GraphQL layer first
- The About content type stays in Contentful; only `About.tsx` is deleted from the codebase
- Use existing GraphQL field names from `index.tsx` page query as source of truth, not design doc examples
