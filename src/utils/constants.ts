/* ---------------- Navigation ---------------- */

import { HeroContent } from "../components/Hero";

export const NAV_HEIGHT = 72;
export const DELTA = 5;
export const MOBILE_CUTOFF = 640; // phone-only cutoff for scroll/hamburger behavior

export const DEFAULT_LINKS = [
  { url: "#about", name: "About" },
  { url: "#work", name: "Work" },
  { url: "#contact", name: "Contact" },
] as const;

export const RESUME_HREF = "/Resume.pdf";

/* --------------- Animation timing --------------- */

export const FADE_DURATION = {
  appear: 1200,
  enter: 1200,
  exit: 300,
} as const;

export const MOBILE_FADE_DURATION = {
  appear: 1600,
  enter: 1600,
  exit: 300,
} as const;

/** Stagger per nav item (ms) — keep this in sync with your nav CSS/JS */
export const LINK_STAGGER_MS = 300;
export const HAMBURGER_DELAY_MS = LINK_STAGGER_MS;

/** Extra cushion after the last nav item before starting hero */
export const EXTRA_BUFFER_MS = 300;

/** Number of animated nav items = links + Resume */
export const navItemCount = (linksLen = DEFAULT_LINKS.length) => linksLen + 1;

/** Total stagger time for all nav items (ms) */
export const navTotalDelay = (
  linksLen = DEFAULT_LINKS.length,
  stagger = LINK_STAGGER_MS,
) => navItemCount(linksLen) * stagger;

/**
 * Compute when hero should start (ms).
 * If on mobile (<= MOBILE_CUTOFF), start immediately (0).
 */
export const computeHeroBaseDelay = (
  viewportWidth: number | undefined,
  linksLen = DEFAULT_LINKS.length,
  stagger = LINK_STAGGER_MS,
  buffer = EXTRA_BUFFER_MS,
  cutoff = MOBILE_CUTOFF,
) => {
  const isMobile = typeof viewportWidth === "number" && viewportWidth <= cutoff;
  return isMobile ? 0 : navTotalDelay(linksLen, stagger) + buffer;
};

export const getFadeDuration = (viewportWidth?: number) => {
  const isMobile =
    typeof viewportWidth === "number" && viewportWidth <= MOBILE_CUTOFF;

  return isMobile ? MOBILE_FADE_DURATION : FADE_DURATION;
};

/* ---------------- Hero fallback content ---------------- */

export const HERO_FALLBACK: HeroContent = {
  name: "Patrick Puga",
  subtitle: "Sr. Software Engineer",
  blurb:
    "I'm a skilled software engineer based in Denver, Colorado. I have a passion for technology and expertise building exceptional, secure, and highly scalable websites and applications.",
};
