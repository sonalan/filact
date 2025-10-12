import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCopyToClipboard } from './useCopyToClipboard'

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    })
  })

  it('should return initial state', () => {
    const { result } = renderHook(() => useCopyToClipboard())

    expect(result.current[0].value).toBeNull()
    expect(result.current[0].error).toBeNull()
  })

  it('should copy text to clipboard', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current[1]('Hello World')
    })

    await waitFor(() => {
      expect(result.current[0].value).toBe('Hello World')
      expect(result.current[0].error).toBeNull()
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello World')
  })

  it('should handle copy error', async () => {
    const mockError = new Error('Copy failed')
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(mockError)

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current[1]('Test')
    })

    await waitFor(() => {
      expect(result.current[0].value).toBeNull()
      expect(result.current[0].error).toEqual(mockError)
    })
  })

  it('should handle missing clipboard API', async () => {
    // @ts-expect-error - removing clipboard API
    delete navigator.clipboard

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current[1]('Test')
    })

    await waitFor(() => {
      expect(result.current[0].value).toBeNull()
      expect(result.current[0].error?.message).toBe('Clipboard API not supported')
    })
  })

  it('should copy multiple times', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current[1]('First')
    })

    await waitFor(() => {
      expect(result.current[0].value).toBe('First')
    })

    await act(async () => {
      await result.current[1]('Second')
    })

    await waitFor(() => {
      expect(result.current[0].value).toBe('Second')
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(2)
  })

  it('should copy empty string', async () => {
    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current[1]('')
    })

    await waitFor(() => {
      expect(result.current[0].value).toBe('')
      expect(result.current[0].error).toBeNull()
    })
  })

  it('should copy long text', async () => {
    const { result } = renderHook(() => useCopyToClipboard())
    const longText = 'a'.repeat(10000)

    await act(async () => {
      await result.current[1](longText)
    })

    await waitFor(() => {
      expect(result.current[0].value).toBe(longText)
    })
  })

  it('should copy text with special characters', async () => {
    const { result } = renderHook(() => useCopyToClipboard())
    const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'

    await act(async () => {
      await result.current[1](specialText)
    })

    await waitFor(() => {
      expect(result.current[0].value).toBe(specialText)
    })
  })

  it('should copy multiline text', async () => {
    const { result } = renderHook(() => useCopyToClipboard())
    const multilineText = 'Line 1\nLine 2\nLine 3'

    await act(async () => {
      await result.current[1](multilineText)
    })

    await waitFor(() => {
      expect(result.current[0].value).toBe(multilineText)
    })
  })

  it('should maintain copy function reference', () => {
    const { result, rerender } = renderHook(() => useCopyToClipboard())

    const firstCopy = result.current[1]

    rerender()

    const secondCopy = result.current[1]

    expect(firstCopy).toBe(secondCopy)
  })

  it('should clear previous error on successful copy', async () => {
    const mockError = new Error('Copy failed')
    vi.mocked(navigator.clipboard.writeText)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useCopyToClipboard())

    await act(async () => {
      await result.current[1]('Fail')
    })

    await waitFor(() => {
      expect(result.current[0].error).toEqual(mockError)
    })

    await act(async () => {
      await result.current[1]('Success')
    })

    await waitFor(() => {
      expect(result.current[0].error).toBeNull()
      expect(result.current[0].value).toBe('Success')
    })
  })
})
