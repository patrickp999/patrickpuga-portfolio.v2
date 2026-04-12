# Implementation Plan: AI Crawler GEO

## Overview

Implement Generative Engine Optimization by adding build-time plain-text generation (Gatsby `onPostBuild`) and edge-level AI crawler detection with request rewriting (Netlify Edge Function). The implementation proceeds bottom-up: utility functions first, then content generators, then the edge function, then wiring and configuration.

## Tasks

- [x] 1. Install dependencies and set up test infrastructure
  - Run `yarn add --dev fast-check` to install the PBT library
  - Create test directory `src/__tests__/` for build-time utility tests
  - Create test directory `netlify/__tests__/` for edge function tests
  - _Requirements: Design § Dev Dependencies_

- [x] 2. Implement rich text extraction utility and content generators
  - [x] 2.0 Define shared types at the top of `gatsby-node.ts`
    - Define `ContentGenerator` interface (`name: string`, `generate` function signature)
    - Define `PortfolioHeroData` type with `name`, `subtitle`, `intro` fields matching Contentful schema
    - Define `ExperienceRoleData` type with `company`, `title`, `dateRange`, `blurb`, `technologies`, `tags`, `companyUrl` fields
    - Define `ProjectData` type with `name`, `description`, `tags`, `githubUrl`, `liveUrl` fields
    - All types defined explicitly at the top of the file, not inferred or scattered
    - _Requirements: 8.2_

  - [x] 2.1 Implement `extractPlainText` function in `gatsby-node.ts`
    - Recursive function that walks Contentful rich text JSON and extracts all leaf text node values
    - Handle null/undefined `raw` input by returning empty string
    - _Requirements: 1.2_

  - [ ]* 2.2 Write property test for `extractPlainText`
    - **Property 1: Rich text extraction preserves all text content**
    - Generate random Contentful rich text JSON trees with varying depth, node types, and text content
    - Verify output contains every leaf text node value
    - **Validates: Requirements 1.2**

  - [x] 2.3 Implement `generateIndexContent` function in `gatsby-node.ts`
    - Accept PortfolioHero data (name, subtitle, intro text) and return formatted plain text
    - Structure: top-level heading with name, subtitle line, "About" section with intro text
    - _Requirements: 1.3, 1.4_

  - [ ]* 2.4 Write property test for `generateIndexContent`
    - **Property 2: Index content formatter includes all required structural elements**
    - Generate random `{ name, subtitle, introText }` objects with arbitrary strings
    - Verify output contains name as heading, subtitle, "About" label, and intro text
    - **Validates: Requirements 1.4**

  - [x] 2.5 Implement `generateExperienceContent` function in `gatsby-node.ts`
    - Accept sorted ExperienceRole array and return formatted plain text
    - Include title, company, dateRange, blurb, technologies list, tags list per entry
    - Conditionally include companyUrl only when non-null
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 2.6 Write property test for `generateExperienceContent`
    - **Property 3: Experience content formatter includes all required fields with conditional URL**
    - Generate random arrays of experience role objects with optional companyUrl
    - Verify all fields present and companyUrl appears if and only if non-null
    - **Validates: Requirements 2.3, 2.4**

  - [x] 2.7 Implement `generateProjectsContent` function in `gatsby-node.ts`
    - Accept sorted Project array and return formatted plain text
    - Include name, description, tags list, githubUrl per entry
    - Conditionally include liveUrl only when non-null
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ]* 2.8 Write property test for `generateProjectsContent`
    - **Property 4: Project content formatter includes all required fields with conditional URL**
    - Generate random arrays of project objects with optional liveUrl
    - Verify all fields present and liveUrl appears if and only if non-null
    - **Validates: Requirements 3.3, 3.4**

- [x] 3. Implement `onPostBuild` orchestrator in `gatsby-node.ts`
  - [x] 3.1 Add `onPostBuild` export to `gatsby-node.ts`
    - Before writing any GraphQL queries, read the existing queries in the codebase (e.g., `src/pages/index.tsx`) to identify the correct Contentful field names for PortfolioHero, ExperienceRole, and Project content types — do not guess field names
    - Create `/public/ai-content/` directory with `fs.mkdirSync(path, { recursive: true })`
    - Define `ContentGenerator` array with index, experience, and projects generators
    - Run each generator: query GraphQL, format content, write `.txt` file
    - Skip generation and log warning when data is missing (null hero, empty arrays)
    - Catch errors per generator so one failure doesn't block others
    - _Requirements: 1.1, 1.5, 2.1, 2.5, 3.1, 3.5, 4.1, 4.2, 8.1, 8.2_

  - [ ]* 3.2 Write unit tests for `onPostBuild` orchestrator
    - Test with mocked GraphQL returning realistic Contentful data → verify all `.txt` files written
    - Test missing data scenarios: null hero, empty experience, empty projects → verify warnings logged and files skipped
    - Test directory creation (already exists vs. new)
    - _Requirements: 1.5, 2.5, 3.5, 4.1, 4.2_

- [x] 4. Checkpoint — Verify build-time generation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement edge function utilities
  - [x] 5.1 Implement `isStaticAsset` function in `netlify/edge-functions/ai-crawler.ts`
    - Check if pathname ends with any known static extension (`.js`, `.css`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`, `.woff`, `.woff2`, `.ttf`, `.eot`, `.map`, `.webp`, `.avif`, `.json`, `.xml`, `.webmanifest`)
    - _Requirements: Performance optimization for Requirement 6_

  - [ ]* 5.2 Write property test for `isStaticAsset`
    - **Property 7: Static asset early-exit correctly identifies static files**
    - Generate random pathnames with and without known static extensions
    - Verify returns `true` for known extensions, `false` otherwise
    - **Validates: Performance optimization for Requirement 6**

  - [x] 5.3 Implement `detectAICrawler` function in `netlify/edge-functions/ai-crawler.ts`
    - Define `AI_CRAWLER_UAS` array with all 15 known identifiers
    - Case-insensitive substring match on User-Agent
    - Check Accept-Language header absence (null)
    - Return `DetectionResult` with correct `triggeredBy` value (`ua`, `accept-language`, `both`, or `null`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 5.4 Write property test for `detectAICrawler`
    - **Property 5: Dual-signal detection correctly classifies and reports triggeredBy**
    - Generate random `(userAgent, acceptLanguage)` pairs covering all four signal combinations
    - Verify correct `isCrawler` and `triggeredBy` values for each combination
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.6, 5.7**

  - [x] 5.5 Implement `mapPathToTextFile` function in `netlify/edge-functions/ai-crawler.ts`
    - Map `/` to `/ai-content/index.txt`
    - Map `/foo` to `/ai-content/foo.txt` (strip leading/trailing slashes)
    - _Requirements: 6.1, 6.2_

  - [ ]* 5.6 Write property test for `mapPathToTextFile`
    - **Property 6: Path mapping produces correct text file paths**
    - Generate random URL path strings
    - Verify root maps to `/ai-content/index.txt` and others follow `/ai-content/{segment}.txt` pattern
    - **Validates: Requirements 6.1, 6.2**

- [x] 6. Implement edge function handler and Netlify config
  - [x] 6.1 Implement the default handler function in `netlify/edge-functions/ai-crawler.ts`
    - Static asset early-exit at top of handler (return `undefined`)
    - Run `detectAICrawler` with request headers
    - If not crawler → return `undefined` (passthrough)
    - Map path to `.txt` file URL using `mapPathToTextFile`
    - Fetch `.txt` file internally using `new URL()` + `fetch()`
    - If fetch non-200 → return `undefined` (passthrough)
    - Return `new Response()` with body, `Content-Type: text/plain; charset=utf-8`, and `X-Served-For: ai-crawler` headers
    - Include `TODO` analytics placeholder comment with `triggeredBy` available
    - Export `config` with `path: "/*"`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 9.1, 9.2_

  - [x] 6.2 Update `netlify.toml` at project root
    - Append the edge function block to the existing file (do not overwrite existing configuration)
    - Register edge function: `function = "ai-crawler"`, `path = "/*"`
    - _Requirements: 7.1, 7.2_

  - [ ]* 6.3 Write integration tests for edge function handler
    - Test AI crawler UA → verify rewrite with correct headers (`Content-Type`, `X-Served-For`)
    - Test normal browser request → verify passthrough (undefined)
    - Test static asset request → verify early-exit passthrough
    - Test missing `.txt` file (non-200 fetch) → verify fallback passthrough
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [x] 7. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The project uses yarn — all package installs use `yarn add`
- TypeScript is used throughout: `gatsby-node.ts` for build-time, `.ts` for edge functions
- Property tests use `fast-check` with minimum 100 iterations per property
- All 7 correctness properties from the design are covered by property test sub-tasks
- Checkpoints ensure incremental validation after build-time and edge function phases
