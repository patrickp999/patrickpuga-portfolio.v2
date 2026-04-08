import * as React from "react";

type UseFadeInOptions = {
  delay?: number;
  threshold?: number;
};

export function useFadeIn<T extends HTMLElement = HTMLElement>(
  options?: UseFadeInOptions
): React.RefObject<T> {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Apply delay as CSS custom property if provided
    if (options?.delay != null) {
      el.style.setProperty("--delay", `${options.delay}ms`);
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      el.classList.add("visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: options?.threshold ?? 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [options?.delay, options?.threshold]);

  return ref;
}
