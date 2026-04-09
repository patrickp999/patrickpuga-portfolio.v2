import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Patrick Puga`,
    siteUrl: `https://www.yourdomain.tld`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    {
      resolve: "gatsby-source-contentful",
      options: {
        spaceId: process.env.CONTENTFUL_SPACE_ID!,
        accessToken:
          process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN ??
          process.env.CONTENTFUL_ACCESS_TOKEN!,
        host: process.env.CONTENTFUL_HOST || "cdn.contentful.com",
        environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Patrick Puga | Software Engineer`,
        short_name: `Patrick Puga`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#000000`,
        display: `standalone`,
        icon: `src/images/favicon.svg`, // Path to your favicon file
      },
    },
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
  ],
};

export default config;
