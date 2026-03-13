import * as React from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

import "../styles/components/about.css";

// Use the generated node type from your page query
type AboutNode = Queries.IndexPageQuery["about"]["nodes"][number];

type AboutProps = { data: AboutNode };

export const About: React.FC<AboutProps> = ({ data }) => {
  const image = getImage(data.avatar?.gatsbyImageData || null);

  // Normalize skills: string[] | string | null -> string[]
  const skills: string[] = Array.isArray(data.skills)
    ? Array.from(data.skills) // handles readonly arrays
        .filter(isNonEmptyString) // now TS knows it's string[]
        .map((s) => s.trim())
    : typeof data.skills === "string"
      ? data.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

  return (
    <section
      id="about"
      className="about-section"
      aria-labelledby="about-heading"
    >
      <h2 id="about-heading" className="about-heading">
        {data.title ?? "About"}
      </h2>

      <div className="about-flex">
        <div className="about-content">
          {data.description?.raw
            ? documentToReactComponents(JSON.parse(data.description.raw))
            : null}

          {skills.length > 0 && (
            <ul className="about-skills">
              {skills.map((skill, index) => (
                <li key={`${skill}-${index}`} className="about-skill">
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="about-pic">
          {image && (
            <GatsbyImage
              image={image}
              alt={data.avatar?.title ?? "Portrait"}
              className="about-avatar"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default About;

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;
