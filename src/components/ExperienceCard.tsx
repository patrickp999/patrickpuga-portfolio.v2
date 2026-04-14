// Semantic HTML audit:
// - Changed non-linked card wrapper from <div> to <article>
import * as React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import type { IGatsbyImageData } from "gatsby-plugin-image";

import { useFadeIn } from "../utils/useFadeIn";

type ExperienceCardProps = {
  company: string;
  title: string;
  dateRange: string;
  blurb: string | null;
  technologies: string[];
  tags: string[];
  logo: IGatsbyImageData | null;
  companyUrl: string | null;
  companyUrlText: string | null;
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
  blurb,
  technologies,
  tags,
  logo,
  companyUrl,
  companyUrlText: _companyUrlText,
  index,
}) => {
  const ref = useFadeIn<HTMLElement>({ delay: index * 100 });
  const initials = getInitials(company);

  const cardContent = (
    <>
      <div className="exp-card-header">
        {logo ? (
          <GatsbyImage
            image={logo}
            alt={`${company} logo`}
            className="exp-card-logo"
            objectFit="contain"
          />
        ) : (
          <div className="exp-card-initials" aria-hidden="true">
            {initials}
          </div>
        )}
        <div className="exp-card-meta">
          <h3 className="exp-card-title">
            {title}
            {company && (
              <span className="exp-card-company">
                &nbsp;@&nbsp;
                {company.replace(/\s*(\(.*?\))/, "")}
                {company.match(/\s*(\(.*?\))/) && (
                  <span className="exp-card-company-sub">
                    {" "}{company.match(/\s*(\(.*?\))/)![1]}
                  </span>
                )}
              </span>
            )}
          </h3>
          <p className="exp-card-date">{dateRange}</p>
        </div>
      </div>

      {blurb && <p className="exp-card-blurb">{blurb}</p>}

      {technologies.length > 0 && (
        <ul className="exp-card-technologies" aria-label="Technologies used">
          {technologies.map((tech) => (
            <li key={tech} className="exp-card-tech-tag">
              {tech}
            </li>
          ))}
        </ul>
      )}

      {tags.length > 0 && (
        <ul className="exp-card-tags" aria-label="Tags">
          {tags.map((tag) => (
            <li key={tag} className="exp-card-tag">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return companyUrl ? (
    <a
      href={companyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="exp-card exp-card-link fade-in"
      ref={ref as React.RefObject<HTMLAnchorElement>}
      aria-label={`${title} at ${company}`}
    >
      {cardContent}
    </a>
  ) : (
    <article className="exp-card fade-in" ref={ref as React.RefObject<HTMLElement>}>
      {cardContent}
    </article>
  );
};

export default ExperienceCard;
