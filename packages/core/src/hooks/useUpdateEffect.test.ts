import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUpdateEffect } from './useUpdateEffect'
import { useState } from 'react'

describe('useUpdateEffect', () => {
  it('should not run on initial render', () => {
    const effect = vi.fn()

    renderHook(() => useUpdateEffect(effect, []))

    expect(effect).not.toHaveBeenCalled()
  })

  it('should run on dependency change', () => {
    const effect = vi.fn()
    let dep = 0

    const { rerender } = renderHook(() => useUpdateEffect(effect, [dep]))

    expect(effect).not.toHaveBeenCalled()

    dep = 1
    rerender()

    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('should run on dependency change', () => {
    const effect = vi.fn()

    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 1 } }
    )

    expect(effect).not.toHaveBeenCalled()

    rerender({ dep: 2 })

    expect(effect).toHaveBeenCalledTimes(1)

    rerender({ dep: 3 })

    expect(effect).toHaveBeenCalledTimes(2)
  })

  it('should not run when dependencies do not change', () => {
    const effect = vi.fn()

    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 1 } }
    )

    rerender({ dep: 1 })
    rerender({ dep: 1 })

    expect(effect).not.toHaveBeenCalled()
  })

  it('should handle cleanup function', () => {
    const cleanup = vi.fn()
    const effect = vi.fn(() => cleanup)

    const { rerender, unmount } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 1 } }
    )

    rerender({ dep: 2 })

    expect(effect).toHaveBeenCalledTimes(1)
    expect(cleanup).not.toHaveBeenCalled()

    rerender({ dep: 3 })

    expect(effect).toHaveBeenCalledTimes(2)
    expect(cleanup).toHaveBeenCalledTimes(1)

    unmount()

    expect(cleanup).toHaveBeenCalledTimes(2)
  })

  it('should work with changing dependencies', () => {
    const effect = vi.fn()

    const { rerender } = renderHook(
      ({ count }) => {
        useUpdateEffect(effect, [count])
      },
      { initialProps: { count: 0 } }
    )

    expect(effect).not.toHaveBeenCalled()

    rerender({ count: 1 })

    expect(effect).toHaveBeenCalledTimes(1)

    rerender({ count: 2 })

    expect(effect).toHaveBeenCalledTimes(2)
  })

  it('should work with multiple dependencies', () => {
    const effect = vi.fn()

    const { rerender } = renderHook(
      ({ dep1, dep2 }) => useUpdateEffect(effect, [dep1, dep2]),
      { initialProps: { dep1: 1, dep2: 'a' } }
    )

    expect(effect).not.toHaveBeenCalled()

    rerender({ dep1: 2, dep2: 'a' })

    expect(effect).toHaveBeenCalledTimes(1)

    rerender({ dep1: 2, dep2: 'b' })

    expect(effect).toHaveBeenCalledTimes(2)

    rerender({ dep1: 3, dep2: 'c' })

    expect(effect).toHaveBeenCalledTimes(3)
  })

  it('should work without dependency array', () => {
    const effect = vi.fn()

    const { rerender } = renderHook(() => useUpdateEffect(effect))

    expect(effect).not.toHaveBeenCalled()

    rerender()

    expect(effect).toHaveBeenCalledTimes(1)

    rerender()

    expect(effect).toHaveBeenCalledTimes(2)
  })

  it('should handle effect with side effects', () => {
    let counter = 0
    const effect = () => {
      counter++
    }

    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 1 } }
    )

    expect(counter).toBe(0)

    rerender({ dep: 2 })

    expect(counter).toBe(1)

    rerender({ dep: 3 })

    expect(counter).toBe(2)
  })

  it('should not call cleanup on first render', () => {
    const cleanup = vi.fn()
    const effect = vi.fn(() => cleanup)

    renderHook(() => useUpdateEffect(effect, []))

    expect(effect).not.toHaveBeenCalled()
    expect(cleanup).not.toHaveBeenCalled()
  })

  it('should call effect with side effects', () => {
    let called = false
    const effect = vi.fn(() => {
      called = true
    })

    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 0 } }
    )

    expect(called).toBe(false)

    rerender({ dep: 1 })

    expect(effect).toHaveBeenCalledTimes(1)
    expect(called).toBe(true)
  })

  it('should run multiple times with different dependencies', () => {
    const effect = vi.fn()

    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 0 } }
    )

    for (let i = 1; i <= 5; i++) {
      rerender({ dep: i })
    }

    expect(effect).toHaveBeenCalledTimes(5)
  })
})
