"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Dropdown } from "./(components)/Dropdown";
import PlaceInput from "./(components)/PlaceInput";
import FindListingPage from "./findlisting/page";

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
  const [duration, setDuration] = useState<number | string | null>(null); // seconds or string
  const router = useRouter();
  const city = CITIES.find((c) => c.name === selected) ?? CITIES[0];

  const formatDuration = (d: number | string | null) => {
    if (d == null) return "(unknown)";
    if (typeof d === "string") return d;
    // assume numeric values are seconds
    const sec = Math.max(0, Math.round(d));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="font-sans">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Welcome to CityMove</h1>
        <p className="text-sm text-gray-500">Your integrated transport platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          
            <div className="p-4 bg-white rounded-md shadow">
            <h3 className="text-2xl font-bold">Find a route</h3>
            <div className="mt-3 space-y-2">
              <div>
                <label className="block text-xs text-gray-600">Mode</label>
                <div className="mt-2 flex gap-3 items-center">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="vehicle" value="walking" />
                    Walking
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="vehicle" value="cycling" />
                    Cycling
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name="vehicle" value="driving" defaultChecked />
                    Driving
                  </label>
                </div>
                <div className="mt-1 text-xs text-gray-500">Selected: <span id="citymove-vehicle-selected">driving</span></div>

                <script 
                  dangerouslySetInnerHTML={{
                    __html: `(function(){
                      // Keep a simple global so the route button's request will include the mode
                      function getSelected() {
                        try {
                          var el = document.querySelector('input[name="vehicle"]:checked');
                          return (el && el.value) || 'driving';
                        } catch(e) { return 'driving'; }
                      }

                      window.__citymove_vehicle = getSelected();
                      var selDisplay = document.getElementById('citymove-vehicle-selected');
                      if (selDisplay) selDisplay.textContent = window.__citymove_vehicle;

                      document.addEventListener('change', function(e){
                        if (e.target && e.target.name === 'vehicle') {
                          window.__citymove_vehicle = getSelected();
                          if (selDisplay) selDisplay.textContent = window.__citymove_vehicle;
                        }
                      });

                      // Monkey-patch fetch to inject the selected vehicle into route POSTs
                      if (typeof window !== 'undefined' && window.fetch) {
                        var _origFetch = window.fetch.bind(window);
                        window.fetch = async function(input, init) {
                          try {
                            var url = typeof input === 'string' ? input : (input && input.url) || '';
                            if (url && url.indexOf('/api/route') !== -1) {
                              try {
                                init = init || {};
                                if (typeof init.body === 'string') {
                                  try {
                                    var bodyObj = JSON.parse(init.body);
                                    if (!bodyObj.vehicle) {
                                      bodyObj.vehicle = window.__citymove_vehicle || getSelected();
                                      init = Object.assign({}, init, { body: JSON.stringify(bodyObj) });
                                      // ensure content-type header
                                      var headers = init.headers || {};
                                      if (headers instanceof Headers) {
                                        headers.set('Content-Type', 'application/json');
                                      } else if (typeof headers === 'object') {
                                        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
                                      }
                                      init.headers = headers;
                                    }
                                  } catch (err) {
                                    // ignore parse errors
                                    console.error('CityMove: failed to parse body when injecting vehicle', err);
                                  }
                                }
                              } catch (err) {
                                console.error('CityMove: error while preparing fetch override', err);
                              }
                            }
                          } catch(e){}
                          return _origFetch(input, init);
                        };
                      }
                    })();`,
                  }}
                />
              </div>
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
                      setRoute(undefined);
                      setDuration(null);
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
                      setRoute(undefined);
                      setDuration(null);
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

                      // Prefer parsing as JSON if the server sent JSON content-type.
                      const contentType = res.headers.get?.('content-type') || '';
                      let data: any = null;

                      if (!res.ok) {
                        // try to capture a text body for debugging
                        const bodyText = await res.text().catch(() => '<no body>');
                        console.error('Routing fetch failed', { status: res.status, body: bodyText });
                        alert(`Routing request failed: ${res.status} - ${bodyText.slice(0, 200)}`);
                        setDuration(null);
                        return;
                      }

                      try {
                        if (contentType.includes('application/json')) {
                          data = await res.json();
                        } else {
                          // Try to parse body as JSON even if content-type was missing/incorrect
                          const text = await res.text();
                          if (!text) {
                            throw new Error('Empty response body');
                          }
                          try {
                            data = JSON.parse(text);
                          } catch (err) {
                            // Not JSON — log body for debugging and surface a user-friendly message
                            console.error('Routing service returned non-JSON response', { status: res.status, body: text });
                            alert('Routing service returned an unexpected response. See console for details.');
                            setDuration(null);
                            return;
                          }
                        }
                      } catch (err) {
                        console.error('Error parsing routing response', err);
                        alert('Failed to parse routing response.');
                        setDuration(null);
                        return;
                      }

                      if (!data.coords && !data.paths) {
                        alert(data.error || "No route returned");
                        setDuration(null);
                        return;
                      }

                      // Accept several possible duration fields.
                      // If backend proxies GraphHopper, use paths[0].time (ms) -> convert to seconds.
                      let durationVal: number | string | null = null;

                      // GraphHopper response: data.paths[0].time is milliseconds
                      if (data?.paths && Array.isArray(data.paths) && typeof data.paths[0]?.time === "number") {
                        durationVal = Math.round(data.paths[0].time / 1000); // seconds
                      } else if (typeof data.time === "number") {
                        durationVal = data.time > 1e6 ? Math.round(data.time / 1000) : Math.round(data.time);
                      } else if (typeof data.duration === "number") {
                        durationVal = Math.round(data.duration);
                      } else if (typeof data.travel_time === "number") {
                        durationVal = Math.round(data.travel_time);
                      } else if (typeof data.duration === "string") {
                        durationVal = data.duration;
                      } else if (typeof data.travel_time === "string") {
                        durationVal = data.travel_time;
                      }

                      if (data.coords) {
                        setRoute(data.coords);
                      } else if (data.paths && data.paths[0] && data.paths[0].points && data.paths[0].points.coordinates) {
                        const coords = data.paths[0].points.coordinates.map((c: any[]) => [c[1], c[0]]);
                        setRoute(coords);
                      } else {
                        setRoute(undefined);
                      }

                      setDuration(durationVal);
                    } catch (err) {
                      console.error(err);
                      alert("Routing error");
                      setDuration(null);
                    }
                  }}
                >
                  Find route

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