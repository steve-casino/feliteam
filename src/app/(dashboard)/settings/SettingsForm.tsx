'use client'

import React, { useState, useTransition } from 'react'
import { LogOut, Save, KeyRound, User as UserIcon } from 'lucide-react'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import { updateProfile, changePassword, signOut } from './actions'

interface SettingsFormProps {
  email: string
  fullName: string
  avatarUrl: string
  role: string
}

type Feedback = { kind: 'success' | 'error'; text: string } | null

const SettingsForm: React.FC<SettingsFormProps> = ({
  email,
  fullName: initialFullName,
  avatarUrl: initialAvatarUrl,
  role,
}) => {
  const [fullName, setFullName] = useState(initialFullName)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null)
  const [savingProfile, startSaveProfile] = useTransition()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null)
  const [savingPassword, startSavePassword] = useTransition()

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileFeedback(null)
    startSaveProfile(async () => {
      const result = await updateProfile({ fullName, avatarUrl })
      setProfileFeedback(
        result.ok
          ? { kind: 'success', text: result.message ?? 'Saved' }
          : { kind: 'error', text: result.error ?? 'Failed to save' }
      )
    })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordFeedback(null)
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ kind: 'error', text: 'Passwords do not match' })
      return
    }
    startSavePassword(async () => {
      const result = await changePassword(newPassword)
      if (result.ok) {
        setNewPassword('')
        setConfirmPassword('')
      }
      setPasswordFeedback(
        result.ok
          ? { kind: 'success', text: result.message ?? 'Updated' }
          : { kind: 'error', text: result.error ?? 'Failed to update password' }
      )
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/60 mt-1">Manage your profile and account security</p>
      </div>

      <Card>
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-white/80">
            <UserIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          <div className="flex items-center gap-4">
            <Avatar name={fullName || email} src={avatarUrl || undefined} size="lg" />
            <div className="text-sm text-white/60">
              <div>{email}</div>
              <div className="capitalize">{role.replace('_', ' ')}</div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-navy border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-navy border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                placeholder="https://..."
              />
            </div>

            {profileFeedback && (
              <p
                className={`text-sm ${
                  profileFeedback.kind === 'success' ? 'text-teal-400' : 'text-red-400'
                }`}
              >
                {profileFeedback.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </Card>

      <Card>
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-white/80">
            <KeyRound className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-navy border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-navy border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                minLength={8}
                required
              />
            </div>

            {passwordFeedback && (
              <p
                className={`text-sm ${
                  passwordFeedback.kind === 'success' ? 'text-teal-400' : 'text-red-400'
                }`}
              >
                {passwordFeedback.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold rounded-lg transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Sign out</h2>
            <p className="text-sm text-white/60">End your session on this device.</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 font-semibold rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default SettingsForm
