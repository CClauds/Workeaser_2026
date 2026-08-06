import { ServicesAbbrEnum, ServicesSlugEnum } from "./enums";

export interface ServiceResponse {
  result: Service[];
}

export type ServicesSlug = keyof typeof ServicesSlugEnum;
type ServicesAbbr = `${ServicesAbbrEnum}`;

export interface Service {
  id: number;
  name: string;
  slug: ServicesSlug;
  abbr: ServicesAbbr;
}
export interface Amenity {
  id: number;
  name: string;
}

enum TermSizeEnum {
  MONTH_1 = "1 Month",
  MONTH_3 = "3 Months",
  MONTH_6 = "6 Months",
  YEAR_1 = "1 Year",
  YEAR_2 = "2 Years",
  YEAR_3 = "3 Years",
}
type TermSizeNames = `${TermSizeEnum}`;
type TermSizeSlugs = keyof typeof TermSizeEnum;

export interface TermSize {
  name: TermSizeNames;
  slug: TermSizeSlugs;
}
