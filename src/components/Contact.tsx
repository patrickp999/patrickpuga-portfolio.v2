import * as React from "react";
import SocialLinks from "./SocialLinks";
import "../styles/components/contact.css";

const Contact: React.FC = () => (
  <section className="contact-section" id="contact">
    <SocialLinks className="contact-links--desktop" />
  </section>
);

export default Contact;
