import * as React from "react";
import { FaGithub } from "react-icons/fa";

import { useFadeIn } from "../utils/useFadeIn";

export type ProjectData = {
  name: string;
  description: string;
  tags: string[];
  githubUrl: string;
  gradient: string;
};

type ProjectCardProps = ProjectData & {
  index: number;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  tags,
  githubUrl,
  gradient,
  index,
}) => {
  const ref = useFadeIn<HTMLDivElement>({ delay: index * 100 });

  return (
    <div className="project-card fade-in" ref={ref}>
      <div
        className="project-card-thumbnail"
        style={{ background: gradient }}
        aria-hidden="true"
      />
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
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card-github"
          aria-label={`${name} on GitHub`}
        >
          <FaGithub size={20} />
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
