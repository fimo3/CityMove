"use client";

type InputProps = {
  options: string[];
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function Dropdown({ options, placeholder = "Select a city", className = "", value = "", onChange }: InputProps) {
  return (
    <select
      className={`bg-slate-200 p-2 rounded-md text-gray-800 ${className}`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
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
