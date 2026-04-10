import * as React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import type { IGatsbyImageData } from "gatsby-plugin-image";
import { FaGithub, FaLink } from "react-icons/fa";

import { useFadeIn } from "../utils/useFadeIn";

const THUMBNAIL_BG = "#1E1B4B";

type ProjectCardProps = {
  name: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl?: string | null;
  thumbnail?: IGatsbyImageData | null;
  index: number;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  tags,
  githubUrl,
  liveUrl,
  thumbnail,
  index,
}) => {
  const ref = useFadeIn<HTMLDivElement>({ delay: index * 100 });

  return (
    <div className="project-card fade-in" ref={ref}>
      {thumbnail ? (
        <div
          className="project-card-thumbnail"
          style={{ background: THUMBNAIL_BG }}
        >
          <GatsbyImage
            image={thumbnail}
            alt={`${name} thumbnail`}
            className="project-card-thumbnail-image"
          />
        </div>
      ) : (
        <div
          className="project-card-thumbnail"
          style={{ background: THUMBNAIL_BG }}
          aria-hidden="true"
        />
      )}
      <div className="project-card-body">
        <h3 className="project-card-name">{name}</h3>
        <p className="project-card-description">{description}</p>
        {tags.length > 0 && (
          <ul className="project-card-tags">
            {tags.map((tag, idx) => (
              <li key={`${tag}-${idx}`} className="project-card-tag">
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="project-card-links">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card-github"
            aria-label={`${name} on GitHub`}
          >
            <FaGithub size={20} />
          </a>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card-github"
              aria-label={`${name} live demo`}
            >
              <FaLink size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
