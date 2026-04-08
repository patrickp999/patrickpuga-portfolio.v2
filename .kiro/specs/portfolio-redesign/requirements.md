# Requirements Document

## Introduction

This feature covers an evolutionary redesign of an existing Gatsby 5 + TypeScript portfolio site. The redesign consolidates the hero and about sections, replaces the work history layout with cards, adds a new projects section, introduces a blog powered by Contentful, applies a single dark theme with a new color palette, updates navigation links, redesigns the footer, and adds scroll-triggered fade-in animations. The existing structure, plain CSS approach, and Contentful CMS integration are preserved.

## Glossary

- **Site**: The Gatsby 5 static portfolio website and all its pages
- **Theme_System**: The CSS custom properties defined at `:root` level in `theme.css` that control all colors and visual tokens across the Site
- **Nav**: The fixed header navigation component (`Nav.tsx`) containing desktop links and a mobile hamburger/drawer menu
- **Hero_Section**: The full-viewport opening section combining the former hero and about content into a single unified block
- **Experience_Section**: The card-based work history section displaying job entries sourced from Contentful
- **Experience_Card**: An individual card within the Experience_Section representing one job
- **Projects_Section**: The new two-column grid section displaying project showcase cards
- **Project_Card**: An individual card within the Projects_Section representing one project
- **Contact_Section**: The existing section displaying social links (GitHub, LinkedIn)
- **Footer**: The minimal site footer containing email, location, and a resume download link
- **Blog_Index_Page**: The Gatsby page at `/blog` listing all blog posts as cards
- **Blog_Post_Page**: An individual Gatsby page at `/blog/[slug]` rendering a single blog post
- **Blog_Post**: A Contentful content type with fields: title, slug, date, body (rich text), and excerpt
- **Fade_In_Animation**: A scroll-triggered CSS animation transitioning an element from `opacity: 0; translateY(24px)` to full opacity over 400–500ms
- **useFadeIn_Hook**: A reusable TypeScript React hook that uses the Intersection Observer API to trigger Fade_In_Animation on elements
- **Stagger_Delay**: A CSS custom property (`--delay`) applied to sequential cards so each card's Fade_In_Animation fires ~100ms after the previous one
- **Contentful**: The headless CMS providing all dynamic content via `gatsby-source-contentful`
- **gatsby-node.ts**: The Gatsby Node API file used to programmatically create Blog_Post_Page pages from Contentful Blog_Post entries

## Requirements

### Requirement 1: Single Dark Theme

**User Story:** As a visitor, I want the site to always display in a single dark theme, so that the visual experience is consistent regardless of system preferences.

#### Acceptance Criteria

1. THE Theme_System SHALL define the following CSS custom properties at `:root` level: `--bg: #0F172A`, `--accent: #0EA5E9`, `--surface-light: #F8FAFC`, `--muted: #64748B`, `--tag-bg: #E0F2FE`, `--tag-text: #0369A1`
2. THE Theme_System SHALL remove the existing `prefers-color-scheme` media query and all light-theme variable definitions from `theme.css`
3. THE Theme_System SHALL remove the `data-theme` attribute overrides from `theme.css`
4. THE Site SHALL render all pages using only the dark theme color values defined in the Theme_System

### Requirement 2: Navigation Redesign

**User Story:** As a visitor, I want clear navigation links to Experience, Projects, Blog, and Contact, so that I can reach every section of the site.

#### Acceptance Criteria

1. THE Nav SHALL display exactly four links in this order: Experience, Projects, Blog, Contact
2. WHEN a visitor clicks the Experience link, THE Nav SHALL smooth-scroll to the Experience_Section anchor
3. WHEN a visitor clicks the Projects link, THE Nav SHALL smooth-scroll to the Projects_Section anchor
4. WHEN a visitor clicks the Contact link, THE Nav SHALL smooth-scroll to the Contact_Section anchor
5. WHEN a visitor clicks the Blog link, THE Nav SHALL navigate to the `/blog` route using a Gatsby Link
6. THE Nav SHALL NOT display an "About" link
7. THE Nav SHALL NOT display a "Resume" button or link
8. THE Mobile drawer menu (Menu component) SHALL display the same four links: Experience, Projects, Blog, Contact, and SHALL NOT display a Resume link

### Requirement 3: Unified Hero Section

**User Story:** As a visitor, I want to see a combined hero and about section when I land on the site, so that I immediately understand who the person is and what they do.

#### Acceptance Criteria

1. THE Hero_Section SHALL display a headshot photo sourced from the Contentful About content type avatar field
2. THE Hero_Section SHALL display the person's name and a tagline reading "Software engineer, AI explorer."
3. THE Hero_Section SHALL display a 3–4 sentence bio mentioning Denver, engineering background, current work building large-scale web and mobile apps, and a growing focus on AI tooling
4. THE Hero_Section SHALL display tech tags: React, TypeScript, Node.js, React Native, GraphQL, AWS, Python, "AI tooling", "LLM workflows"
5. THE Hero_Section SHALL use `--tag-bg: #E0F2FE` as the tag background color and `--tag-text: #0369A1` as the tag text color
6. THE Site SHALL remove the separate About component and About section from the index page
7. WHEN the page loads, THE Hero_Section SHALL animate into view using a fade-in effect (not scroll-triggered)

### Requirement 4: Card-Based Experience Section

**User Story:** As a visitor, I want to see work experience displayed as individual cards, so that each role is visually distinct and easy to scan.

#### Acceptance Criteria

1. THE Experience_Section SHALL replace the existing tab-based WorkHistory layout with a vertical list of Experience_Card components
2. EACH Experience_Card SHALL display: a company logo placeholder (company initials in a styled circle), job title, date range, a one-paragraph description, and tech tags
3. THE Experience_Section SHALL source job data from the existing Contentful Job content type
4. THE Experience_Section SHALL preserve the same four jobs currently in Contentful
5. THE Experience_Section SHALL display a section heading labeled "Experience" with the same heading-with-rule style used in the current site

### Requirement 5: Projects Section

**User Story:** As a visitor, I want to see a showcase of projects in a card grid, so that I can explore the person's work and access source code.

#### Acceptance Criteria

1. THE Projects_Section SHALL display Project_Card components in a two-column grid layout on desktop viewports
2. THE Projects_Section SHALL collapse to a single-column layout on viewports 640px wide or narrower
3. EACH Project_Card SHALL display: a dark gradient thumbnail, project name, a short description blurb, tech tags, and a GitHub link
4. THE Project_Card thumbnails SHALL use dark gradient backgrounds: `#0F172A → #1E293B` for AI-related projects and `#1E1B4B → #312E81` for developer tool projects
5. THE Projects_Section SHALL be scaffolded with placeholder Project_Card data (minimum two cards)
6. THE Projects_Section SHALL display a section heading labeled "Projects"
7. THE Projects_Section SHALL be positioned between the Experience_Section and the Contact_Section on the index page

### Requirement 6: Footer Redesign

**User Story:** As a visitor, I want a minimal footer with contact info and a resume download, so that I can easily reach out or grab the resume without it cluttering the navigation.

#### Acceptance Criteria

1. THE Footer SHALL display an email address, the text "Denver, CO", and a "Download resume ↓" link
2. WHEN a visitor clicks the "Download resume ↓" link, THE Footer SHALL open or download the resume PDF located at `/Patrick_Puga_Resume.pdf`
3. THE Footer SHALL NOT display the resume link in the Nav or anywhere else on the site outside the Footer
4. THE Footer SHALL replace the existing copyright-only footer in `Layout.tsx`

### Requirement 7: Blog Index Page

**User Story:** As a visitor, I want a blog listing page at `/blog`, so that I can browse all published posts.

#### Acceptance Criteria

1. THE Blog_Index_Page SHALL be a Gatsby page served at the `/blog` route
2. THE Blog_Index_Page SHALL display a list of Blog_Post entries as cards, each showing: title, date, and excerpt
3. THE Blog_Index_Page SHALL source Blog_Post data from Contentful using the `gatsby-source-contentful` plugin
4. WHEN a visitor clicks a blog post card, THE Blog_Index_Page SHALL navigate to the corresponding Blog_Post_Page at `/blog/[slug]`
5. THE Blog_Index_Page SHALL use the same Nav, color palette, and font stack as the portfolio pages
6. THE Blog_Index_Page SHALL keep blog-specific components in a separate directory from portfolio components

### Requirement 8: Blog Post Pages

**User Story:** As a visitor, I want to read individual blog posts on their own pages, so that I can consume the full content of each post.

#### Acceptance Criteria

1. THE gatsby-node.ts file SHALL programmatically create one Blog_Post_Page for each Blog_Post entry in Contentful at the path `/blog/[slug]`
2. EACH Blog_Post_Page SHALL display: the post title, the publication date, and the full body rendered from Contentful rich text
3. THE Blog_Post_Page SHALL use the same Nav, color palette, and font stack as the portfolio pages
4. THE Blog_Post_Page template SHALL be stored separately from portfolio components
5. IF a Blog_Post has no body content, THEN THE Blog_Post_Page SHALL display a message indicating the post has no content

### Requirement 9: Contentful Blog Post Content Type

**User Story:** As a content author, I want a Blog Post content type in Contentful, so that I can create and manage blog posts through the CMS.

#### Acceptance Criteria

1. THE Blog_Post content type in Contentful SHALL include the following fields: title (short text), slug (short text), date (date), body (rich text), excerpt (short text)
2. THE Site SHALL query Blog_Post entries from Contentful using the `gatsby-source-contentful` plugin
3. THE Blog_Index_Page and Blog_Post_Page SHALL render content sourced exclusively from the Blog_Post content type

### Requirement 10: Scroll-Triggered Fade-In Animations

**User Story:** As a visitor, I want sections and cards to gracefully fade in as I scroll, so that the site feels polished and alive.

#### Acceptance Criteria

1. THE useFadeIn_Hook SHALL use the Intersection Observer API to detect when an element enters the viewport
2. THE useFadeIn_Hook SHALL apply a Fade_In_Animation transitioning from `opacity: 0; transform: translateY(24px)` to `opacity: 1; transform: translateY(0)` over 400–500ms
3. THE useFadeIn_Hook SHALL unobserve each element after the animation triggers (one-shot behavior)
4. THE useFadeIn_Hook SHALL accept an optional delay parameter to support Stagger_Delay
5. THE useFadeIn_Hook SHALL be implemented as a TypeScript function returning a React ref
6. WHEN the page loads, THE Hero_Section SHALL animate using a load-triggered fade-in, not a scroll-triggered fade-in
7. THE Experience_Card components SHALL stagger their Fade_In_Animation at approximately 100ms delay per card using a `--delay` CSS custom property
8. THE Project_Card components SHALL stagger their Fade_In_Animation at approximately 100ms delay per card using a `--delay` CSS custom property
9. THE Experience_Section heading and Projects_Section heading SHALL fade in before their respective cards
10. WHILE the visitor has `prefers-reduced-motion: reduce` enabled, THE useFadeIn_Hook SHALL skip all animations and display elements at full opacity immediately

### Requirement 11: Styling Constraints

**User Story:** As a developer, I want the redesign to use plain CSS only and avoid new dependencies, so that the site stays fast and the codebase stays simple.

#### Acceptance Criteria

1. THE Site SHALL use plain CSS for all styling — no Tailwind CSS, no CSS-in-JS libraries, and no new styling dependencies
2. THE Site SHALL NOT add new npm dependencies unless the dependency is unavoidable for core functionality
3. THE Site SHALL maintain component-specific CSS files in `src/styles/components/`
4. THE Site SHALL use CSS custom properties defined in `theme.css` for all color, shadow, and radius values

### Requirement 12: Page Section Order

**User Story:** As a visitor, I want the homepage sections in a logical reading order, so that the content flows naturally from introduction to contact.

#### Acceptance Criteria

1. THE index page SHALL render sections in this order: Hero_Section, Experience_Section, Projects_Section, Contact_Section
2. THE index page SHALL NOT render a separate About section
3. THE Footer SHALL appear below the Contact_Section as part of the Layout component

### Requirement 13: Blog Component Separation

**User Story:** As a developer, I want blog components cleanly separated from portfolio components, so that the codebase is organized and maintainable.

#### Acceptance Criteria

1. THE Site SHALL store blog-specific components (blog index page, blog post template, blog-specific UI elements) in a directory separate from `src/components/`
2. THE Site SHALL store blog-specific CSS files separate from portfolio component CSS files
3. THE Blog_Index_Page and Blog_Post_Page SHALL share the Layout component (Nav + Footer) with the portfolio pages
