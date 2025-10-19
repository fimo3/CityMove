"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Dropdown } from "./(components)/Dropdown";

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
            <h3 className="font-medium">Quick actions</h3>
            <div className="mt-2 space-y-2">
              <button
              className="w-full py-2 px-3 bg-blue-600 text-white rounded-md"
                onClick={() => {
                  // build a sample circular route near the city center
                  const [lat, lng] = city.coords;
                  const sample: [number, number][] = [
                    [lat + 0.02, lng - 0.02],
                    [lat + 0.01, lng + 0.03],
                    [lat - 0.02, lng + 0.01],
                    [lat - 0.01, lng - 0.03],
                    [lat + 0.02, lng - 0.02],
                  ];
                  setRoute(sample);
                }}
              >
              Explore routes in this city
              </button>
              <button
              className="w-full py-2 px-3 border rounded-md"
                onClick={() => {
                  // navigate to internal listings page using Next router
                  router.push(`/listings?city=${encodeURIComponent(selected)}`);
                }}
              >
              View listings
              </button>
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
