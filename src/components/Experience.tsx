import * as React from "react";

import ExperienceCard from "./ExperienceCard";
import { useFadeIn } from "../utils/useFadeIn";

import "../styles/components/experience.css";

type WorkHistoryNode =
  Queries.IndexPageQuery["allContentfulJob"]["nodes"][number];

type ExperienceProps = {
  data?: WorkHistoryNode[] | null;
};

const getCompanyUrl = (raw?: string | null): string | null => {
  if (!raw) return null;

  try {
    const document = JSON.parse(raw) as {
      content?: Array<{
        content?: Array<{
          data?: {
            uri?: string;
          };
        }>;
      }>;
    };

    return document.content?.[0]?.content?.[1]?.data?.uri ?? null;
  } catch {
    return null;
  }
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
        const companyUrl = getCompanyUrl(job.url?.raw);

        return (
          <ExperienceCard
            key={`${company}-${title}-${index}`}
            company={company}
            title={title}
            dateRange={dateRange}
            description={job.description?.raw ?? null}
            companyUrl={companyUrl}
            index={index}
          />
        );
      })}
    </section>
  );
};

export default Experience;
