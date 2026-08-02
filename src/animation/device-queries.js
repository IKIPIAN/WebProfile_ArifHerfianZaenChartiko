export const DEVICE = {
  desktop: "(min-width: 900px)",
  tablet: "(min-width: 640px) and (max-width: 899px)",
  mobile: "(max-width: 639px)",
};

export function getDeviceType() {
  if (typeof window === "undefined") {
    return "desktop";
  }

  if (window.matchMedia(DEVICE.mobile).matches) {
    return "mobile";
  }

  if (window.matchMedia(DEVICE.tablet).matches) {
    return "tablet";
  }

  if (window.matchMedia(DEVICE.desktop).matches) {
    return "desktop";
  }

  return "desktop";
}

export function isDesktop() {
  return (
    typeof window !== "undefined" && window.matchMedia(DEVICE.desktop).matches
  );
}

export function isTablet() {
  return (
    typeof window !== "undefined" && window.matchMedia(DEVICE.tablet).matches
  );
}

export function isMobile() {
  return (
    typeof window !== "undefined" && window.matchMedia(DEVICE.mobile).matches
  );
}
