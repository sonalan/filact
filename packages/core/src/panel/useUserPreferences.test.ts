import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserPreferences, type UserPreferences } from './useUserPreferences'

describe('useUserPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Initial State', () => {
    it('should initialize with empty preferences', () => {
      const { result } = renderHook(() => useUserPreferences())

      expect(result.current.preferences).toEqual({})
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSaving).toBe(false)
    })

    it('should initialize with provided initial preferences', () => {
      const initialPreferences: UserPreferences = {
        theme: 'dark',
        language: 'en',
      }

      const { result } = renderHook(() =>
        useUserPreferences({ initialPreferences })
      )

      expect(result.current.preferences).toEqual(initialPreferences)
    })

    it('should load preferences from localStorage on mount', () => {
      const storedPreferences: UserPreferences = {
        theme: 'light',
        language: 'tr',
      }

      localStorage.setItem('user-preferences', JSON.stringify(storedPreferences))

      const { result } = renderHook(() => useUserPreferences())

      expect(result.current.preferences).toEqual(storedPreferences)
    })

    it('should merge initial preferences with stored preferences', () => {
      const initialPreferences: UserPreferences = {
        theme: 'dark',
        language: 'en',
      }

      const storedPreferences: UserPreferences = {
        language: 'tr',
      }

      localStorage.setItem('user-preferences', JSON.stringify(storedPreferences))

      const { result } = renderHook(() =>
        useUserPreferences({ initialPreferences })
      )

      expect(result.current.preferences).toEqual({
        theme: 'dark',
        language: 'tr',
      })
    })

    it('should use custom storage key', () => {
      const storedPreferences: UserPreferences = {
        theme: 'light',
      }

      localStorage.setItem('custom-key', JSON.stringify(storedPreferences))

      const { result } = renderHook(() =>
        useUserPreferences({ storageKey: 'custom-key' })
      )

      expect(result.current.preferences).toEqual(storedPreferences)
    })

    it('should use sessionStorage when specified', () => {
      const storedPreferences: UserPreferences = {
        theme: 'dark',
      }

      sessionStorage.setItem('user-preferences', JSON.stringify(storedPreferences))

      const { result } = renderHook(() =>
        useUserPreferences({ storageType: 'sessionStorage' })
      )

      expect(result.current.preferences).toEqual(storedPreferences)
    })

    it('should not load from storage when storageType is none', () => {
      const storedPreferences: UserPreferences = {
        theme: 'light',
      }

      localStorage.setItem('user-preferences', JSON.stringify(storedPreferences))

      const { result } = renderHook(() =>
        useUserPreferences({ storageType: 'none' })
      )

      expect(result.current.preferences).toEqual({})
    })
  })

  describe('Setting Preferences', () => {
    it('should set a single preference', async () => {
      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await result.current.setPreference('theme', 'dark')
      })

      expect(result.current.preferences.theme).toBe('dark')
    })

    it('should update multiple preferences', async () => {
      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await result.current.updatePreferences({
          theme: 'dark',
          language: 'en',
        })
      })

      expect(result.current.preferences).toEqual({
        theme: 'dark',
        language: 'en',
      })
    })

    it('should persist preferences to localStorage', async () => {
      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await result.current.setPreference('theme', 'dark')
      })

      const stored = localStorage.getItem('user-preferences')
      expect(stored).toBeTruthy()
      expect(JSON.parse(stored!)).toEqual({ theme: 'dark' })
    })

    it('should not persist when storageType is none', async () => {
      const { result } = renderHook(() =>
        useUserPreferences({ storageType: 'none' })
      )

      await act(async () => {
        await result.current.setPreference('theme', 'dark')
      })

      expect(localStorage.getItem('user-preferences')).toBeNull()
    })

    it('should call onChange callback when preferences change', async () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useUserPreferences({ onChange }))

      await act(async () => {
        await result.current.setPreference('theme', 'dark')
      })

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'dark' })
      )
    })
  })

  describe('Getting Preferences', () => {
    it('should get a preference value', () => {
      const { result } = renderHook(() =>
        useUserPreferences({
          initialPreferences: { theme: 'dark' },
        })
      )

      expect(result.current.getPreference('theme')).toBe('dark')
    })

    it('should return default value when preference does not exist', () => {
      const { result } = renderHook(() => useUserPreferences())

      expect(result.current.getPreference('theme', 'light')).toBe('light')
    })

    it('should check if preference exists', () => {
      const { result } = renderHook(() =>
        useUserPreferences({
          initialPreferences: { theme: 'dark' },
        })
      )

      expect(result.current.hasPreference('theme')).toBe(true)
      expect(result.current.hasPreference('language')).toBe(false)
    })
  })

  describe('Removing Preferences', () => {
    it('should remove a single preference', async () => {
      const { result } = renderHook(() =>
        useUserPreferences({
          initialPreferences: { theme: 'dark', language: 'en' },
        })
      )

      await act(async () => {
        await result.current.removePreference('theme')
      })

      expect(result.current.preferences).toEqual({ language: 'en' })
    })

    it('should clear all preferences', async () => {
      const { result } = renderHook(() =>
        useUserPreferences({
          initialPreferences: { theme: 'dark', language: 'en' },
        })
      )

      await act(async () => {
        await result.current.clearPreferences()
      })

      await waitFor(() => {
        expect(result.current.preferences).toEqual({})
      })

      // Storage item is removed in clearPreferences, but useEffect sets it back to '{}'
      // This is expected behavior - the preference state is saved to storage
      const stored = localStorage.getItem('user-preferences')
      expect(stored).toBe('{}')
    })

    it('should reset to initial preferences', async () => {
      const initialPreferences: UserPreferences = {
        theme: 'dark',
        language: 'en',
      }

      const { result } = renderHook(() =>
        useUserPreferences({ initialPreferences })
      )

      await act(async () => {
        await result.current.setPreference('theme', 'light')
      })

      expect(result.current.preferences.theme).toBe('light')

      await act(async () => {
        await result.current.resetPreferences()
      })

      expect(result.current.preferences).toEqual(initialPreferences)
    })
  })

  describe('Server Sync', () => {
    it('should load preferences from server on mount', async () => {
      const serverPreferences: UserPreferences = {
        theme: 'dark',
        language: 'en',
      }

      const loadFromServer = vi.fn().mockResolvedValue(serverPreferences)

      const { result } = renderHook(() =>
        useUserPreferences({
          syncWithServer: true,
          loadFromServer,
        })
      )

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(loadFromServer).toHaveBeenCalled()
      expect(result.current.preferences).toEqual(serverPreferences)
    })

    it('should save preferences to server when setting', async () => {
      const saveToServer = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useUserPreferences({
          syncWithServer: true,
          saveToServer,
        })
      )

      await act(async () => {
        await result.current.setPreference('theme', 'dark')
      })

      await waitFor(() => {
        expect(saveToServer).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'dark' })
        )
      })
    })

    it('should show saving state while syncing', async () => {
      const saveToServer = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() =>
        useUserPreferences({
          syncWithServer: true,
          saveToServer,
        })
      )

      act(() => {
        result.current.setPreference('theme', 'dark')
      })

      // Wait for isSaving to become true
      await waitFor(() => {
        expect(result.current.isSaving).toBe(true)
      })

      // Wait for it to complete
      await waitFor(() => {
        expect(result.current.isSaving).toBe(false)
      })
    })

    it('should handle server load errors gracefully', async () => {
      const loadFromServer = vi.fn().mockRejectedValue(new Error('Server error'))
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() =>
        useUserPreferences({
          syncWithServer: true,
          loadFromServer,
        })
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(consoleError).toHaveBeenCalled()
      expect(result.current.preferences).toEqual({})

      consoleError.mockRestore()
    })

    it('should handle server save errors gracefully', async () => {
      const saveToServer = vi.fn().mockRejectedValue(new Error('Server error'))
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() =>
        useUserPreferences({
          syncWithServer: true,
          saveToServer,
        })
      )

      await act(async () => {
        await result.current.setPreference('theme', 'dark')
      })

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false)
      })

      expect(consoleError).toHaveBeenCalled()
      // Preference should still be set locally even if server save fails
      expect(result.current.preferences.theme).toBe('dark')

      consoleError.mockRestore()
    })
  })

  describe('Complex Preferences', () => {
    it('should handle nested preference objects', async () => {
      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await result.current.setPreference('notifications', {
          email: true,
          push: false,
          inApp: true,
        })
      })

      expect(result.current.preferences.notifications).toEqual({
        email: true,
        push: false,
        inApp: true,
      })
    })

    it('should handle custom preferences', async () => {
      const { result } = renderHook(() => useUserPreferences())

      await act(async () => {
        await result.current.setPreference('customSetting', 'customValue')
      })

      expect(result.current.getPreference('customSetting')).toBe('customValue')
    })
  })
})
