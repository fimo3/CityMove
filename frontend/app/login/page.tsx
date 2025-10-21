"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage(): React.ReactElement {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
            const base = backend.replace(/\/$/, '');
            const url = `${base}/api/profile/login/`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });
            const contentType = res.headers.get?.('content-type') || ''
            let body: any = null
            if (contentType.includes('application/json')) {
                body = await res.json().catch(() => null)
            } else {
                const text = await res.text().catch(() => '')
                try { body = text ? JSON.parse(text) : null } catch { body = { error: text } }
            }
            if (!res.ok) throw new Error(body?.error || `Login failed (${res.status})`);
            router.push('/profile');
        } catch (err: any) {
            setError(err?.message || 'Login error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">Log in</h1>
            <p className="text-sm text-gray-500 pb-3">Welcome back!</p>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <h3 className="text-md mb-2">Username:</h3>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" className="border p-2 rounded w-full" />
                </div>
                <div>
                    <h3 className="text-md mb-2">Password:</h3>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="border p-2 rounded w-full" />
                </div>
                <div>
                    <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded">
                        {loading ? 'Logging in…' : 'Login'}
                    </button>
                </div>
            </form>
        </div>
    );
}