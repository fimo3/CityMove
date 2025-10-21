"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type City = {
  name: string;
  info: string;
  coords: [number, number];
};


const CITIES: City[] = [
  { name: "Plovdiv", coords: [42.1354, 24.7453], info: "Historic city in Bulgaria." },
  { name: "Sofia", coords: [42.6977, 23.3219], info: "Capital of Bulgaria." },
  { name: "Athens", coords: [37.9838, 23.7275], info: "Capital of Greece." },
  { name: "Thessaloniki", coords: [40.6401, 22.9444], info: "Greece's second city." },
  { name: "Bratislava", coords: [48.1486, 17.1077], info: "Capital of Slovakia." },
  { name: "Poprad", coords: [49.0597, 20.2976], info: "Gateway to the High Tatras." },
];

function Dropdown({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="border rounded-md p-2">
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export default function FindListingPage() {
  const [selected, setSelected] = useState<string>(CITIES[0].name);
  const router = useRouter();
  const city = CITIES.find((c: City) => c.name === selected) || CITIES[0];

  return (
    <div>
        <h1 className="text-4xl">Listings</h1>
    <div className="p-4 bg-white rounded-md">
      <h2 className="text-2xl font-semibold">Choose a city</h2>
      <Dropdown options={CITIES.map((c: City) => c.name)} value={selected} onChange={setSelected} />
      <div className="mt-4 text-sm text-gray-600">
        <strong>{city.name}</strong>
        <p className="text-xs">{city.info}</p>
        <p className="mt-2 text-xs text-gray-500">
          Coordinates: {city.coords[0].toFixed(4)}, {city.coords[1].toFixed(4)}
        </p>
        <button
          className="flex-1 py-2 px-3 border rounded-md"
          onClick={() => router.push(`/listings?city=${encodeURIComponent(selected)}`)}
        >
          View listings
        </button>
      </div>
    </div>
    </div>
  );
}