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
  const heroUrl = post.heroImage?.file?.url ?? null;
  let ogImage: string | undefined;
  if (heroUrl) {
    // Contentful URLs may start with "//" — normalize to https
    const fullUrl = heroUrl.startsWith("//") ? `https:${heroUrl}` : heroUrl;
    // Request a 1200×630 rendition optimized for social sharing
    ogImage = `${fullUrl}?w=1200&h=630&fit=fill&fm=jpg&q=80`;
  }

  return (
    <Seo
      title={title}
      description={ogDescription}
      pathname={`/blog/${slug}`}
      image={ogImage}
      type="article"
    >
      {date && <meta property="article:published_time" content={date} />}
    </Seo>
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
          layout: CONSTRAINED
          width: 1200
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
