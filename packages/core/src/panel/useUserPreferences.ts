/**
 * User Preferences Hook
 * Manages user preferences with persistence
 */

import { useState, useEffect, useCallback } from 'react'

export interface UserPreferences {
  /** User's preferred theme */
  theme?: 'light' | 'dark' | 'system'

  /** User's preferred language */
  language?: string

  /** User's preferred timezone */
  timezone?: string

  /** Sidebar collapsed state */
  sidebarCollapsed?: boolean

  /** Table density preference */
  tableDensity?: 'compact' | 'comfortable' | 'spacious'

  /** Items per page preference */
  itemsPerPage?: number

  /** Notification preferences */
  notifications?: {
    email?: boolean
    push?: boolean
    inApp?: boolean
  }

  /** Custom user preferences */
  [key: string]: any
}

export interface UseUserPreferencesOptions {
  /** Initial preferences */
  initialPreferences?: UserPreferences

  /** Storage key for persistence */
  storageKey?: string

  /** Storage type */
  storageType?: 'localStorage' | 'sessionStorage' | 'none'

  /** Callback when preferences change */
  onChange?: (preferences: UserPreferences) => void | Promise<void>

  /** Sync preferences with server */
  syncWithServer?: boolean

  /** Save preferences to server */
  saveToServer?: (preferences: UserPreferences) => Promise<void>

  /** Load preferences from server */
  loadFromServer?: () => Promise<UserPreferences>
}

/**
 * Hook for managing user preferences with persistence
 */
export function useUserPreferences({
  initialPreferences = {},
  storageKey = 'user-preferences',
  storageType = 'localStorage',
  onChange,
  syncWithServer = false,
  saveToServer,
  loadFromServer,
}: UseUserPreferencesOptions = {}) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    // Try to load from storage first
    if (storageType !== 'none' && typeof window !== 'undefined') {
      const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage
      const stored = storage.getItem(storageKey)

      if (stored) {
        try {
          return { ...initialPreferences, ...JSON.parse(stored) }
        } catch (error) {
          console.error('Failed to parse stored preferences:', error)
        }
      }
    }

    return initialPreferences
  })

  const [isLoading, setIsLoading] = useState(syncWithServer)
  const [isSaving, setIsSaving] = useState(false)

  // Load from server on mount
  useEffect(() => {
    if (syncWithServer && loadFromServer) {
      setIsLoading(true)
      loadFromServer()
        .then((serverPreferences) => {
          setPreferencesState((prev) => ({ ...prev, ...serverPreferences }))
        })
        .catch((error) => {
          console.error('Failed to load preferences from server:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [syncWithServer, loadFromServer])

  // Save to storage whenever preferences change
  useEffect(() => {
    if (storageType !== 'none' && typeof window !== 'undefined') {
      const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage

      try {
        storage.setItem(storageKey, JSON.stringify(preferences))
      } catch (error) {
        console.error('Failed to save preferences to storage:', error)
      }
    }

    // Call onChange callback
    onChange?.(preferences)
  }, [preferences, storageKey, storageType, onChange])

  /**
   * Update a single preference
   */
  const setPreference = useCallback(
    async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      const newPreferences = { ...preferences, [key]: value }
      setPreferencesState(newPreferences)

      // Sync with server if enabled
      if (syncWithServer && saveToServer) {
        setIsSaving(true)
        try {
          await saveToServer(newPreferences)
        } catch (error) {
          console.error('Failed to save preferences to server:', error)
        } finally {
          setIsSaving(false)
        }
      }
    },
    [preferences, syncWithServer, saveToServer]
  )

  /**
   * Update multiple preferences at once
   */
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      const newPreferences = { ...preferences, ...updates }
      setPreferencesState(newPreferences)

      // Sync with server if enabled
      if (syncWithServer && saveToServer) {
        setIsSaving(true)
        try {
          await saveToServer(newPreferences)
        } catch (error) {
          console.error('Failed to save preferences to server:', error)
        } finally {
          setIsSaving(false)
        }
      }
    },
    [preferences, syncWithServer, saveToServer]
  )

  /**
   * Get a single preference value
   */
  const getPreference = useCallback(
    <K extends keyof UserPreferences>(key: K, defaultValue?: UserPreferences[K]): UserPreferences[K] | undefined => {
      return preferences[key] !== undefined ? preferences[key] : defaultValue
    },
    [preferences]
  )

  /**
   * Check if a preference exists
   */
  const hasPreference = useCallback(
    (key: keyof UserPreferences): boolean => {
      return preferences[key] !== undefined
    },
    [preferences]
  )

  /**
   * Remove a preference
   */
  const removePreference = useCallback(
    async (key: keyof UserPreferences) => {
      const newPreferences = { ...preferences }
      delete newPreferences[key]
      setPreferencesState(newPreferences)

      // Sync with server if enabled
      if (syncWithServer && saveToServer) {
        setIsSaving(true)
        try {
          await saveToServer(newPreferences)
        } catch (error) {
          console.error('Failed to save preferences to server:', error)
        } finally {
          setIsSaving(false)
        }
      }
    },
    [preferences, syncWithServer, saveToServer]
  )

  /**
   * Clear all preferences
   */
  const clearPreferences = useCallback(async () => {
    setPreferencesState({})

    // Clear from storage
    if (storageType !== 'none' && typeof window !== 'undefined') {
      const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage
      storage.removeItem(storageKey)
    }

    // Sync with server if enabled
    if (syncWithServer && saveToServer) {
      setIsSaving(true)
      try {
        await saveToServer({})
      } catch (error) {
        console.error('Failed to clear preferences on server:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }, [storageType, storageKey, syncWithServer, saveToServer])

  /**
   * Reset preferences to initial values
   */
  const resetPreferences = useCallback(async () => {
    setPreferencesState(initialPreferences)

    // Sync with server if enabled
    if (syncWithServer && saveToServer) {
      setIsSaving(true)
      try {
        await saveToServer(initialPreferences)
      } catch (error) {
        console.error('Failed to reset preferences on server:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }, [initialPreferences, syncWithServer, saveToServer])

  return {
    preferences,
    setPreference,
    updatePreferences,
    getPreference,
    hasPreference,
    removePreference,
    clearPreferences,
    resetPreferences,
    isLoading,
    isSaving,
  }
}
