import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import {
  applyServerErrors,
  useServerErrors,
  transformLaravelErrors,
  transformServerErrors,
  type ServerErrorResponse,
} from './useServerErrors'

describe('useServerErrors', () => {
  describe('applyServerErrors', () => {
    it('should apply field errors to form', () => {
      const setError = vi.fn()
      const response: ServerErrorResponse = {
        errors: [
          { field: 'email', message: 'Email is invalid' },
          { field: 'password', message: 'Password is too short' },
        ],
      }

      applyServerErrors(response, setError)

      expect(setError).toHaveBeenCalledTimes(2)
      expect(setError).toHaveBeenCalledWith('email', {
        type: 'server',
        message: 'Email is invalid',
      })
      expect(setError).toHaveBeenCalledWith('password', {
        type: 'server',
        message: 'Password is too short',
      })
    })

    it('should apply root error when only message is provided', () => {
      const setError = vi.fn()
      const response: ServerErrorResponse = {
        message: 'Server error occurred',
      }

      applyServerErrors(response, setError)

      expect(setError).toHaveBeenCalledTimes(1)
      expect(setError).toHaveBeenCalledWith('root.server', {
        type: 'server',
        message: 'Server error occurred',
      })
    })

    it('should not apply root error when errors array exists', () => {
      const setError = vi.fn()
      const response: ServerErrorResponse = {
        errors: [{ field: 'email', message: 'Invalid' }],
        message: 'Validation failed',
      }

      applyServerErrors(response, setError)

      expect(setError).toHaveBeenCalledTimes(1)
      expect(setError).toHaveBeenCalledWith('email', {
        type: 'server',
        message: 'Invalid',
      })
    })

    it('should handle undefined response', () => {
      const setError = vi.fn()

      applyServerErrors(undefined, setError)

      expect(setError).not.toHaveBeenCalled()
    })

    it('should handle empty errors array', () => {
      const setError = vi.fn()
      const response: ServerErrorResponse = {
        errors: [],
      }

      applyServerErrors(response, setError)

      expect(setError).not.toHaveBeenCalled()
    })
  })

  describe('useServerErrors hook', () => {
    it('should apply errors when serverResponse changes', () => {
      const setError = vi.fn()
      const response: ServerErrorResponse = {
        errors: [{ field: 'email', message: 'Invalid email' }],
      }

      const { rerender } = renderHook(
        ({ serverResponse }) => useServerErrors(serverResponse, setError),
        {
          initialProps: { serverResponse: undefined },
        }
      )

      expect(setError).not.toHaveBeenCalled()

      rerender({ serverResponse: response })

      expect(setError).toHaveBeenCalledWith('email', {
        type: 'server',
        message: 'Invalid email',
      })
    })

    it('should not apply errors on initial render with undefined', () => {
      const setError = vi.fn()

      renderHook(() => useServerErrors(undefined, setError))

      expect(setError).not.toHaveBeenCalled()
    })
  })

  describe('transformLaravelErrors', () => {
    it('should transform Laravel error format', () => {
      const laravelErrors = {
        email: ['The email is invalid', 'The email is already taken'],
        password: ['Password must be at least 8 characters'],
      }

      const result = transformLaravelErrors(laravelErrors)

      expect(result).toEqual([
        { field: 'email', message: 'The email is invalid' },
        { field: 'email', message: 'The email is already taken' },
        { field: 'password', message: 'Password must be at least 8 characters' },
      ])
    })

    it('should handle empty Laravel errors', () => {
      const result = transformLaravelErrors({})

      expect(result).toEqual([])
    })

    it('should handle single error per field', () => {
      const laravelErrors = {
        username: ['Username is required'],
      }

      const result = transformLaravelErrors(laravelErrors)

      expect(result).toEqual([
        { field: 'username', message: 'Username is required' },
      ])
    })
  })

  describe('transformServerErrors', () => {
    it('should transform Laravel format', () => {
      const response = {
        message: 'Validation failed',
        errors: {
          email: ['Invalid email'],
          password: ['Too short'],
        },
      }

      const result = transformServerErrors(response)

      expect(result).toEqual({
        message: 'Validation failed',
        errors: [
          { field: 'email', message: 'Invalid email' },
          { field: 'password', message: 'Too short' },
        ],
      })
    })

    it('should pass through correct format', () => {
      const response = {
        errors: [
          { field: 'email', message: 'Invalid' },
        ],
      }

      const result = transformServerErrors(response)

      expect(result).toEqual(response)
    })

    it('should handle generic error message', () => {
      const response = {
        message: 'Server error',
      }

      const result = transformServerErrors(response)

      expect(result).toEqual({
        message: 'Server error',
      })
    })

    it('should handle undefined response', () => {
      const result = transformServerErrors(undefined)

      expect(result).toBeUndefined()
    })

    it('should handle null response', () => {
      const result = transformServerErrors(null)

      expect(result).toBeUndefined()
    })

    it('should handle empty object', () => {
      const result = transformServerErrors({})

      expect(result).toBeUndefined()
    })
  })
})
