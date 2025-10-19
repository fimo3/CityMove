"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  placeholder?: string;
  onSelect?: (label: string, coords: [number, number]) => void;
  id?: string;
};

export default function PlaceInput({ placeholder = "Search place", onSelect, id }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (typeof window === "undefined") return;

  let autocomplete: any = null;
    const listeners: Array<{ remove?: () => void } | any> = [];
    console.debug("PlaceInput: effect init", { key });

    // load google maps script if not present and key is provided
    if (key && !(window as any).google) {
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      s.async = true;
      s.defer = true;
      s.onload = () => initAutocomplete();
      document.head.appendChild(s);
    } else {
      // either google already exists, or no key provided; still initialize which will use fallback
      initAutocomplete();
    }

    async function geocodeNominatim(value: string) {
      console.debug("PlaceInput: geocodeNominatim start", { value });
      try {
        const q = encodeURIComponent(value);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`);
        const arr = await res.json();
        if (arr && arr[0]) {
          const lat = parseFloat(arr[0].lat);
          const lng = parseFloat(arr[0].lon);
          console.debug("PlaceInput: geocodeNominatim found", { lat, lng, display_name: arr[0].display_name });
          onSelect?.(arr[0].display_name || value, [lat, lng]);
          return true;
        }
      } catch (e) {
        console.warn("PlaceInput: geocodeNominatim error", e);
        /* ignore */
      }
      return false;
    }

    function initAutocomplete() {
      if (!inputRef.current) return;
      const googleAvailable = !!(window as any).google && (window as any).google.maps && (window as any).google.maps.places;
      if (!googleAvailable) {
        // No Google Places available; fallback to Nominatim on Enter/blur
        const handleEnter = async (e: KeyboardEvent) => {
          if (e.key === "Enter") {
            const value = inputRef.current?.value;
            if (value) await geocodeNominatim(value);
          }
        };
        const handleBlur = async () => {
          const value = inputRef.current?.value;
          if (value) await geocodeNominatim(value);
        };
        inputRef.current.addEventListener("keydown", handleEnter);
        inputRef.current.addEventListener("blur", handleBlur);
        listeners.push({ remove: () => inputRef.current && inputRef.current.removeEventListener("keydown", handleEnter) });
        listeners.push({ remove: () => inputRef.current && inputRef.current.removeEventListener("blur", handleBlur) });
        return;
      }

  const google = (window as any).google;
  console.debug("PlaceInput: initAutocomplete - google available", { hasGoogle: !!google });

      // Request fields so getPlace returns geometry and formatted_address when available.
      const autocompleteLocal = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode", "establishment"],
        fields: ["geometry", "formatted_address", "name"],
      });

      // When a place is selected from the dropdown
      const placeListener = autocompleteLocal.addListener("place_changed", async () => {
        console.debug("PlaceInput: place_changed event");
        const place = autocompleteLocal.getPlace();
        if (place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          console.debug("PlaceInput: place has geometry", { lat, lng, place });
          onSelect?.(place.formatted_address || place.name || inputRef.current?.value || "", [lat, lng]);
        } else {
          // If no geometry, fallback to google geocoder then Nominatim
          const value = inputRef.current?.value;
          if (value) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: value }, async (results: any, status: any) => {
              if (status === "OK" && results && results[0] && results[0].geometry) {
                const loc = results[0].geometry.location;
                const lat = loc.lat();
                const lng = loc.lng();
                console.debug("PlaceInput: google geocoder result", { lat, lng, results });
                onSelect?.(results[0].formatted_address || value, [lat, lng]);
              } else {
                console.debug("PlaceInput: google geocoder failed, trying Nominatim", { value, status });
                await geocodeNominatim(value);
              }
            });
          }
        }
      });
      listeners.push(placeListener);

      // Also handle blur: when user leaves the input, geocode the typed address if no place was selected
      const handleBlur = async () => {
        const value = inputRef.current?.value;
        if (!value) return;
        // If a place with geometry was already selected, do nothing
        const place = autocompleteLocal.getPlace ? autocompleteLocal.getPlace() : null;
        if (place && place.geometry) return;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: value }, async (results: any, status: any) => {
          if (status === "OK" && results && results[0] && results[0].geometry) {
            const loc = results[0].geometry.location;
            const lat = loc.lat();
            const lng = loc.lng();
            onSelect?.(results[0].formatted_address || value, [lat, lng]);
          } else {
            await geocodeNominatim(value);
          }
        });
      };
      inputRef.current.addEventListener("blur", handleBlur);
      listeners.push({ remove: () => inputRef.current && inputRef.current.removeEventListener("blur", handleBlur) });
    }

    return () => {
      // cleanup listeners on unmount
      listeners.forEach((l) => {
        try {
          if (l && typeof l.remove === "function") l.remove();
        } catch {
          /* ignore */
        }
      });
    };
  }, [onSelect]);

  return (
    <input
      id={id}
      ref={inputRef}
      className="w-full p-2 border rounded-md"
      placeholder={placeholder}
      type="text"
    />
  );
}
