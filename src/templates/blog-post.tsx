// Semantic HTML audit:
// - Changed blog-post-actions wrapper from <div> to <footer> (article footer)
import * as React from "react";
import type { PageProps } from "gatsby";
import { graphql, Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Layout } from "../components";
import { Seo } from "../components/seo";
import LikeButton from "../components/LikeButton";
import ShareBar from "../components/ShareBar";
import "../styles/blog/blog-post.css";

const BlogPostTemplate: React.FC<PageProps<Queries.BlogPostBySlugQuery>> = ({
  data,
}) => {
  const post = data?.contentfulBlogPost;
  if (!post) {
    return (
      <Layout>
        <article className="blog-post">
          <Link to="/blog" className="blog-post-back">
            ← Back to blog
          </Link>
          <p className="blog-post-empty">Post not found.</p>
        </article>
      </Layout>
    );
  }

  const likePrompts = data?.allContentfulLikePrompts?.nodes?.[0]?.prompts
    ?.filter((t): t is string => Boolean(t)) ?? [];
  const title = post.title ?? "";
  const slug = post.slug ?? "";
  const date = post.date ?? "";
  const bodyRaw = post.body?.raw;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  let bodyContent: React.ReactNode = null;
  if (bodyRaw) {
    try {
      bodyContent = documentToReactComponents(JSON.parse(bodyRaw));
    } catch {
      bodyContent = null;
    }
  }

  const heroImage = post.heroImage?.gatsbyImageData
    ? getImage(post.heroImage.gatsbyImageData)
    : null;
  const heroImageAlt = post.heroImage?.title ?? title;

  return (
    <Layout>
      <article className="blog-post">
        <Link to="/blog" className="blog-post-back">
          ← Back to blog
        </Link>
        <h1 className="blog-post-title">{title}</h1>
        {formattedDate && (
          <time className="blog-post-date" dateTime={date}>
            {formattedDate}
          </time>
        )}
        {heroImage && (
          <GatsbyImage
            image={heroImage}
            alt={heroImageAlt}
            className="blog-post-hero"
          />
        )}
        {bodyContent ? (
          <div className="blog-post-body">{bodyContent}</div>
        ) : (
          <p className="blog-post-empty">This post has no content yet.</p>
        )}
        {slug && (
          <footer className="blog-post-actions">
            <LikeButton slug={slug} prompts={likePrompts} />
            <ShareBar postTitle={title} />
          </footer>
        )}
      </article>
    </Layout>
  );
};

export default BlogPostTemplate;

export const Head: React.FC<PageProps<Queries.BlogPostBySlugQuery>> = ({
  data,
}) => {
  const post = data?.contentfulBlogPost;
  if (!post) return <Seo title="Blog Post" />;

  const title = post.title ?? "Blog Post";
  const slug = post.slug ?? "";
  const date = post.date ?? "";
  const excerpt = post.excerpt ?? "";
  const bodyRaw = post.body?.raw;

  // Build OG description: prefer excerpt, fall back to plain-text body extract
  let ogDescription = excerpt;
  if (!ogDescription && bodyRaw) {
    try {
      const doc = JSON.parse(bodyRaw);
      const walk = (node: Record<string, unknown>): string[] => {
        if (node.nodeType === "text" && typeof node.value === "string")
          return [node.value];
        if (Array.isArray(node.content)) return node.content.flatMap(walk);
        return [];
      };
      ogDescription = walk(doc).join(" ").trim().slice(0, 155);
    } catch {
      ogDescription = "";
    }
  }

  // Build absolute OG image URL — prefer heroImage, fall back to site default
  // TODO: add og-default.png to static/ folder as a dedicated blog fallback image
  const heroUrl = post.heroImage?.file?.url ?? null;
  let ogImage = "https://www.patrickpuga.com/og-image.png";
  if (heroUrl) {
    ogImage = heroUrl.startsWith("//") ? `https:${heroUrl}` : heroUrl;
  }

  const pageUrl = `https://www.patrickpuga.com/blog/${slug}`;

  return (
    <>
      <Seo title={title} description={ogDescription} pathname={`/blog/${slug}`} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Patrick Puga" />
      {date && <meta property="article:published_time" content={date} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
};

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
    contentfulBlogPost(slug: { eq: $slug }) {
      title
      slug
      date
      excerpt
      heroImage {
        gatsbyImageData(
          layout: FULL_WIDTH
          placeholder: BLURRED
          formats: [AUTO, WEBP, AVIF]
        )
        file {
          url
        }
        title
      }
      body {
        raw
      }
    }
    allContentfulLikePrompts(limit: 1) {
      nodes {
        prompts
      }
    }
  }
`;
