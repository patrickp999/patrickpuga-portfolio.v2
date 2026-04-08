import * as React from "react";
import type { PageProps } from "gatsby";
import { graphql } from "gatsby";
import { Layout } from "../components";
import { Seo } from "../components/seo";
import { BlogCard } from "../blog";
import "../styles/blog/blog-index.css";

const BlogPage: React.FC<PageProps<Queries.BlogIndexQuery>> = ({ data }) => {
  const posts = data.allContentfulBlogPost?.nodes ?? [];

  return (
    <Layout>
      <section className="blog-index">
        <h1 className="blog-index-heading">Blog</h1>

        {posts.length === 0 ? (
          <p className="blog-index-empty">No posts yet.</p>
        ) : (
          <div className="blog-card-list">
            {posts.map((post) => (
              <BlogCard
                key={post.slug}
                title={post.title ?? ""}
                date={post.date ?? ""}
                excerpt={post.excerpt ?? ""}
                slug={post.slug ?? ""}
                tags={post.tags as string[] ?? []}
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default BlogPage;

export const Head = () => <Seo title="Blog" pathname="/blog" />;

export const query = graphql`
  query BlogIndex {
    allContentfulBlogPost(sort: { date: DESC }) {
      nodes {
        title
        date
        excerpt
        slug
        tags
      }
    }
  }
`;
