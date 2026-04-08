import * as React from "react";
import "../styles/theme.css";
import "../styles/global.css";
import "../styles/components/layout.css";
import Nav from "./Nav";
import Footer from "./Footer";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div id="root">
      <div className="site-container">
        <Nav />

        <main id="content" className="main">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
