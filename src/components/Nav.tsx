import * as React from "react";
import { Link } from "gatsby";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import "../styles/components/nav.css";
import "./Menu";
import { Menu } from "./Menu";
import {
  DEFAULT_LINKS,
  DELTA,
  FADE_DURATION,
  HAMBURGER_DELAY_MS,
  LINK_STAGGER_MS,
  NAV_HEIGHT,
  RESUME_HREF,
} from "../utils/constants";
import { useScrollDirection } from "../utils/useScrollDirection";

export const Nav: React.FC = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // ⬇️ NEW: scroll direction from the hook
  const { scrollDirection } = useScrollDirection({
    delta: DELTA,
    navHeight: NAV_HEIGHT,
    disabled: menuOpen, // don’t change header while menu is open
    mobileCutoff: 640, // (optional) align with your phone breakpoint
  });

  const headerClasses = [
    "nav-header",
    scrollDirection !== "none" ? "is-scrolled" : "",
    scrollDirection === "down" ? "hide" : "",
    scrollDirection === "up" ? "shadow" : "",
  ].join(" ");

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  // Body blur toggling (replaces Helmet)
  React.useEffect(() => {
    if (menuOpen) document.body.classList.add("blur");
    else document.body.classList.remove("blur");
    return () => document.body.classList.remove("blur");
  }, [menuOpen]);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50); // small delay to avoid FOUC
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (menuOpen && (e.key === "Escape" || e.key === "Esc"))
        setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 640 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <>
      <header className={headerClasses} role="banner">
        <div className="nav-wrap">
          <div className="nav-bar" aria-label="Primary">
            {/* Desktop links */}
            <div className="nav-right">
              <nav className="nav-links" aria-label="Section links">
                <ol className="nav-list">
                  <TransitionGroup component={null}>
                    {mounted &&
                      [
                        // 1) normal links first…
                        ...DEFAULT_LINKS.map(({ url, name }) => ({
                          kind: "link" as const,
                          url,
                          name,
                        })),
                        // 2) then a synthetic "resume" item so it animates last
                        { kind: "resume" as const, name: "Resume" },
                      ].map((item, i) => (
                        <CSSTransition
                          key={item.kind === "link" ? item.name : "resume"}
                          classNames="fadelink"
                          timeout={{
                            appear: FADE_DURATION.appear,
                            enter: FADE_DURATION.enter,
                            exit: FADE_DURATION.exit,
                          }}
                          appear
                        >
                          <li
                            className="nav-item"
                            style={{
                              transitionDelay: `${i * LINK_STAGGER_MS}ms`,
                            }} // resume gets the last delay
                          >
                            {item.kind === "link" ? (
                              item.url.startsWith("#") ? (
                                <a
                                  className="nav-link"
                                  href={item.url}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const isMobile = window.innerWidth <= 640;
                                    const id = item.url === "#contact" && isMobile
                                      ? "contact-hero"
                                      : item.url.slice(1);
                                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                >
                                  {item.name}
                                </a>
                              ) : (
                                <Link className="nav-link" to={item.url}>
                                  {item.name}
                                </Link>
                              )
                            ) : (
                              <a
                                className="resume-link"
                                href={RESUME_HREF}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                // (no extra delay here — it already uses i * 300ms)
                              >
                                Resume
                              </a>
                            )}
                          </li>
                        </CSSTransition>
                      ))}
                  </TransitionGroup>
                </ol>
              </nav>

              {/* Hamburger (mobile) */}
              <TransitionGroup component={null}>
                {mounted && (
                  <CSSTransition
                    key="hamburger"
                    classNames="fadelink"
                    timeout={2000}
                    appear
                  >
                    <button
                      className="hamburger"
                      style={{
                        transitionDelay: `${HAMBURGER_DELAY_MS}ms`,
                      }}
                      aria-label="Toggle menu"
                      aria-expanded={menuOpen}
                      onClick={handleMenuToggle}
                    >
                      <span className="hamburger-box">
                        <span className="hamburger-inner" />
                      </span>
                    </button>
                  </CSSTransition>
                )}
              </TransitionGroup>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <Menu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={DEFAULT_LINKS}
        resumeHref={RESUME_HREF}
      />
    </>
  );
};

export default Nav;
