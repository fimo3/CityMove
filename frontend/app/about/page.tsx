import Image from "next/image";
import first from "./1.jpg";
import second from "./2.jpg";
import third from "./3.jpg";
import fourth from "./4.jpg";

export default function About() {
    return (
        <div className="font-sans flex flex-col min-h-screen py-2 m-5">
            <div>
                <h1 className="text-4xl font-bold">About CityMove</h1>
                <p className="text-base pt-5">CityMove is your integrated transport platform, 
                    designed to make urban mobility easier and more efficient. Our mission is to connect 
                    people with the best transportation options available in their cities, promoting sustainable 
                    and convenient travel.</p>
            </div>
            <h1 className="text-3xl font-bold pt-8">About us</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                <figure className="flex flex-col items-center">
                    <Image
                        src={first}
                        alt="Serafim Kovachevich"
                        width={100}
                        height={100}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <figcaption className="mt-2 text-center text-sm">Serafim Kovachevich</figcaption>
                </figure>

                <figure className="flex flex-col items-center">
                    <Image
                        src={second}
                        alt="Serafim Kovachevich"
                        width={100}
                        height={100}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <figcaption className="mt-2 text-center text-sm">Aleksandar</figcaption>
                </figure>

                <figure className="flex flex-col items-center">
                    <Image
                        src={third}
                        alt="Serafim Kovachevich"
                        width={100}
                        height={100}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <figcaption className="mt-2 text-center text-sm">Gabriela</figcaption>
                </figure>

                <figure className="flex flex-col items-center">
                    <Image
                        src={fourth}
                        alt="Serafim Kovachevich"
                        width={100}
                        height={100}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <figcaption className="mt-2 text-center text-sm">Anton</figcaption>
                </figure>
            </div>
        </div>

    );
}