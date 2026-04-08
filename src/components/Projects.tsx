import * as React from "react";

import ProjectCard from "./ProjectCard";
import type { ProjectData } from "./ProjectCard";
import { useFadeIn } from "../utils/useFadeIn";

import "../styles/components/projects.css";

const PROJECTS: ProjectData[] = [
  {
    name: "AI Project Name",
    description:
      "Short description of the AI project. Exploring LLM workflows and developer tooling.",
    tags: ["Python", "LLM", "AWS"],
    githubUrl: "https://github.com/patrickp999/project-1",
    gradient: "linear-gradient(135deg, #0F172A, #1E293B)",
  },
  {
    name: "Dev Tool Name",
    description:
      "Short description of the dev tool. Building CLI tools for developer productivity.",
    tags: ["TypeScript", "Node.js", "CLI"],
    githubUrl: "https://github.com/patrickp999/project-2",
    gradient: "linear-gradient(135deg, #1E1B4B, #312E81)",
  },
];

const Projects: React.FC = () => {
  const headingRef = useFadeIn<HTMLHeadingElement>();

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

      <div className="projects-grid">
        {PROJECTS.map((project, index) => (
          <ProjectCard key={project.name} {...project} index={index} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
