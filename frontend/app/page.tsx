import { Dropdown } from "./(components)/Dropdown";

export default function Home() {
  let cities = [
    "Plovdiv",
    "Sofia",
    "Athens",
    "Thessaloniki",
    "Bratislava",
    "Poprad",];
  return (
    <div className="font-sans flex flex-col min-h-screen py-2 m-5">
      <h1 className="text-4xl font-bold">Welcome to CityMove</h1>
      <p className="text-sm text-gray-500">Your integrated transport platform.</p>
    
      <div>
        <h1 className="text-3xl pt-5">Choose a city:</h1>
        <Dropdown options={cities}/>
      </div>
    </div>
  );
}
