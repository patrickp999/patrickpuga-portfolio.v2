// Semantic HTML audit:
// - Wrapped menu links in <ul>/<li> inside <nav>
import * as React from "react";
import { Link } from "gatsby";
import "../styles/components/menu.css";

type LinkItem = { readonly url: string; readonly name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  links: ReadonlyArray<LinkItem>;
};

export const Menu: React.FC<Props> = ({ open, onClose, links }) => {
  React.useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  // Separate anchor links from route links (Blog goes last with emphasis)
  const anchorLinks = links.filter((l) => l.url.startsWith("#"));
  const routeLinks = links.filter((l) => !l.url.startsWith("#"));

  return (
    <>
      <div
        className={`menu-overlay ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`menu-drawer ${open ? "open" : ""}`}
        aria-hidden={!open}
        aria-label="Mobile menu"
      >
        <nav className="menu-body" aria-label="Mobile navigation">
          <ul className="menu-list">
            <li>
              <a
                href="/"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                  onClose();
                }}
                className="menu-link"
              >
                Home
              </a>
            </li>
            {anchorLinks.map(({ url, name }) => (
              <li key={name}>
                <a
                  href={`/${url}`}
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      const id = url.slice(1);
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                    }
                    onClose();
                  }}
                  className="menu-link"
                >
                  {name}
                </a>
              </li>
            ))}
            {routeLinks.map(({ url, name }) => (
              <li key={name}>
                <Link
                  to={url}
                  onClick={onClose}
                  className="menu-link menu-link--emphasis"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
