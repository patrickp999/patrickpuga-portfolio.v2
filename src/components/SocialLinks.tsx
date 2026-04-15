// Semantic HTML audit:
// - Changed <div> wrapper to <nav> with aria-label for social navigation
import * as React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

type Props = {
  className?: string;
};

const SocialLinks: React.FC<Props> = ({ className }) => (
  <nav className={`contact-links${className ? ` ${className}` : ""}`} aria-label="Social links">
    <a
      href="https://github.com/patrickp999"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="contact-icon-link"
    >
      <FaGithub />
    </a>
    <a
      href="https://linkedin.com/in/patrickpuga"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
      className="contact-icon-link"
    >
      <FaLinkedin />
    </a>
  </nav>
);

export default SocialLinks;
