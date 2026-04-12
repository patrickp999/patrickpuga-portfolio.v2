import React from "react";
import type { GatsbySSR } from "gatsby";

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHeadComponents }) => {
  setHeadComponents([
    <script
      key="umami"
      defer
      src="https://umami-production-1099.up.railway.app/script.js"
      data-website-id="8881017b-fb72-41ad-ba87-7a7cbad7d93c"
    />,
  ]);
};
