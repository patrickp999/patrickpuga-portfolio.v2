declare module "react-icons/fa" {
  import { ComponentType, SVGAttributes } from "react";
  export type IconType = ComponentType<SVGAttributes<SVGElement> & { size?: string | number; color?: string; title?: string }>;
  export const FaGithub: IconType;
  export const FaLinkedin: IconType;
  export const FaLink: IconType;
}
