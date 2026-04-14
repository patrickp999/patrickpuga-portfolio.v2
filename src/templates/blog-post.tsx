import * as React from "react";
import type { PageProps } from "gatsby";
import { graphql, Link } from "gatsby";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Layout } from "../components";
import { Seo } from "../components/seo";
import LikeButton from "../components/LikeButton";
import "../styles/blog/blog-post.css";

const BlogPostTemplate: React.FC<PageProps<Queries.BlogPostBySlugQuery>> = ({
  data,
}) => {
  const post = data.contentfulBlogPost;
  const likePrompts = data.allContentfulLikePrompts?.nodes?.[0]?.prompts
    ?.filter((t): t is string => Boolean(t)) ?? [];
  const title = post?.title ?? "";
  const slug = post?.slug ?? "";
  const date = post?.date ?? "";
  const bodyRaw = post?.body?.raw;

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
        {bodyContent ? (
          <div className="blog-post-body">{bodyContent}</div>
        ) : (
          <p className="blog-post-empty">This post has no content yet.</p>
        )}
        {slug && <LikeButton slug={slug} prompts={likePrompts} />}
      </article>
    </Layout>
  );
};

export default BlogPostTemplate;

export const Head: React.FC<PageProps<Queries.BlogPostBySlugQuery>> = ({
  data,
}) => (
  <Seo
    title={data.contentfulBlogPost?.title ?? "Blog Post"}
    pathname={`/blog/${data.contentfulBlogPost?.slug ?? ""}`}
  />
);

export const query = graphql`
  query BlogPostBySlug($slug: String!) {
    contentfulBlogPost(slug: { eq: $slug }) {
      title
      slug
      date
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
