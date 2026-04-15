// Semantic HTML audit:
// - Added aria-labelledby with sr-only heading for section landmark
import * as React from "react";
import SocialLinks from "./SocialLinks";
import "../styles/components/contact.css";

const Contact: React.FC = () => (
  <section className="contact-section" id="contact" aria-labelledby="contact-heading">
    <h2 id="contact-heading" className="sr-only">Contact</h2>
    <SocialLinks />
  </section>
);

export default Contact;
