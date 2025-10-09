/**
 * Server Validation Error Hook
 * Utility for handling server-side validation errors in forms
 */

import { useEffect } from 'react'
import type { FieldErrors, UseFormSetError } from 'react-hook-form'

export interface ServerError {
  field: string
  message: string
}

export interface ServerErrorResponse {
  errors?: ServerError[]
  message?: string
}

/**
 * Hook to apply server validation errors to form fields
 *
 * @example
 * ```tsx
 * const { setError } = useForm()
 * const mutation = useMutation({
 *   onError: (error) => {
 *     applyServerErrors(error.response?.data, setError)
 *   }
 * })
 * ```
 */
export function applyServerErrors<TFieldValues extends Record<string, any>>(
  serverResponse: ServerErrorResponse | undefined,
  setError: UseFormSetError<TFieldValues>
): void {
  if (!serverResponse) return

  // Handle array of field errors
  if (serverResponse.errors && Array.isArray(serverResponse.errors)) {
    serverResponse.errors.forEach((error) => {
      setError(error.field as any, {
        type: 'server',
        message: error.message,
      })
    })
  }

  // Handle generic error message as root error
  if (serverResponse.message && !serverResponse.errors) {
    setError('root.server' as any, {
      type: 'server',
      message: serverResponse.message,
    })
  }
}

/**
 * Hook to automatically apply server errors when they change
 *
 * @example
 * ```tsx
 * const { setError } = useForm()
 * const mutation = useMutation(...)
 *
 * useServerErrors(mutation.error?.response?.data, setError)
 * ```
 */
export function useServerErrors<TFieldValues extends Record<string, any>>(
  serverResponse: ServerErrorResponse | undefined,
  setError: UseFormSetError<TFieldValues>
): void {
  useEffect(() => {
    if (serverResponse) {
      applyServerErrors(serverResponse, setError)
    }
  }, [serverResponse, setError])
}

/**
 * Transform Laravel-style errors to ServerError format
 *
 * @example
 * ```tsx
 * const laravelErrors = {
 *   email: ['The email is invalid'],
 *   password: ['Password must be at least 8 characters']
 * }
 * const errors = transformLaravelErrors(laravelErrors)
 * // => [{ field: 'email', message: 'The email is invalid' }, ...]
 * ```
 */
export function transformLaravelErrors(
  errors: Record<string, string[]>
): ServerError[] {
  return Object.entries(errors).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message }))
  )
}

/**
 * Transform validation errors from various backend formats
 */
export function transformServerErrors(
  response: any
): ServerErrorResponse | undefined {
  if (!response) return undefined

  // Laravel format: { errors: { field: ['message'] } }
  if (response.errors && typeof response.errors === 'object' && !Array.isArray(response.errors)) {
    return {
      errors: transformLaravelErrors(response.errors),
      message: response.message,
    }
  }

  // Already in correct format: { errors: [{ field, message }] }
  if (response.errors && Array.isArray(response.errors)) {
    return response
  }

  // Generic error: { message: 'error' }
  if (response.message) {
    return { message: response.message }
  }

  return undefined
}
