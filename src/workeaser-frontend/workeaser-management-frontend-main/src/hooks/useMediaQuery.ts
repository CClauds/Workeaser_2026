import { useEffect, useState } from "react";

/**
 * Returns true when the viewport matches the given media query. Re-evaluates on
 * resize and orientation change so components that need to branch on layout
 * (e.g. mobile vs desktop) stay in sync with the actual viewport instead of
 * the value captured at mount.
 *
 * SSR-safe: returns `false` on the server (no `window`) and updates on mount.
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handler);
      return () => mediaQueryList.removeEventListener("change", handler);
    }

    mediaQueryList.addListener(handler);
    return () => mediaQueryList.removeListener(handler);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery("(max-width: 768px)");
export const useIsTablet = () => useMediaQuery("(max-width: 992px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 993px)");
