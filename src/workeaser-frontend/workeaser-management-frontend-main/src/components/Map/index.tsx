import React, { useEffect, useState } from "react";
import ReactMapGL from "react-map-gl";

interface MapProps {}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY;

const Map: React.FC<MapProps> = () => {
  const [viewport, setViewport] = useState({
    width: "100%",
    height: "100%",
    longitude: -0.1278,
    latitude: 51.5074,
    zoom: 8,
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setViewport((prev) => ({
          ...prev,
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        }));
      },
      () => {
        // Geolocation denied or unavailable — fall back to default viewport.
      }
    );
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        role="alert"
        style={{
          width: "100%",
          height: "100%",
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#f7f9fb",
          border: "1px dashed #ced9e6",
          borderRadius: 8,
          color: "#535F7C",
          textAlign: "center",
        }}
      >
        Map unavailable: <code>NEXT_PUBLIC_MAPBOX_KEY</code> is not configured.
        Contact your administrator.
      </div>
    );
  }

  return (
    <ReactMapGL
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      {...viewport}
    />
  );
};

export default Map;
