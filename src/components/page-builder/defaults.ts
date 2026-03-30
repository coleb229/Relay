import type { SectionStyle } from "./schemas";

let counter = 0;
export function genSectionId() {
  counter += 1;
  return `section-${Date.now()}-${counter}`;
}

export const DEFAULT_SECTION_STYLE: SectionStyle = {
  alignment: "center",
  verticalAlignment: "center",
  backgroundColor: null,
  backgroundImageUrl: null,
  paddingY: "md",
  borderRadius: "none",
  boxShadow: "none",
  maxWidth: "full",
  backgroundGradient: null,
  paddingX: "md",
  fontFamily: null,
  fontSize: null,
  fontWeight: null,
  lineHeight: null,
  letterSpacing: null,
  textColor: null,
};
