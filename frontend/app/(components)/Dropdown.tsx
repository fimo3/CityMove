"use client";

type InputProps = {
  options: string[];
  placeholder?: string;
  className?: string;
};

export function Dropdown({ options, placeholder = "Select a city", className = "" }: InputProps) {
  return (
    <select
      className={`bg-slate-200 p-2 rounded-md text-gray-800 ${className}`}
      defaultValue=""
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </select>
  );
}
