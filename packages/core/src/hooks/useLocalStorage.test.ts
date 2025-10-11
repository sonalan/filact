import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should return initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

      expect(result.current[0]).toBe('initial')
    })

    it('should return stored value from localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify('stored'))

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

      expect(result.current[0]).toBe('stored')
    })

    it('should update localStorage when value changes', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      expect(result.current[0]).toBe('updated')
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))
    })

    it('should remove value from localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'))

      act(() => {
        result.current[2]() // removeValue
      })

      expect(result.current[0]).toBe('initial')
      expect(localStorage.getItem('test-key')).toBeNull()
    })
  })

  describe('Functional Updates', () => {
    it('should support functional updates', () => {
      const { result } = renderHook(() => useLocalStorage('counter', 0))

      act(() => {
        result.current[1]((prev) => prev + 1)
      })

      expect(result.current[0]).toBe(1)

      act(() => {
        result.current[1]((prev) => prev + 1)
      })

      expect(result.current[0]).toBe(2)
    })

    it('should support functional updates with objects', () => {
      const { result } = renderHook(() =>
        useLocalStorage('user', { name: 'John', age: 30 })
      )

      act(() => {
        result.current[1]((prev) => ({ ...prev, age: 31 }))
      })

      expect(result.current[0]).toEqual({ name: 'John', age: 31 })
    })
  })

  describe('Data Types', () => {
    it('should work with strings', () => {
      const { result } = renderHook(() => useLocalStorage('string', 'hello'))

      act(() => {
        result.current[1]('world')
      })

      expect(result.current[0]).toBe('world')
    })

    it('should work with numbers', () => {
      const { result } = renderHook(() => useLocalStorage('number', 42))

      act(() => {
        result.current[1](100)
      })

      expect(result.current[0]).toBe(100)
    })

    it('should work with booleans', () => {
      const { result } = renderHook(() => useLocalStorage('boolean', false))

      act(() => {
        result.current[1](true)
      })

      expect(result.current[0]).toBe(true)
    })

    it('should work with objects', () => {
      const obj = { name: 'John', age: 30 }
      const { result } = renderHook(() => useLocalStorage('object', obj))

      const newObj = { name: 'Jane', age: 25 }

      act(() => {
        result.current[1](newObj)
      })

      expect(result.current[0]).toEqual(newObj)
    })

    it('should work with arrays', () => {
      const { result } = renderHook(() => useLocalStorage('array', [1, 2, 3]))

      act(() => {
        result.current[1]([4, 5, 6])
      })

      expect(result.current[0]).toEqual([4, 5, 6])
    })

    it('should work with null', () => {
      const { result } = renderHook(() => useLocalStorage('null', null))

      expect(result.current[0]).toBeNull()

      act(() => {
        result.current[1]('not null' as any)
      })

      expect(result.current[0]).toBe('not null')
    })
  })

  describe('Custom Serialization', () => {
    it('should use custom serializer', () => {
      const serializer = (value: Date) => value.toISOString()
      const deserializer = (value: string) => new Date(value)

      const date = new Date('2024-01-15')

      const { result } = renderHook(() =>
        useLocalStorage('date', date, { serializer, deserializer })
      )

      // Update value to trigger serializer
      act(() => {
        result.current[1](date)
      })

      expect(result.current[0]).toEqual(date)
      expect(localStorage.getItem('date')).toBe(date.toISOString())
    })

    it('should use custom deserializer', () => {
      const serializer = (value: number) => value.toString()
      const deserializer = (value: string) => parseInt(value, 10)

      localStorage.setItem('number', '42')

      const { result } = renderHook(() =>
        useLocalStorage('number', 0, { serializer, deserializer })
      )

      expect(result.current[0]).toBe(42)
    })
  })

  describe('Cross-Tab Sync', () => {
    it('should sync value across tabs when enabled', () => {
      const { result } = renderHook(() =>
        useLocalStorage('sync-test', 'initial', { syncAcrossTabs: true })
      )

      expect(result.current[0]).toBe('initial')

      // Simulate storage event from another tab
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'sync-test',
          newValue: JSON.stringify('from-other-tab'),
          oldValue: JSON.stringify('initial'),
        })
        window.dispatchEvent(event)
      })

      expect(result.current[0]).toBe('from-other-tab')
    })

    it('should not sync value across tabs when disabled', () => {
      const { result } = renderHook(() =>
        useLocalStorage('no-sync-test', 'initial', { syncAcrossTabs: false })
      )

      expect(result.current[0]).toBe('initial')

      // Simulate storage event from another tab
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'no-sync-test',
          newValue: JSON.stringify('from-other-tab'),
          oldValue: JSON.stringify('initial'),
        })
        window.dispatchEvent(event)
      })

      // Value should not change
      expect(result.current[0]).toBe('initial')
    })

    it('should reset to initial value when storage is cleared in another tab', () => {
      const { result } = renderHook(() =>
        useLocalStorage('clear-test', 'initial', { syncAcrossTabs: true })
      )

      act(() => {
        result.current[1]('updated')
      })

      expect(result.current[0]).toBe('updated')

      // Simulate storage event where value is removed
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'clear-test',
          newValue: null,
          oldValue: JSON.stringify('updated'),
        })
        window.dispatchEvent(event)
      })

      expect(result.current[0]).toBe('initial')
    })

    it('should ignore storage events for different keys', () => {
      const { result } = renderHook(() =>
        useLocalStorage('key1', 'value1', { syncAcrossTabs: true })
      )

      // Simulate storage event for different key
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'key2',
          newValue: JSON.stringify('value2'),
          oldValue: null,
        })
        window.dispatchEvent(event)
      })

      // Value should not change
      expect(result.current[0]).toBe('value1')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('invalid-json', 'not valid json{')

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { result } = renderHook(() => useLocalStorage('invalid-json', 'fallback'))

      expect(result.current[0]).toBe('fallback')
      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('should handle localStorage quota exceeded', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Mock localStorage.setItem to throw quota exceeded error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const { result } = renderHook(() => useLocalStorage('test', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('should handle errors during removeValue', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Mock localStorage.removeItem to throw
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Remove error')
      })

      const { result } = renderHook(() => useLocalStorage('test', 'initial'))

      act(() => {
        result.current[2]()
      })

      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('should handle invalid storage event data', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { result } = renderHook(() =>
        useLocalStorage('parse-error', 'initial', { syncAcrossTabs: true })
      )

      // Simulate storage event with invalid JSON
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'parse-error',
          newValue: 'invalid json{',
          oldValue: JSON.stringify('initial'),
        })
        window.dispatchEvent(event)
      })

      expect(consoleWarnSpy).toHaveBeenCalled()
      // Value should remain unchanged
      expect(result.current[0]).toBe('initial')
    })
  })

  describe('SSR Support', () => {
    it.skip('should return initial value on server side', () => {
      // Skip this test as it's not possible to properly test SSR
      // in a browser environment with jsdom
    })
  })

  describe('Multiple Hook Instances', () => {
    it('should sync multiple hooks with same key', () => {
      const { result: result1, unmount: unmount1 } = renderHook(() =>
        useLocalStorage('shared-key', 'initial')
      )
      const { result: result2, unmount: unmount2 } = renderHook(() =>
        useLocalStorage('shared-key', 'initial')
      )

      try {
        expect(result1.current[0]).toBe('initial')
        expect(result2.current[0]).toBe('initial')

        act(() => {
          result1.current[1]('updated')
        })

        expect(result1.current[0]).toBe('updated')

        // Simulate storage event to sync
        act(() => {
          const event = new StorageEvent('storage', {
            key: 'shared-key',
            newValue: JSON.stringify('updated'),
            oldValue: JSON.stringify('initial'),
          })
          window.dispatchEvent(event)
        })

        expect(result2.current[0]).toBe('updated')
      } finally {
        // Clean up in correct order
        unmount2()
        unmount1()
      }
    })
  })
})
