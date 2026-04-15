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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: meta.title,
    url: meta.siteUrl,
    image: `${meta.siteUrl}/og-image.png`,
    jobTitle: "Senior Software Engineer",
    sameAs: [
      "https://github.com/patrickp999",
      "https://linkedin.com/in/patrickpuga",
    ],
  };

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description ?? meta.description} />
      <link rel="canonical" href={url} />
      <meta name="theme-color" content="#0F172A" />
      <meta name="robots" content="index, follow" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description ?? meta.description} />
      <meta property="og:image" content={`${meta.siteUrl}/og-image.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description ?? meta.description} />
      <meta name="twitter:image" content={`${meta.siteUrl}/og-image.png`} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  );
};
