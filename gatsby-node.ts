import type { GatsbyNode, CreatePagesArgs } from "gatsby";
import path from "path";
import fs from "fs";

// --- Shared types for AI content generation ---

type GatsbyGraphQL = CreatePagesArgs["graphql"];

interface ContentGenerator {
  name: string;
  generate: (graphql: GatsbyGraphQL) => Promise<string | null>;
}

interface PortfolioHeroData {
  name: string;
  subtitle: string;
  intro: {
    raw: string;
  } | null;
}

interface ExperienceRoleData {
  company: string;
  title: string;
  dateRange: string;
  blurb: {
    blurb: string;
  };
  technologies: string[];
  tags: string[];
  companyUrl: string | null;
}

interface ProjectData {
  name: string;
  description: {
    description: string;
  };
  tags: string[];
  githubUrl: string;
  liveUrl: string | null;
}

// --- End shared types ---

// --- Utility functions ---

export function extractPlainText(raw: string | null | undefined): string {
  if (!raw) return "";

  const doc = JSON.parse(raw);

   
  function walk(node: Record<string, unknown>): string[] {
    if (node.nodeType === "text" && typeof node.value === "string") {
      return [node.value];
    }
    if (Array.isArray(node.content)) {
      return node.content.flatMap(walk);
    }
    return [];
  }

  return walk(doc).join(" ").trim();
}

export function generateIndexContent(hero: PortfolioHeroData): string {
  const introText = extractPlainText(hero.intro?.raw);
  return `# ${hero.name}\n${hero.subtitle}\n\n## About\n${introText}`;
}

export function generateExperienceContent(roles: ExperienceRoleData[]): string {
  const sections = roles.map((role) => {
    const lines = [
      `## ${role.title} @ ${role.company}`,
      `Date: ${role.dateRange}`,
      role.blurb.blurb,
      `Technologies: ${role.technologies.join(", ")}`,
      `Tags: ${role.tags.join(", ")}`,
    ];
    if (role.companyUrl !== null) {
      lines.push(`URL: ${role.companyUrl}`);
    }
    return lines.join("\n");
  });

  return `# Experience\n\n${sections.join("\n\n")}`;
}

export function generateProjectsContent(projects: ProjectData[]): string {
  const sections = projects.map((project) => {
    const lines = [
      `## ${project.name}`,
      project.description.description,
      `Tags: ${project.tags.join(", ")}`,
      `GitHub: ${project.githubUrl}`,
    ];
    if (project.liveUrl !== null) {
      lines.push(`Live: ${project.liveUrl}`);
    }
    return lines.join("\n");
  });

  return `# Projects\n\n${sections.join("\n\n")}`;
}

// --- End utility functions ---

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
      type ContentfulProject implements Node {
        liveUrl: String
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

export const onPostBuild: GatsbyNode["onPostBuild"] = async ({ graphql }) => {
  const outputDir = path.join(process.cwd(), "public", "ai-content");
  fs.mkdirSync(outputDir, { recursive: true });

  const generators: ContentGenerator[] = [
    {
      name: "index",
      generate: async (gql) => {
        const result = await gql<{
          allContentfulPortfolioHero: { nodes: PortfolioHeroData[] };
        }>(`
          query AIContentIndex {
            allContentfulPortfolioHero(limit: 1) {
              nodes {
                name
                subtitle
                intro {
                  raw
                }
              }
            }
          }
        `);

        if (result.errors) {
          throw new Error(String(result.errors));
        }

        const hero = result.data?.allContentfulPortfolioHero?.nodes?.[0];
        if (!hero) {
          console.warn("[ai-content] Warning: No hero data found, skipping index.txt");
          return null;
        }

        return generateIndexContent(hero);
      },
    },
    {
      name: "experience",
      generate: async (gql) => {
        const result = await gql<{
          allContentfulExperienceRole: { nodes: ExperienceRoleData[] };
        }>(`
          query AIContentExperience {
            allContentfulExperienceRole(sort: { order: ASC }) {
              nodes {
                company
                title
                dateRange
                blurb {
                  blurb
                }
                technologies
                tags
                companyUrl
              }
            }
          }
        `);

        if (result.errors) {
          throw new Error(String(result.errors));
        }

        const roles = result.data?.allContentfulExperienceRole?.nodes;
        if (!roles || roles.length === 0) {
          console.warn("[ai-content] Warning: No experience data found, skipping experience.txt");
          return null;
        }

        return generateExperienceContent(roles);
      },
    },
    {
      name: "projects",
      generate: async (gql) => {
        const result = await gql<{
          allContentfulProject: { nodes: ProjectData[] };
        }>(`
          query AIContentProjects {
            allContentfulProject(sort: { order: ASC }) {
              nodes {
                name
                description {
                  description
                }
                tags
                githubUrl
                liveUrl
              }
            }
          }
        `);

        if (result.errors) {
          throw new Error(String(result.errors));
        }

        const projects = result.data?.allContentfulProject?.nodes;
        if (!projects || projects.length === 0) {
          console.warn("[ai-content] Warning: No projects data found, skipping projects.txt");
          return null;
        }

        return generateProjectsContent(projects);
      },
    },
  ];

  for (const generator of generators) {
    try {
      const content = await generator.generate(graphql);
      if (content !== null) {
        const filename = `${generator.name}.txt`;
        const filePath = path.join(outputDir, filename);
        console.log(`[ai-content] Writing ${filename}...`);
        fs.writeFileSync(filePath, content, "utf-8");
      }
    } catch (error) {
      console.error(`[ai-content] Error generating ${generator.name}.txt:`, error);
    }
  }
};
