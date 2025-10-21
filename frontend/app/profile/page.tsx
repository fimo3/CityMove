"use client";

import React, { useEffect, useState, FormEvent } from 'react'

type User = {
    id: string
    name: string
    email: string
    avatarUrl?: string
    bio?: string
}

export default function ProfilePage(): React.ReactElement {
    const [user, setUser] = useState<User | null>(null)
    const [editing, setEditing] = useState<boolean>(false)
    const [form, setForm] = useState<Partial<User>>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        async function load() {
            setLoading(true)
            try {
                    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
                    const base = backend.replace(/\/$/, '')
                    const url = `${base}/api/profile/`
                    const res = await fetch(url, { credentials: 'include' })
                    const contentType = res.headers.get?.('content-type') || ''
                    if (!res.ok) {
                        const text = await res.text().catch(() => '')
                        throw new Error(`Failed to load (${res.status}) ${text ? `: ${text.slice(0,200)}` : ''}`)
                    }
                    let body: any = null
                    if (contentType.includes('application/json')) {
                        body = await res.json().catch(() => null)
                    } else {
                        // try to parse text body as JSON but handle gracefully
                        const text = await res.text().catch(() => '')
                        try {
                            body = text ? JSON.parse(text) : null
                        } catch (e) {
                            console.warn('Profile endpoint returned non-JSON:', text.slice(0,200))
                            body = null
                        }
                    }
                    const data: User = body?.profile ?? body
                if (!mounted) return
                setUser(data)
                setForm({ name: data.name, email: data.email, bio: data.bio, avatarUrl: data.avatarUrl })
            } catch (err: any) {
                setError(err?.message ?? 'Unknown error')
            } finally {
                if (mounted) setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    async function handleSave(e: FormEvent) {
        e.preventDefault()
        if (!user) return
        setLoading(true)
        setError(null)
        setMessage(null)
        try {
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
            const base = backend.replace(/\/$/, '')
            const url = `${base}/api/profile/`
            const payload = { profile: { ...user, ...form } }
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            })
            const contentType = res.headers.get?.('content-type') || ''
            if (!res.ok) {
                const text = await res.text().catch(() => '')
                throw new Error(`Save failed (${res.status})${text ? `: ${text.slice(0,200)}` : ''}`)
            }
            let body: any = null
            if (contentType.includes('application/json')) {
                body = await res.json().catch(() => null)
            } else {
                const text = await res.text().catch(() => '')
                try { body = text ? JSON.parse(text) : null } catch { body = { error: text } }
            }
            const updated: User = body?.profile ?? body
            setUser(updated)
            setForm({ name: updated.name, email: updated.email, bio: updated.bio, avatarUrl: updated.avatarUrl })
            setEditing(false)
            setMessage('Profile updated.')
        } catch (err: any) {
            setError(err?.message ?? 'Save error')
        } finally {
            setLoading(false)
        }
    }

    if (loading && !user) {
        return <div style={{ padding: 24 }}>Loading profile…</div>
    }

    return (
        <div style={{ maxWidth: 820, margin: '24px auto', padding: 20, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial' }}>
            <h1 style={{ margin: 0, marginBottom: 12 }}>Profile</h1>

            {error && <div style={{ color: '#c53030', marginBottom: 12 }}>{error}</div>}
            {message && <div style={{ color: '#2f855a', marginBottom: 12 }}>{message}</div>}

            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 120, textAlign: 'center' }}>
                    <div
                        style={{
                            width: 96,
                            height: 96,
                            borderRadius: '50%',
                            backgroundColor: '#e2e8f0',
                            overflow: 'hidden',
                            display: 'inline-block',
                        }}
                    >
                        {user?.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    {!editing ? (
                        <>
                            <div style={{ marginBottom: 6, fontSize: 18, fontWeight: 600 }}>{user?.name ?? '—'}</div>
                            <div style={{ color: '#475569', marginBottom: 6 }}>{user?.email ?? '—'}</div>
                            <p style={{ color: '#334155' }}>{user?.bio ?? 'No bio provided.'}</p>
                            <div style={{ marginTop: 12 }}>
                                <button onClick={() => setEditing(true)} style={buttonStyle}>
                                    Edit profile
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSave}>
                            <label style={labelStyle}>
                                Name
                                <input
                                    value={form.name ?? ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((s) => ({ ...s, name: e.target.value }))}
                                    style={inputStyle}
                                />
                            </label>

                            <label style={labelStyle}>
                                Email
                                <input
                                    type="email"
                                    value={form.email ?? ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((s) => ({ ...s, email: e.target.value }))}
                                    style={inputStyle}
                                />
                            </label>

                            <label style={labelStyle}>
                                Bio
                                <textarea
                                    value={form.bio ?? ''}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((s) => ({ ...s, bio: e.target.value }))}
                                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                                />
                            </label>

                            <label style={labelStyle}>
                                Avatar URL
                                <input
                                    value={form.avatarUrl ?? ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((s) => ({ ...s, avatarUrl: e.target.value }))}
                                    style={inputStyle}
                                />
                            </label>

                            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                                <button type="submit" disabled={loading} style={buttonStyle}>
                                    {loading ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false)
                                        setForm({ name: user?.name, email: user?.email, bio: user?.bio, avatarUrl: user?.avatarUrl })
                                        setError(null)
                                        setMessage(null)
                                    }}
                                    style={secondaryButtonStyle}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

/* Simple inline styles to keep the file self-contained */
const buttonStyle: React.CSSProperties = {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
}

const secondaryButtonStyle: React.CSSProperties = {
    background: 'transparent',
    color: '#374151',
    border: '1px solid #e5e7eb',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 10,
    fontSize: 13,
    color: '#111827',
}

const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '8px 10px',
    marginTop: 6,
    borderRadius: 6,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    boxSizing: 'border-box',
}
