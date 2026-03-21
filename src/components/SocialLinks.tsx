import * as React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

type Props = {
  className?: string;
};

const SocialLinks: React.FC<Props> = ({ className }) => (
  <div className={`contact-links${className ? ` ${className}` : ""}`}>
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
  </div>
);

export default SocialLinks;
