import axios from "axios";
import { Geocode } from "types/mapbox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;

export const mapApi = axios.create({
  baseURL: "https://api.mapbox.com/geocoding/v5/",
});

function assertToken(): string {
  if (!MAPBOX_TOKEN) {
    throw new Error(
      "Mapbox access token is missing. Set NEXT_PUBLIC_MAPBOX_KEY in your environment."
    );
  }
  return MAPBOX_TOKEN;
}

export const getGeoLocation = async (value: string) => {
  const token = assertToken();
  const textEncoded = encodeURIComponent(value);
  const url = `/mapbox.places/${textEncoded}.json?access_token=${token}`;
  const res = await mapApi.get<Geocode>(url);
  return res.data;
};

export const getReverseGeoLocation = async (lon: number, lat: number) => {
  const token = assertToken();
  const url = `/mapbox.places/${lon},${lat}.json?access_token=${token}`;
  const res = await mapApi.get<Geocode>(url);
  return res.data;
};

export const getLeadFeatureFlagEnv = () => {
  return process.env.LEADS_FEATURE ? true : false;
};
