import { useState, useEffect } from 'react'

const STORAGE_KEY = 'aguilang_profiles'
const ACTIVE_KEY = 'aguilang_active_profile'

const DEFAULT_PROFILES = [
  { id: 'kartal', name: 'Kartal', avatar: '🦅', color: 'amber' },
  { id: 'emir',   name: 'Emir',   avatar: '⚡', color: 'blue'  },
]

export function useProfile() {
  const [profiles] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_PROFILES
    } catch {
      return DEFAULT_PROFILES
    }
  })

  const [activeProfile, setActiveProfileState] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const setActiveProfile = (profile) => {
    setActiveProfileState(profile)
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(profile))
  }

  const clearActiveProfile = () => {
    setActiveProfileState(null)
    localStorage.removeItem(ACTIVE_KEY)
  }

  return { profiles, activeProfile, setActiveProfile, clearActiveProfile }
}
