import React from "react";
import type { GatsbySSR } from "gatsby";

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHeadComponents }) => {
  setHeadComponents([
    <link
      key="jetbrains-mono-preconnect"
      rel="preconnect"
      href="https://fonts.googleapis.com"
    />,
    <link
      key="jetbrains-mono-preconnect-gstatic"
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link
      key="jetbrains-mono"
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600&display=swap"
    />,
    <script
      key="umami"
      defer
      src="https://umami-production-1099.up.railway.app/script.js"
      data-website-id="8881017b-fb72-41ad-ba87-7a7cbad7d93c"
    />,
  ]);
};
