"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";



type User = {
    name: string;
    email?: string;
    image?: string;
};

type NavProps = {
    user?: User | null;
    onSignOut?: () => void;
};

export default function Nav({ user = null, onSignOut }: NavProps) {
    const [open, setOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    function initials(name?: string) {
        if (!name) return "U";
        return name
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    }

    return (
        <header className="w-full border-b bg-white">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: logo + links */}
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-semibold">
                                CM
                            </div>
                            <span className="font-semibold text-lg">CityMove</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-2 ml-6">
                            <Link href="/explore" className="px-3 py-2 rounded-md hover:bg-gray-100">
                                Explore
                            </Link>
                            <Link href="/listings" className="px-3 py-2 rounded-md hover:bg-gray-100">
                                Listings
                            </Link>
                            <Link href="/about" className="px-3 py-2 rounded-md hover:bg-gray-100">
                                About
                            </Link>
                        </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center">
                            <Link href="/create" className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                                Post
                            </Link>
                        </div>

                        {/* Profile */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen((s) => !s)}
                                aria-haspopup="true"
                                aria-expanded={open}
                                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 p-1"
                            >
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                                        {initials(user?.name)}
                                    </div>
                                )}
                                <span className="hidden sm:inline text-sm">{user?.name ?? "Guest"}</span>
                                <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                            <div className="font-medium">{user?.name ?? "Guest"}</div>
                                            {user?.email && <div className="text-xs text-gray-500">{user.email}</div>}
                                        </div>
                                        <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">
                                            Profile
                                        </Link>
                                        <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-gray-50">
                                            Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setOpen(false);
                                                onSignOut?.();
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => setMobileOpen((s) => !s)}
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile panel */}
                {mobileOpen && (
                    <div className="md:hidden py-2 border-t">
                        <div className="flex flex-col px-2 space-y-1">
                            <Link href="/explore" className="px-3 py-2 rounded-md hover:bg-gray-100">
                                Explore
                            </Link>
                            <Link href="/listings" className="px-3 py-2 rounded-md hover:bg-gray-100">
                                Listings
                            </Link>
                            <Link href="/about" className="px-3 py-2 rounded-md hover:bg-gray-100">
                                About
                            </Link>
                            <Link href="/create" className="px-3 py-2 rounded-md bg-blue-600 text-white text-center">
                                Post
                            </Link>
                            <div className="border-t pt-2">
                                <Link href="/profile" className="block px-3 py-2 rounded-md hover:bg-gray-100">
                                    Profile
                                </Link>
                                <Link href="/settings" className="block px-3 py-2 rounded-md hover:bg-gray-100">
                                    Settings
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileOpen(false);
                                        onSignOut?.();
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}