import * as React from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";

import { useFadeIn } from "../utils/useFadeIn";

type ExperienceCardProps = {
  company: string;
  title: string;
  dateRange: string;
  description: string | null;
  companyUrl?: string | null;
  index: number;
};

const getInitials = (company: string): string =>
  company
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  company,
  title,
  dateRange,
  description,
  companyUrl,
  index,
}) => {
  const ref = useFadeIn<HTMLDivElement>({ delay: index * 100 });
  const initials = getInitials(company);

  let descriptionContent: Document | null = null;
  if (description) {
    try {
      descriptionContent = JSON.parse(description) as Document;
    } catch {
      descriptionContent = null;
    }
  }

  return (
    <div className="exp-card fade-in" ref={ref}>
      <div className="exp-card-header">
        <div className="exp-card-initials" aria-hidden="true">
          {initials}
        </div>
        <div className="exp-card-meta">
          <h3 className="exp-card-title">
            {title}
            {company && (
              <span className="exp-card-company">
                &nbsp;@&nbsp;
                {companyUrl ? (
                  <a
                    href={companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company}
                  </a>
                ) : (
                  <span>{company}</span>
                )}
              </span>
            )}
          </h3>
          <p className="exp-card-date">{dateRange}</p>
        </div>
      </div>
      {descriptionContent && (
        <div className="exp-card-description">
          {documentToReactComponents(descriptionContent)}
        </div>
      )}
    </div>
  );
};

export default ExperienceCard;
