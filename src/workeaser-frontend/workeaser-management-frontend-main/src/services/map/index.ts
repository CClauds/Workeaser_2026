import axios from "axios";
import { Geocode } from "types/mapbox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;

export const mapApi = axios.create({
  baseURL: "https://api.mapbox.com/geocoding/v5/",
});

function hasToken(): boolean {
  return !!MAPBOX_TOKEN;
}

export const getGeoLocation = async (value: string) => {
  if (!MAPBOX_TOKEN) return null;
  const textEncoded = encodeURIComponent(value);
  const url = `/mapbox.places/${textEncoded}.json?access_token=${MAPBOX_TOKEN}`;
  try {
    const res = await mapApi.get<Geocode>(url);
    return res.data;
  } catch {
    return null;
  }
};

export const getReverseGeoLocation = async (lon: number, lat: number) => {
  if (!MAPBOX_TOKEN) return null;
  const url = `/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}`;
  try {
    const res = await mapApi.get<Geocode>(url);
    return res.data;
  } catch {
    return null;
  }
};

export const getLeadFeatureFlagEnv = () => {
  return process.env.LEADS_FEATURE ? true : false;
};
