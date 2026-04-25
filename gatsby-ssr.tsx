import React from "react";
import type { GatsbySSR } from "gatsby";

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHeadComponents }) => {
  setHeadComponents([
    <link key="jetbrains-mono-preconnect" rel="preconnect" href="https://fonts.googleapis.com" />,
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
      src="https://cloud.umami.is/script.js"
      data-website-id="f8f0e764-41bf-4f08-8e24-b0af368e13eb"
    />,
  ]);
};
