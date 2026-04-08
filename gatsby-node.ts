import type { GatsbyNode } from "gatsby";
import path from "path";

// Explicitly define the body field so queries work even when no entries have body content
export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  ({ actions }) => {
    actions.createTypes(`
      type ContentfulBlogPost implements Node {
        body: ContentfulBlogPostBody
        tags: [String]
      }
      type ContentfulBlogPostBody {
        raw: String
      }
    `);
  };

export const createPages: GatsbyNode["createPages"] = async ({
  graphql,
  actions,
}) => {
  const { createPage } = actions;
  const result = await graphql<{
    allContentfulBlogPost: { nodes: Array<{ slug: string }> };
  }>(`
    query BlogPages {
      allContentfulBlogPost {
        nodes {
          slug
        }
      }
    }
  `);

  result.data?.allContentfulBlogPost.nodes.forEach((node) => {
    if (!node.slug) return;
    createPage({
      path: `/blog/${node.slug}`,
      component: path.resolve("src/templates/blog-post.tsx"),
      context: { slug: node.slug },
    });
  });
};
