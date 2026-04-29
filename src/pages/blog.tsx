// Semantic HTML audit:
// - Changed blog card list from <div> to <ul> for proper list semantics
import * as React from "react";
import type { PageProps } from "gatsby";
import { graphql } from "gatsby";
import { Layout } from "../components";
import { Seo } from "../components/seo";
import { BlogCard } from "../blog";
import "../styles/blog/blog-index.css";

const BlogPage: React.FC<PageProps<Queries.BlogIndexQuery>> = ({ data }) => {
  const posts = data.allContentfulBlogPost?.nodes ?? [];
  const [likesMap, setLikesMap] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const slugList = posts.map((p) => p.slug).filter(Boolean) as string[];
    if (slugList.length === 0) return;

    const supabaseUrl = process.env.GATSBY_SUPABASE_URL;
    const anonKey = process.env.GATSBY_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) return;

    // Read like counts directly from Supabase REST API (public SELECT policy)
    const filter = slugList.map((s) => `"${s}"`).join(",");
    fetch(`${supabaseUrl}/rest/v1/post_likes?slug=in.(${filter})&select=slug,like_count`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    })
      .then((r) => r.json())
      .then((rows: { slug: string; like_count: number }[]) => {
        const map: Record<string, number> = {};
        for (const row of rows) map[row.slug] = row.like_count;
        setLikesMap(map);
      })
      .catch(() => {});
  }, []);

  return (
    <Layout>
      <section className="blog-index">
        <h1 className="blog-index-heading">Blog</h1>

        {posts.length === 0 ? (
          <p className="blog-index-empty">No posts yet.</p>
        ) : (
          <ul className="blog-card-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <BlogCard
                  title={post.title ?? ""}
                  date={post.date ?? ""}
                  excerpt={post.excerpt ?? ""}
                  slug={post.slug ?? ""}
                  tags={(post.tags as string[]) ?? []}
                  likes={likesMap[post.slug ?? ""] ?? null}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
};

export default BlogPage;

export const Head = () => (
  <Seo
    title="Blog"
    description="Articles on AI tooling, developer workflows, and the modern web by Patrick Puga."
    pathname="/blog"
  />
);

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
