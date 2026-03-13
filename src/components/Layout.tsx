import * as React from "react";
import "../styles/theme.css";
import "../styles/global.css";
import "../styles/components/layout.css";
import Nav from "./Nav";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div id="root">
      <div className="site-container">
        <Nav />

        <main id="content" className="main">
          {children}
        </main>

        <footer className="footer">
          <small>© {new Date().getFullYear()} Patrick Puga</small>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
