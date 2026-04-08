// src/pages/index.tsx
import * as React from "react";
import type { PageProps } from "gatsby";
import { graphql } from "gatsby";
import { Contact, Hero, Layout, Experience, Projects } from "../components";
import { Seo } from "../components/seo";

const IndexPage: React.FC<PageProps<Queries.IndexPageQuery>> = ({ data }) => {
  const heroNode = data.hero.nodes[0];
  const aboutNode = data.about.nodes[0];
  const workHistoryNodes = data.allContentfulJob.nodes;

  const skills: string[] = Array.isArray(aboutNode?.skills)
    ? Array.from(aboutNode.skills)
        .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        .map((s) => s.trim())
    : [];

  return (
    <Layout>
      <Hero
        data={
          heroNode
            ? {
                name: heroNode.name ?? "",
                subtitle: heroNode.subtitle ?? "",
                blurb: heroNode.blurb ?? "",
                avatar: aboutNode?.avatar?.gatsbyImageData,
                bio: aboutNode?.description?.raw,
                tags: skills,
              }
            : undefined
        }
      />

      <Experience data={[...workHistoryNodes]} />

      <Projects />

      <Contact />
    </Layout>
  );
};

export default IndexPage;

export const Head = () => <Seo title="Software Engineer" />;

export const pageQuery = graphql`
  query IndexPage {
    hero: allContentfulHero {
      nodes {
        greeting
        blurb
        name
        subtitle
      }
    }

    about: allContentfulAbout(limit: 1) {
      nodes {
        title
        skills
        avatar {
          gatsbyImageData(
            layout: CONSTRAINED
            width: 640
            placeholder: BLURRED
            formats: [AUTO, WEBP, AVIF]
          )
          title
          description
        }
        description {
          raw
        }
      }
    }

    allContentfulJob(sort: { order: ASC }) {
      nodes {
        date
        order
        company
        dateRange
        title
        location
        url {
          raw
        }
        description {
          raw
        }
      }
    }
  }
`;
