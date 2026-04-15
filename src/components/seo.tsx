// src/components/Seo.tsx
import * as React from "react";
import { useStaticQuery, graphql } from "gatsby";

type Props = {
  title?: string;
  description?: string;
  pathname?: string;
  image?: string;
  type?: "website" | "article";
  children?: React.ReactNode;
};

export const Seo: React.FC<Props> = ({
  title,
  description,
  pathname,
  image,
  type = "website",
  children,
}) => {
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
  const desc = description ?? meta.description;
  const url = pathname ? `${meta.siteUrl}${pathname}` : meta.siteUrl;
  const ogImage = image ?? `${meta.siteUrl}/og-image.png`;

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
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta name="theme-color" content="#0F172A" />
      <meta name="robots" content="index, follow" />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={meta.title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      {children}
    </>
  );
};
