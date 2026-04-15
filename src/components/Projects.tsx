// Semantic HTML audit:
// - Changed projects grid from <div> to <ul> for proper list semantics
import * as React from "react";

import ProjectCard from "./ProjectCard";
import { useFadeIn } from "../utils/useFadeIn";

import "../styles/components/projects.css";

type ProjectNode =
  Queries.IndexPageQuery["allContentfulProject"]["nodes"][number];

type ProjectsProps = {
  data?: ProjectNode[] | null;
};

const Projects: React.FC<ProjectsProps> = ({ data }) => {
  const projects = Array.isArray(data) ? data : [];
  const headingRef = useFadeIn<HTMLHeadingElement>();

  if (projects.length === 0) {
    return (
      <section
        id="projects"
        className="projects-section"
        aria-labelledby="projects-heading"
      >
        <h2
          id="projects-heading"
          className="projects-heading fade-in"
          ref={headingRef}
        >
          Projects
        </h2>
        <p className="projects-empty">No projects available</p>
      </section>
    );
  }

  return (
    <section
      id="projects"
      className="projects-section"
      aria-labelledby="projects-heading"
    >
      <h2
        id="projects-heading"
        className="projects-heading fade-in"
        ref={headingRef}
      >
        Projects
      </h2>

      <ul className="projects-grid">
        {projects.map((project, index) => (
          <li key={project.name ?? index}>
            <ProjectCard
              name={project.name ?? ""}
              description={project.description?.description ?? ""}
              tags={[...(project.tags?.filter(Boolean) ?? [])] as string[]}
              githubUrl={project.githubUrl ?? ""}
              liveUrl={project.liveUrl ?? null}
              thumbnail={project.thumbnail?.gatsbyImageData ?? null}
              index={index}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Projects;
