// src/pages/index.tsx
import * as React from "react";
import type { PageProps } from "gatsby";
import { graphql } from "gatsby";
import { About, Contact, Hero, Layout, WorkHistory } from "../components";
import { Seo } from "../components/seo";

const IndexPage: React.FC<PageProps<Queries.IndexPageQuery>> = ({ data }) => {
  const heroNode = data.hero.nodes[0];
  const aboutNode = data.about.nodes[0];
  const workHistoryNodes = data.allContentfulJob.nodes;

  return (
    <Layout>
      <Hero
        data={
          heroNode
            ? {
                name: heroNode.name ?? "",
                subtitle: heroNode.subtitle ?? "",
                blurb: heroNode.blurb ?? "",
              }
            : undefined
        }
      />

      {aboutNode && <About data={aboutNode} />}

      <WorkHistory data={[...workHistoryNodes]} />

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
