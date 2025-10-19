"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Dropdown } from "./(components)/Dropdown";
import PlaceInput from "./(components)/PlaceInput";

// Dynamically import the map (client-side only)
const Map = dynamic(() => import("./(components)/Map"), {
  ssr: false,
});

type CityInfo = {
  name: string;
  coords: [number, number];
  info?: string;
};

const CITIES: CityInfo[] = [
  { name: "Plovdiv", coords: [42.1354, 24.7453], info: "Historic city in Bulgaria." },
  { name: "Sofia", coords: [42.6977, 23.3219], info: "Capital of Bulgaria." },
  { name: "Athens", coords: [37.9838, 23.7275], info: "Capital of Greece." },
  { name: "Thessaloniki", coords: [40.6401, 22.9444], info: "Greece's second city." },
  { name: "Bratislava", coords: [48.1486, 17.1077], info: "Capital of Slovakia." },
  { name: "Poprad", coords: [49.0597, 20.2976], info: "Gateway to the High Tatras." },
];

export default function Home() {
  const [selected, setSelected] = useState<string>(CITIES[0].name);
  const [route, setRoute] = useState<[number, number][] | undefined>(undefined);
  const [start, setStart] = useState<{ label: string; coords: [number, number] } | null>(null);
  const [dest, setDest] = useState<{ label: string; coords: [number, number] } | null>(null);
  const router = useRouter();
  const city = CITIES.find((c) => c.name === selected) ?? CITIES[0];

  return (
    <div className="font-sans">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Welcome to CityMove</h1>
        <p className="text-sm text-gray-500">Your integrated transport platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="p-4 bg-white rounded-md shadow">
            <h2 className="text-2xl font-semibold">Choose a city</h2>
            <Dropdown options={CITIES.map((c) => c.name)} value={selected} onChange={setSelected} />
            <div className="mt-4 text-sm text-gray-600">
              <strong>{city.name}</strong>
              <p className="text-xs">{city.info}</p>
              <p className="mt-2 text-xs text-gray-500">
                Coordinates: {city.coords[0].toFixed(4)}, {city.coords[1].toFixed(4)}
              </p>
            </div>
          </div>
            <div className="p-4 bg-white rounded-md shadow">
            <h3 className="font-medium">Find a route</h3>
            <div className="mt-3 space-y-2">
              <div>
                <label className="block text-xs text-gray-600">Start</label>
                <PlaceInput
                  id="start"
                  onSelect={(a: any, b: any) => {
                    // normalize possible signatures: (label, coords) or (placeObject)
                    let label = "";
                    let coords: [number, number] | null = null;
                    if (typeof a === "string" && Array.isArray(b)) {
                      label = a;
                      coords = b as [number, number];
                    } else if (a && typeof a === "object") {
                      if (typeof a.label === "string") label = a.label;
                      if (Array.isArray(a.coords)) coords = a.coords as [number, number];
                      else if (typeof a.lat === "number" && typeof a.lng === "number") coords = [a.lat, a.lng];
                    }
                    if (coords) {
                      setStart({ label, coords });
                      console.log("Start selected:", { label, coords });
                    } else {
                      console.warn("PlaceInput did not return coords for start:", a, b);
                    }
                  }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Selected: {start ? `${start.label} (${start.coords[0].toFixed(5)}, ${start.coords[1].toFixed(5)})` : "(none)"}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Destination</label>
                <PlaceInput
                  id="dest"
                  onSelect={(a: any, b: any) => {
                    let label = "";
                    let coords: [number, number] | null = null;
                    if (typeof a === "string" && Array.isArray(b)) {
                      label = a;
                      coords = b as [number, number];
                    } else if (a && typeof a === "object") {
                      if (typeof a.label === "string") label = a.label;
                      if (Array.isArray(a.coords)) coords = a.coords as [number, number];
                      else if (typeof a.lat === "number" && typeof a.lng === "number") coords = [a.lat, a.lng];
                    }
                    if (coords) {
                      setDest({ label, coords });
                      console.log("Destination selected:", { label, coords });
                    } else {
                      console.warn("PlaceInput did not return coords for dest:", a, b);
                    }
                  }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  Selected: {dest ? `${dest.label} (${dest.coords[0].toFixed(5)}, ${dest.coords[1].toFixed(5)})` : "(none)"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-2 px-3 rounded-md ${!start || !dest ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white'}`}
                  onClick={async () => {
                    if (!start || !dest) {
                      console.log("Start or destination not set", { start, dest });
                      return;
                    }

                    const normalize = (p: { label: string; coords: any } | null) => {
                      if (!p) return null;
                      const c = p.coords;
                      if (Array.isArray(c) && c.length >= 2) return { lat: Number(c[0]), lng: Number(c[1]) };
                      if (c && typeof c.lat === "number" && typeof c.lng === "number") return { lat: c.lat, lng: c.lng };
                      // fallback: try to parse numeric values
                      if (typeof c === "object" && c !== null) {
                        const vals = Object.values(c).map((v: any) => Number(v)).filter((n: any) => !Number.isNaN(n));
                        if (vals.length >= 2) return { lat: vals[0], lng: vals[1] };
                      }
                      return null;
                    };

                    const s = normalize(start);
                    const d = normalize(dest);
                    console.log("Routing request payload:", { s, d });
                    if (!s || !d) {
                      alert("Invalid coordinates for start or destination.");
                      return;
                    }

                    try {
                      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
                      const url = `${backend.replace(/\/$/, "")}/api/route/`;
                      const res = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ start: s, dest: d }),
                      });

                      const text = await res.text();
                      if (!res.ok) {
                        console.error("Routing fetch failed", { status: res.status, body: text });
                        alert(`Routing request failed: ${res.status} - ${text.slice(0, 200)}`);
                        return;
                      }

                      let data: any;
                      try {
                        data = JSON.parse(text);
                      } catch (e) {
                        console.error("Invalid JSON from routing API", { text });
                        alert("Routing service returned invalid response.");
                        return;
                      }

                      if (!data.coords) {
                        alert(data.error || "No route returned");
                        return;
                      }
                      setRoute(data.coords);
                    } catch (err) {
                      console.error(err);
                      alert("Routing error");
                    }
                  }}
                >
                  Find route
                </button>
                <button
                  className="flex-1 py-2 px-3 border rounded-md"
                  onClick={() => router.push(`/listings?city=${encodeURIComponent(selected)}`)}
                >
                  View listings
                </button>
              </div>
              {(!start || !dest) && (
                <div className="mt-2 text-xs text-red-500">Please select both start and destination (use Enter or choose a suggestion).</div>
              )}
            </div>
            </div>
        </div>

        <div className="lg:col-span-2">
            <Map center={city.coords} markerLabel={city.name} route={route} />
        </div>
      </div>
    </div>
  );
}
