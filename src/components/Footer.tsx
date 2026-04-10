import * as React from "react";
import "../styles/components/footer.css";

const Footer: React.FC = () => (
  <footer className="footer">
    <span>© {new Date().getFullYear()} patrickpuga.com</span>
    <span className="footer-separator" aria-hidden="true">·</span>
    <span>Denver, CO</span>
  </footer>
);

export default Footer;
