// src/components/Seo.tsx
import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";

type Props = { title?: string; description?: string; pathname?: string };

export const Seo: React.FC<Props> = ({ title, description, pathname }) => {
  const { site } = useStaticQuery(graphql`
    query SiteMeta {
      site {
        siteMetadata {
          title
          siteUrl
          description
        }
      }
    }
  `);
  const meta = site.siteMetadata;
  const fullTitle = title ? `${meta.title} | ${title}` : meta.title;
  const url = pathname ? `${meta.siteUrl}${pathname}` : meta.siteUrl;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description ?? meta.description} />
      <link rel="canonical" href={url} />
      <meta name="theme-color" content="#0F172A" />
    </>
  );
};
