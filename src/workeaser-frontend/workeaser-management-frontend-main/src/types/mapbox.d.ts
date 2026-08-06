export interface Geocode {
  type: string;
  query: string[];
  features: Feature[];
  attribution: string;
}

export interface Feature {
  id: string;
  type: string;
  place_type: string;
  relevance: number;
  address: string;
  properties: Properties;
  text: string;
  place_name: string;
  matching_text: string;
  matching_place_name: string;
  language: string;
  bbox: number[];
  center: number[];
  geometry: Geometry;
  context: Feature[];
}

type Properties = {
  accuracy: string;
  address: string;
  category: string;
  maki: string;
  wikidata: string;
  short_code: string;
};

type Geometry = {
  type: string;
  coordinates: number[];
  interpolated: boolean;
  omitted: boolean;
};
