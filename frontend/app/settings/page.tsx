'use client'

import React, { useEffect, useState } from 'react'

type SubmitState = 'idle' | 'saving' | 'success' | 'error'

export default function SettingsPage() {
    // Profile
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')

    // Password
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Preferences
    const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')
    const [emailNotifications, setEmailNotifications] = useState(true)

    // UI states
    const [profileState, setProfileState] = useState<SubmitState>('idle')
    const [passwordState, setPasswordState] = useState<SubmitState>('idle')
    const [prefsState, setPrefsState] = useState<SubmitState>('idle')
    const [deleteState, setDeleteState] = useState<SubmitState>('idle')
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        // Load current settings from API (fallback to sensible defaults)
        let mounted = true
        async function load() {
            try {
                const res = await fetch('/api/settings', { method: 'GET' })
                if (!res.ok) return
                const data = await res.json()
                if (!mounted) return
                setName(data.name ?? '')
                setEmail(data.email ?? '')
                setTheme(data.theme ?? 'system')
                setEmailNotifications(Boolean(data.emailNotifications))
            } catch {
                // ignore, keep defaults
            }
        }
        load()
        return () => {
            mounted = false
        }
    }, [])

    async function handleProfileSave(e?: React.FormEvent) {
        e?.preventDefault()
        setProfileState('saving')
        setMessage(null)
        try {
            const res = await fetch('/api/settings/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email }),
            })
            if (!res.ok) throw new Error('Failed to save profile')
            setProfileState('success')
            setMessage('Profile saved.')
        } catch (err) {
            setProfileState('error')
            setMessage((err as Error).message || 'Error saving profile')
        } finally {
            setTimeout(() => setProfileState('idle'), 1500)
        }
    }

    async function handlePasswordSave(e: React.FormEvent) {
        e.preventDefault()
        setMessage(null)
        if (newPassword.length < 8) {
            setMessage('New password must be at least 8 characters.')
            return
        }
        if (newPassword !== confirmPassword) {
            setMessage('New password and confirmation do not match.')
            return
        }
        setPasswordState('saving')
        try {
            const res = await fetch('/api/settings/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.message ?? 'Failed to update password')
            }
            setPasswordState('success')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setMessage('Password updated.')
        } catch (err) {
            setPasswordState('error')
            setMessage((err as Error).message || 'Error updating password')
        } finally {
            setTimeout(() => setPasswordState('idle'), 1500)
        }
    }

    async function handlePrefsSave(e?: React.FormEvent) {
        e?.preventDefault()
        setPrefsState('saving')
        setMessage(null)
        try {
            const res = await fetch('/api/settings/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme, emailNotifications }),
            })
            if (!res.ok) throw new Error('Failed to save preferences')
            setPrefsState('success')
            setMessage('Preferences saved.')
        } catch (err) {
            setPrefsState('error')
            setMessage((err as Error).message || 'Error saving preferences')
        } finally {
            setTimeout(() => setPrefsState('idle'), 1500)
        }
    }

    async function handleDeleteAccount() {
        if (!confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) {
            return
        }
        setDeleteState('saving')
        setMessage(null)
        try {
            const res = await fetch('/api/settings/delete', { method: 'POST' })
            if (!res.ok) throw new Error('Failed to delete account')
            setDeleteState('success')
            setMessage('Account deleted. You will be signed out.')
            // optionally redirect to goodbye page
            setTimeout(() => {
                window.location.href = '/'
            }, 1200)
        } catch (err) {
            setDeleteState('error')
            setMessage((err as Error).message || 'Error deleting account')
            setTimeout(() => setDeleteState('idle'), 1500)
        }
    }

    return (
        <div style={{ maxWidth: 900, margin: '32px auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
            <h1 style={{ marginBottom: 8 }}>Settings</h1>
            <p style={{ marginTop: 0, color: '#555' }}>Manage your profile, security and preferences.</p>

            <section style={{ marginTop: 24, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                <h2 style={{ margin: '0 0 8px 0' }}>Profile</h2>
                <form onSubmit={(e) => handleProfileSave(e)} style={{ display: 'grid', gap: 8 }}>
                    <label>
                        Name
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full name"
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </label>
                    <label>
                        Email
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            type="email"
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                            type="submit"
                            disabled={profileState === 'saving'}
                            style={{ padding: '8px 12px', cursor: profileState === 'saving' ? 'not-allowed' : 'pointer' }}
                        >
                            {profileState === 'saving' ? 'Saving...' : 'Save profile'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                // reload settings
                                setMessage(null)
                                setProfileState('idle')
                                // naive reload of saved values from server
                                fetch('/api/settings')
                                    .then((r) => r.json())
                                    .then((d) => {
                                        setName(d.name ?? '')
                                        setEmail(d.email ?? '')
                                    })
                                    .catch(() => {})
                            }}
                            style={{ padding: '8px 12px' }}
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </section>

            <section style={{ marginTop: 24, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                <h2 style={{ margin: '0 0 8px 0' }}>Security</h2>
                <form onSubmit={handlePasswordSave} style={{ display: 'grid', gap: 8 }}>
                    <label>
                        Current password
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </label>
                    <label>
                        New password
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </label>
                    <label>
                        Confirm new password
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: '100%', padding: 8, marginTop: 4 }}
                        />
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={passwordState === 'saving'} style={{ padding: '8px 12px' }}>
                            {passwordState === 'saving' ? 'Updating...' : 'Change password'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentPassword('')
                                setNewPassword('')
                                setConfirmPassword('')
                                setMessage(null)
                            }}
                            style={{ padding: '8px 12px' }}
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </section>

            <section style={{ marginTop: 24, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                <h2 style={{ margin: '0 0 8px 0' }}>Preferences</h2>
                <form onSubmit={(e) => handlePrefsSave(e)} style={{ display: 'grid', gap: 8 }}>
                    <label>
                        Theme
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                    type="radio"
                                    name="theme"
                                    checked={theme === 'system'}
                                    onChange={() => setTheme('system')}
                                />
                                System
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input type="radio" name="theme" checked={theme === 'light'} onChange={() => setTheme('light')} />
                                Light
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input type="radio" name="theme" checked={theme === 'dark'} onChange={() => setTheme('dark')} />
                                Dark
                            </label>
                        </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                        />
                        Receive email notifications
                    </label>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" disabled={prefsState === 'saving'} style={{ padding: '8px 12px' }}>
                            {prefsState === 'saving' ? 'Saving...' : 'Save preferences'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                // revert to last saved values by re-fetching
                                fetch('/api/settings')
                                    .then((r) => r.json())
                                    .then((d) => {
                                        setTheme(d.theme ?? 'system')
                                        setEmailNotifications(Boolean(d.emailNotifications))
                                        setMessage(null)
                                    })
                                    .catch(() => {})
                            }}
                            style={{ padding: '8px 12px' }}
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </section>

            <section style={{ marginTop: 24, padding: 16, border: '1px solid #fee', borderRadius: 8, background: '#fff6f6' }}>
                <h2 style={{ margin: '0 0 8px 0', color: '#900' }}>Danger zone</h2>
                <p style={{ marginTop: 0, color: '#600' }}>Delete your account and all associated data. This action is permanent.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={deleteState === 'saving'}
                        style={{
                            padding: '8px 12px',
                            background: '#900',
                            color: 'white',
                            border: 'none',
                            cursor: deleteState === 'saving' ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {deleteState === 'saving' ? 'Deleting…' : 'Delete account'}
                    </button>
                </div>
            </section>

            {message && (
                <div
                    role="status"
                    style={{
                        marginTop: 20,
                        padding: 12,
                        borderRadius: 6,
                        background: '#f0f4ff',
                        border: '1px solid #d6e0ff',
                        color: '#1a3aeb',
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    )
}