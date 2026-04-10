// src/pages/index.tsx
import * as React from "react";
import type { PageProps } from "gatsby";
import { graphql } from "gatsby";
import { Contact, Hero, Layout, Experience, Projects } from "../components";
import { Seo } from "../components/seo";

const IndexPage: React.FC<PageProps<Queries.IndexPageQuery>> = ({ data }) => {
  const heroNode = data.hero.nodes[0];
  const workHistoryNodes = data.allContentfulExperienceRole.nodes;
  const projectNodes = data.allContentfulProject.nodes;

  return (
    <Layout>
      <Hero
        data={
          heroNode
            ? {
                name: heroNode.name ?? "",
                subtitle: heroNode.subtitle ?? "",
                avatar: heroNode.avatar?.gatsbyImageData,
                intro: heroNode.intro?.raw,
              }
            : undefined
        }
      />

      <Experience data={[...workHistoryNodes]} />

      <Projects data={[...projectNodes]} />

      <Contact />
    </Layout>
  );
};

export default IndexPage;

export const Head = () => <Seo title="Software Engineer" />;

export const pageQuery = graphql`
  query IndexPage {
    hero: allContentfulPortfolioHero(limit: 1) {
      nodes {
        name
        subtitle
        intro {
          raw
        }
        avatar {
          gatsbyImageData(
            layout: CONSTRAINED
            width: 640
            placeholder: BLURRED
            formats: [AUTO, WEBP, AVIF]
          )
        }
      }
    }

    allContentfulExperienceRole(sort: { order: ASC }) {
      nodes {
        order
        company
        title
        dateRange
        blurb {
          blurb
        }
        technologies
        tags
        companyUrl
        companyUrlText
        logo {
          gatsbyImageData(
            layout: CONSTRAINED
            width: 48
            height: 48
            placeholder: BLURRED
            formats: [AUTO, WEBP, AVIF]
          )
        }
      }
    }

    allContentfulProject(sort: { order: ASC }) {
      nodes {
        name
        description {
          description
        }
        tags
        githubUrl
        liveUrl
        order
        thumbnail {
          gatsbyImageData(
            layout: CONSTRAINED
            width: 600
            placeholder: BLURRED
            formats: [AUTO, WEBP, AVIF]
          )
        }
      }
    }
  }
`;
