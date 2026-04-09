import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import type { IGatsbyImageData } from "gatsby-plugin-image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { MARKS } from "@contentful/rich-text-types";

import "../styles/components/hero.css";
import {
  computeHeroBaseDelay,
  getFadeDuration,
  HERO_FALLBACK,
} from "../utils/constants";

export type HeroContent = {
  name: string;
  subtitle: string;
  intro?: string | null;
  avatar?: IGatsbyImageData | any;
};

type HeroProps = {
  data?: Partial<HeroContent>;
};

export const Hero: React.FC<HeroProps> = ({ data }) => {
  const [mounted, setMounted] = React.useState(false);
  const [viewportWidth, setViewportWidth] = React.useState<number | undefined>(undefined);
  const content: HeroContent = { ...HERO_FALLBACK, ...data };

  const fadeDuration = getFadeDuration(viewportWidth);
  const baseDelay = computeHeroBaseDelay(viewportWidth);

  const image = getImage(content.avatar || null);

  const richTextOptions = {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => (
        <span className="hero-highlight">{text}</span>
      ),
    },
  };

  React.useEffect(() => {
    setViewportWidth(window.innerWidth);
    const t = setTimeout(() => setMounted(true), 50); // tiny delay to avoid FOUC
    return () => clearTimeout(t);
  }, []);

  const items = [
    ...(image
      ? [
          <div
            key="avatar"
            className="hero-avatar-wrapper"
            style={{ transitionDelay: `${baseDelay + 100}ms` }}
          >
            <GatsbyImage
              image={image}
              alt={content.name}
              className="hero-avatar"
            />
          </div>,
        ]
      : []),
    <h1
      key="name"
      className="hero-name"
      style={{ transitionDelay: `${baseDelay + (image ? 200 : 100)}ms` }}
    >
      {content.name}
    </h1>,
    <hr
      key="rule"
      className="hero-divider"
      style={{ transitionDelay: `${baseDelay + (image ? 300 : 200)}ms` }}
    />,
    <h2
      key="title"
      className="hero-title"
      style={{ transitionDelay: `${baseDelay + (image ? 400 : 300)}ms` }}
    >
      {content.subtitle}
    </h2>,
    ...(content.intro
      ? [
          <div
            key="intro"
            className="hero-bio"
            style={{ transitionDelay: `${baseDelay + (image ? 500 : 400)}ms` }}
          >
            {documentToReactComponents(JSON.parse(content.intro), richTextOptions)}
          </div>,
        ]
      : []),
  ];

  return (
    <section id="hero" className="hero-container" aria-label="Intro">
      <div className="hero-inner">
        <TransitionGroup component={null}>
          {mounted &&
            items.map((el, i) => (
              <CSSTransition
                key={i}
                classNames="fade"
                timeout={fadeDuration}
                appear
              >
                {el}
              </CSSTransition>
            ))}
        </TransitionGroup>
      </div>
    </section>
  );
};

export default Hero;
