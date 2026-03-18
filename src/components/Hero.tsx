import * as React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import "../styles/components/hero.css";
import {
  computeHeroBaseDelay,
  getFadeDuration,
  HERO_FALLBACK,
} from "../utils/constants";

export type HeroContent = {
  greeting?: string;
  name: string;
  subtitle: string;
  blurb: string;
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

  React.useEffect(() => {
    setViewportWidth(window.innerWidth);
    const t = setTimeout(() => setMounted(true), 50); // tiny delay to avoid FOUC
    return () => clearTimeout(t);
  }, []);

  const items = [
    <h1
      key="name"
      className="hero-name"
      style={{ transitionDelay: `${baseDelay + 100}ms` }}
    >
      {content.name}
    </h1>,
    <hr
      key="rule"
      className="hero-divider"
      style={{ transitionDelay: `${baseDelay + 200}ms` }}
    />,
    <h2
      key="title"
      className="hero-title"
      style={{ transitionDelay: `${baseDelay + 300}ms` }}
    >
      {content.subtitle}
    </h2>,
    <p
      key="blurb"
      className="hero-blurb"
      style={{ transitionDelay: `${baseDelay + 400}ms` }}
    >
      {content.blurb}
    </p>,
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
