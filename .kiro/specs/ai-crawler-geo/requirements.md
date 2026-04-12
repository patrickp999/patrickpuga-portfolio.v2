# Requirements Document

## Introduction

AI Crawler GEO (Generative Engine Optimization) serves AI crawlers a clean, structured plain-text version of the portfolio site instead of the JS-heavy Gatsby output. At build time, Gatsby queries Contentful for all portfolio content and writes static `.txt` files to `/public/ai-content/`. At request time, a Netlify Edge Function uses dual-signal detection — matching known AI crawler User-Agent strings or detecting the absence of an `Accept-Language` header — to identify non-human requests and rewrite them to serve the corresponding `.txt` file, falling back silently to the normal Gatsby page when no `.txt` file exists.

## Glossary

- **Text_Generator**: The `onPostBuild` lifecycle hook added to `gatsby-node.ts` that queries Contentful via GraphQL and writes structured plain-text files to the `/public/ai-content/` directory.
- **Crawler_Detector**: The Netlify Edge Function (`netlify/edge-functions/ai-crawler.ts`) that uses dual-signal detection — User-Agent matching and Accept-Language header absence — to identify AI crawler requests and rewrite them to serve the corresponding `.txt` file.
- **AI_Crawler**: An automated HTTP client identified by either a User-Agent string matching a known AI crawler identifier (e.g., `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `Google-Extended`, `Claude-Web`, `ClaudeBot`, `anthropic-ai`, `Bytespider`, `CCBot`, `PerplexityBot`, `Amazonbot`, `FacebookBot`, `Applebot-Extended`, `cohere-ai`, `DiffBot`) or by the absence of an `Accept-Language` header.
- **Detection_Result**: A structured object produced by the Crawler_Detector that indicates whether a request was classified as an AI crawler and which signal triggered the detection (`ua`, `accept-language`, or `both`).
- **Text_File**: A structured plain-text file (`.txt`) written to `/public/ai-content/` containing LLM-readable content with markdown-style headings and labeled sections.
- **Contentful_CMS**: The headless content management system that stores all portfolio content (hero/about, experience, projects, blog posts).
- **Edge_Function_Config**: The `netlify.toml` configuration file that registers the Crawler_Detector edge function on all site paths.
- **Rich_Text_JSON**: The raw JSON string stored in Contentful rich text fields (e.g., `intro.raw`) that requires parsing to extract plain-text content.

## Requirements

### Requirement 1: Generate Index Text File

**User Story:** As a site owner, I want the build process to generate a structured plain-text file for the homepage, so that AI crawlers receive a clean summary of my identity and skills.

#### Acceptance Criteria

1. WHEN the Gatsby build completes, THE Text_Generator SHALL query Contentful_CMS for the PortfolioHero content type and retrieve the `name`, `subtitle`, and `intro` fields.
2. WHEN PortfolioHero data is retrieved, THE Text_Generator SHALL parse the Rich_Text_JSON from the `intro.raw` field and extract plain-text content.
3. WHEN the plain-text content is extracted, THE Text_Generator SHALL write a Text_File named `index.txt` to the `/public/ai-content/` directory.
4. THE Text_Generator SHALL structure the `index.txt` file with a top-level heading containing the site owner name, a subtitle line, and the intro text as a labeled section.
5. IF the PortfolioHero data is unavailable from Contentful_CMS, THEN THE Text_Generator SHALL log a warning and skip generation of `index.txt` without failing the build.

### Requirement 2: Generate Experience Text File

**User Story:** As a site owner, I want the build process to generate a structured plain-text file listing my work experience, so that AI crawlers can accurately describe my professional background.

#### Acceptance Criteria

1. WHEN the Gatsby build completes, THE Text_Generator SHALL query Contentful_CMS for all ExperienceRole entries sorted by the `order` field in ascending order.
2. WHEN ExperienceRole entries are retrieved, THE Text_Generator SHALL write a Text_File named `experience.txt` to the `/public/ai-content/` directory.
3. THE Text_Generator SHALL structure each ExperienceRole entry in `experience.txt` with the `title`, `company`, `dateRange`, `blurb.blurb` text, `technologies` list, and `tags` list as labeled fields.
4. WHEN an ExperienceRole entry has a `companyUrl` value, THE Text_Generator SHALL include the URL in the corresponding entry section.
5. IF no ExperienceRole entries exist in Contentful_CMS, THEN THE Text_Generator SHALL log a warning and skip generation of `experience.txt` without failing the build.

### Requirement 3: Generate Projects Text File

**User Story:** As a site owner, I want the build process to generate a structured plain-text file listing my projects, so that AI crawlers can reference my portfolio work.

#### Acceptance Criteria

1. WHEN the Gatsby build completes, THE Text_Generator SHALL query Contentful_CMS for all Project entries sorted by the `order` field in ascending order.
2. WHEN Project entries are retrieved, THE Text_Generator SHALL write a Text_File named `projects.txt` to the `/public/ai-content/` directory.
3. THE Text_Generator SHALL structure each Project entry in `projects.txt` with the `name`, `description.description` text, `tags` list, and `githubUrl` as labeled fields.
4. WHEN a Project entry has a `liveUrl` value, THE Text_Generator SHALL include the live URL in the corresponding entry section.
5. IF no Project entries exist in Contentful_CMS, THEN THE Text_Generator SHALL log a warning and skip generation of `projects.txt` without failing the build.

### Requirement 4: Ensure Text File Output Directory

**User Story:** As a site owner, I want the build process to create the output directory automatically, so that text file generation does not fail due to a missing directory.

#### Acceptance Criteria

1. WHEN the Text_Generator begins writing Text_Files, THE Text_Generator SHALL create the `/public/ai-content/` directory if the directory does not already exist.
2. WHEN the `/public/ai-content/` directory already exists, THE Text_Generator SHALL proceed without error.

### Requirement 5: Dual-Signal AI Crawler Detection

**User Story:** As a site owner, I want incoming requests from AI crawlers to be identified using multiple signals — User-Agent matching and Accept-Language header absence — so that detection is more robust than UA string matching alone.

#### Acceptance Criteria

1. WHEN an HTTP request arrives, THE Crawler_Detector SHALL read both the `User-Agent` header and the `Accept-Language` header from the request.
2. THE Crawler_Detector SHALL maintain a list of known AI_Crawler User-Agent identifiers including at minimum: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `Google-Extended`, `Claude-Web`, `ClaudeBot`, `anthropic-ai`, `Bytespider`, `CCBot`, `PerplexityBot`, `Amazonbot`, `FacebookBot`, `Applebot-Extended`, `cohere-ai`, `DiffBot`.
3. WHEN the `User-Agent` header contains a substring matching any known AI_Crawler identifier (case-insensitive), THE Crawler_Detector SHALL classify the request as an AI crawler request.
4. WHEN the `Accept-Language` header is absent entirely from the request, THE Crawler_Detector SHALL classify the request as an AI crawler request.
5. WHEN both the User-Agent matches AND the Accept-Language header is absent, THE Crawler_Detector SHALL classify the request as an AI crawler request.
6. THE Crawler_Detector SHALL produce a Detection_Result that includes a `triggeredBy` field indicating which signal caused the detection: `ua` (User-Agent match only), `accept-language` (Accept-Language absent only), or `both` (both signals matched).
7. WHEN neither the User-Agent matches a known AI_Crawler identifier NOR the Accept-Language header is absent, THE Crawler_Detector SHALL pass the request through to the normal Gatsby response without modification.

### Requirement 6: Rewrite AI Crawler Requests to Text Files

**User Story:** As a site owner, I want AI crawler requests to be transparently rewritten to serve the plain-text version, so that crawlers receive structured content without affecting normal users.

#### Acceptance Criteria

1. WHEN the Crawler_Detector classifies a request as an AI crawler request for the root path (`/`), THE Crawler_Detector SHALL rewrite the request to serve `/ai-content/index.txt`.
2. WHEN the Crawler_Detector classifies a request as an AI crawler request for any path, THE Crawler_Detector SHALL attempt to map the request path to a corresponding Text_File in `/ai-content/` (e.g., `/experience` maps to `/ai-content/experience.txt`).
3. WHEN the Crawler_Detector classifies a request as an AI crawler request and no corresponding Text_File exists for the requested path, THE Crawler_Detector SHALL fall back silently to the normal Gatsby response without modification.
4. WHEN the Crawler_Detector rewrites a request to a Text_File, THE Crawler_Detector SHALL set the `Content-Type` response header to `text/plain; charset=utf-8`.
5. WHEN the Crawler_Detector rewrites a request, THE Crawler_Detector SHALL preserve the original request URL visible to the client.
6. WHEN the Crawler_Detector rewrites a request to a Text_File, THE Crawler_Detector SHALL include an `X-Served-For: ai-crawler` response header so that the rewrite can be confirmed during debugging by inspecting response headers.

### Requirement 7: Register Edge Function in Netlify Configuration

**User Story:** As a site owner, I want the Netlify Edge Function registered on all site paths, so that every incoming request is evaluated for AI crawler detection.

#### Acceptance Criteria

1. THE Edge_Function_Config SHALL register the Crawler_Detector edge function on the `/*` path pattern.
2. THE Edge_Function_Config SHALL specify the edge function file path as `netlify/edge-functions/ai-crawler.ts`.

### Requirement 8: Extensible Content Architecture

**User Story:** As a site owner, I want the text generation architecture to be easily extensible, so that blog posts and additional content types can be added in a future iteration.

#### Acceptance Criteria

1. THE Text_Generator SHALL organize content generation logic so that adding a new content type (e.g., blog posts) requires adding a single new generator function without modifying existing generator functions.
2. THE Text_Generator SHALL use a consistent pattern for querying Contentful_CMS, formatting content, and writing Text_Files across all content types.

### Requirement 9: Analytics Tracking Placeholder with Detection Context

**User Story:** As a site owner, I want a clear integration point for analytics tracking in the edge function that includes which detection signal triggered, so that Umami event tracking can distinguish between UA-matched and header-absent crawler hits in a future iteration.

#### Acceptance Criteria

1. THE Crawler_Detector SHALL include a clearly marked placeholder comment at the point where analytics tracking (Umami event) would be invoked upon detecting an AI crawler hit.
2. THE placeholder SHALL indicate that the Detection_Result `triggeredBy` value (`ua`, `accept-language`, or `both`) is available to be passed as part of the analytics event payload.
