import * as React from "react";

import ExperienceCard from "./ExperienceCard";
import { useFadeIn } from "../utils/useFadeIn";

import "../styles/components/experience.css";

type WorkHistoryNode =
  Queries.IndexPageQuery["allContentfulExperienceRole"]["nodes"][number];

type ExperienceProps = {
  data?: WorkHistoryNode[] | null;
};

const Experience: React.FC<ExperienceProps> = ({ data }) => {
  const jobs = Array.isArray(data) ? data : [];
  const headingRef = useFadeIn<HTMLHeadingElement>();

  if (jobs.length === 0) {
    return (
      <section
        id="experience"
        className="experience-section"
        aria-labelledby="experience-heading"
      >
        <h2
          id="experience-heading"
          className="experience-heading fade-in"
          ref={headingRef}
        >
          Experience
        </h2>
        <p className="experience-empty">No experience data available</p>
      </section>
    );
  }

  return (
    <section
      id="experience"
      className="experience-section"
      aria-labelledby="experience-heading"
    >
      <h2
        id="experience-heading"
        className="experience-heading fade-in"
        ref={headingRef}
      >
        Experience
      </h2>

      {jobs.map((job, index) => {
        const company = job.company?.trim() || "";
        const title = job.title?.trim() || "";
        const dateRange = job.dateRange?.trim() || "";

        return (
          <ExperienceCard
            key={`${company}-${title}-${index}`}
            company={company}
            title={title}
            dateRange={dateRange}
            blurb={job.blurb?.blurb ?? null}
            technologies={[...(job.technologies?.filter(Boolean) ?? [])] as string[]}
            tags={[...(job.tags?.filter(Boolean) ?? [])] as string[]}
            logo={job.logo?.gatsbyImageData ?? null}
            companyUrl={job.companyUrl ?? null}
            companyUrlText={job.companyUrlText ?? null}
            index={index}
          />
        );
      })}
    </section>
  );
};

export default Experience;
