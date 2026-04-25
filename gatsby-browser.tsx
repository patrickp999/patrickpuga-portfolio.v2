export const onRouteUpdate = ({ location }: { location: Location }) => {
  if (typeof window !== "undefined" && (window as any).umami) {
    (window as any).umami.track();
  }
};
