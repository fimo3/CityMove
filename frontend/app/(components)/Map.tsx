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
  // we'll initialize the map once and update layers when props change
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  // init map once
  useEffect(() => {
    const L = require("leaflet");

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current!).setView(center, 10);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    return () => {
      try {
        map.remove();
      } catch (e) {
        // ignore
      }
    };
    // initialize only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update marker and center when center or label changes
  useEffect(() => {
    const L = require("leaflet");
    const map = mapInstance.current;
    if (!map) return;

    // remove old marker
    if (markerRef.current) {
      try {
        map.removeLayer(markerRef.current);
      } catch (e) {}
    }
    markerRef.current = L.marker(center).addTo(map).bindPopup(markerLabel);
    markerRef.current.openPopup();
    map.setView(center, map.getZoom() || 12);
  }, [center, markerLabel]);

  // update polyline when route changes
  useEffect(() => {
    const L = require("leaflet");
    const map = mapInstance.current;
    if (!map) return;

    if (polylineRef.current) {
      try {
        map.removeLayer(polylineRef.current);
      } catch (e) {}
      polylineRef.current = null;
    }

    if (route && route.length > 0) {
      polylineRef.current = L.polyline(route, { color: "#2563eb", weight: 4, opacity: 0.9 }).addTo(map);
      try {
        map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
      } catch (e) {}
    }
  }, [route]);
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