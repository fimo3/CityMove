"use client";

import { useSearchParams } from "next/navigation";

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") ?? "(any)";

  const fakeListings = [
    { id: 1, title: `Bus pass sale in ${city}`, price: "€12" },
    { id: 2, title: `Park-and-ride spot near ${city} center`, price: "€3/day" },
    { id: 3, title: `Monthly commuter card - ${city}`, price: "€25" },
  ];

  return (
    <div className="p-4 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold">Listings for {city}</h1>
      <p className="text-sm text-gray-500">Showing mock listings filtered by city query.</p>
      <ul className="mt-4 space-y-3">
        {fakeListings.map((l) => (
          <li key={l.id} className="p-3 border rounded-md">
            <div className="font-medium">{l.title}</div>
            <div className="text-sm text-gray-600">{l.price}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
