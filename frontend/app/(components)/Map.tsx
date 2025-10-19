"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

type MapProps = {
  center: [number, number];
  markerLabel: string;
};

export default function Map({ center, markerLabel }: MapProps) {
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

    return () => {
      map.remove();
    };
  }, [center, markerLabel]);

  return <div ref={mapRef} style={{ height: "60vh", width: "100%" }} className="border rounded-e-4xl rounded-s-md" />;
}