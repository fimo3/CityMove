"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type MapProps = {
  center: [number, number];
  markerLabel: string;
  route?: [number, number][]; // optional polyline route
};

export default function Map({ center, markerLabel, route }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const L = require("leaflet");

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

  const map = L.map(mapRef.current!).setView(center, 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.marker(center).addTo(map).bindPopup(markerLabel).openPopup();

    // if a route is provided, draw it
    let polyline: any = null;
    if (route && route.length > 0) {
      polyline = L.polyline(route, { color: "#2563eb", weight: 4, opacity: 0.9 }).addTo(map);
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }

    return () => {
      if (polyline) {
        map.removeLayer(polyline);
      }
      map.remove();
    };
  }, [center, markerLabel]);
  return (
  <div
    ref={mapRef}
    className="
      h-[60vh] w-full border 
      rounded-t-md 
      rounded-b-4xl lg:rounded-l-md lg:rounded-r-4xl
      transition-all duration-300
    "
  />
);


}