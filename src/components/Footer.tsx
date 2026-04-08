import * as React from "react";
import "../styles/components/footer.css";

const Footer: React.FC = () => (
  <footer className="footer">
    <span className="footer-item">hello@patrickpuga.com</span>
    <span className="footer-separator" aria-hidden="true">·</span>
    <span className="footer-item">Denver, CO</span>
    <span className="footer-separator" aria-hidden="true">·</span>
    <a
      className="footer-item footer-resume"
      href="/Patrick_Puga_Resume.pdf"
      target="_blank"
      rel="noopener noreferrer"
    >
      Download resume ↓
    </a>
  </footer>
);

export default Footer;
