import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFilterState } from './useFilterState'

describe('useFilterState', () => {
  let replaceStateMock: ReturnType<typeof vi.fn>
  let pushStateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    replaceStateMock = vi.fn()
    pushStateMock = vi.fn()

    // Mock history methods
    Object.defineProperty(window.history, 'replaceState', {
      value: replaceStateMock,
      writable: true,
    })
    Object.defineProperty(window.history, 'pushState', {
      value: pushStateMock,
      writable: true,
    })

    // Reset location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test',
        search: '',
        href: 'http://localhost/test',
      },
      writable: true,
    })
  })

  it('should initialize with empty filters', () => {
    const { result } = renderHook(() => useFilterState())

    expect(result.current.filters).toEqual({})
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should initialize with provided initial filters', () => {
    const initialFilters = { status: 'active', role: 'admin' }
    const { result } = renderHook(() =>
      useFilterState({ initialFilters })
    )

    expect(result.current.filters).toEqual(initialFilters)
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should set a single filter', () => {
    const { result } = renderHook(() => useFilterState())

    act(() => {
      result.current.setFilter('status', 'active')
    })

    expect(result.current.filters).toEqual({ status: 'active' })
  })

  it('should update existing filter', () => {
    const { result } = renderHook(() =>
      useFilterState({ initialFilters: { status: 'active' } })
    )

    act(() => {
      result.current.setFilter('status', 'inactive')
    })

    expect(result.current.filters).toEqual({ status: 'inactive' })
  })

  it('should set multiple filters at once', () => {
    const { result } = renderHook(() => useFilterState())

    act(() => {
      result.current.setMultipleFilters({
        status: 'active',
        role: 'admin',
        verified: true,
      })
    })

    expect(result.current.filters).toEqual({
      status: 'active',
      role: 'admin',
      verified: true,
    })
  })

  it('should remove a filter', () => {
    const { result } = renderHook(() =>
      useFilterState({
        initialFilters: { status: 'active', role: 'admin' },
      })
    )

    act(() => {
      result.current.removeFilter('status')
    })

    expect(result.current.filters).toEqual({ role: 'admin' })
  })

  it('should clear all filters', () => {
    const { result } = renderHook(() =>
      useFilterState({
        initialFilters: { status: 'active', role: 'admin' },
      })
    )

    act(() => {
      result.current.clearFilters()
    })

    expect(result.current.filters).toEqual({})
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('should get a specific filter value', () => {
    const { result } = renderHook(() =>
      useFilterState({
        initialFilters: { status: 'active', role: 'admin' },
      })
    )

    expect(result.current.getFilter('status')).toBe('active')
    expect(result.current.getFilter('role')).toBe('admin')
    expect(result.current.getFilter('nonexistent')).toBeUndefined()
  })

  it('should remove filter when setting to null', () => {
    const { result } = renderHook(() =>
      useFilterState({ initialFilters: { status: 'active' } })
    )

    act(() => {
      result.current.setFilter('status', null)
    })

    expect(result.current.filters).toEqual({})
  })

  it('should remove filter when setting to undefined', () => {
    const { result } = renderHook(() =>
      useFilterState({ initialFilters: { status: 'active' } })
    )

    act(() => {
      result.current.setFilter('status', undefined)
    })

    expect(result.current.filters).toEqual({})
  })

  it('should remove filter when setting to empty string', () => {
    const { result } = renderHook(() =>
      useFilterState({ initialFilters: { status: 'active' } })
    )

    act(() => {
      result.current.setFilter('status', '')
    })

    expect(result.current.filters).toEqual({})
  })

  it('should update URL when persistToUrl is true', () => {
    const { result } = renderHook(() =>
      useFilterState({ persistToUrl: true })
    )

    act(() => {
      result.current.setFilter('status', 'active')
    })

    expect(replaceStateMock).toHaveBeenCalled()
  })

  it('should not update URL when persistToUrl is false', () => {
    const { result } = renderHook(() =>
      useFilterState({ persistToUrl: false })
    )

    act(() => {
      result.current.setFilter('status', 'active')
    })

    expect(replaceStateMock).not.toHaveBeenCalled()
  })

  it('should use custom URL prefix', () => {
    const { result } = renderHook(() =>
      useFilterState({ persistToUrl: true, urlPrefix: 'f_' })
    )

    act(() => {
      result.current.setFilter('status', 'active')
    })

    expect(replaceStateMock).toHaveBeenCalled()
  })

  it('should call onFiltersChange callback', () => {
    const onFiltersChange = vi.fn()
    const { result } = renderHook(() =>
      useFilterState({ onFiltersChange })
    )

    act(() => {
      result.current.setFilter('status', 'active')
    })

    expect(onFiltersChange).toHaveBeenCalledWith({ status: 'active' })
  })

  it('should handle complex filter values', () => {
    const { result } = renderHook(() => useFilterState())

    act(() => {
      result.current.setMultipleFilters({
        tags: ['frontend', 'react'],
        range: { min: 0, max: 100 },
        nested: { deep: { value: 'test' } },
      })
    })

    expect(result.current.filters).toEqual({
      tags: ['frontend', 'react'],
      range: { min: 0, max: 100 },
      nested: { deep: { value: 'test' } },
    })
  })

  it('should remove filters with null in setMultipleFilters', () => {
    const { result } = renderHook(() =>
      useFilterState({
        initialFilters: { status: 'active', role: 'admin' },
      })
    )

    act(() => {
      result.current.setMultipleFilters({
        status: null,
        verified: true,
      })
    })

    expect(result.current.filters).toEqual({ role: 'admin', verified: true })
  })

  it('should initialize from URL params when persistToUrl is true', () => {
    // Set URL search params
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test',
        search: '?filter_status=active&filter_role=admin',
      },
      writable: true,
    })

    const { result } = renderHook(() =>
      useFilterState({ persistToUrl: true })
    )

    expect(result.current.filters).toEqual({
      status: 'active',
      role: 'admin',
    })
  })

  it('should parse JSON values from URL', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test',
        search: '?filter_tags=["react","vue"]&filter_count=42',
      },
      writable: true,
    })

    const { result } = renderHook(() =>
      useFilterState({ persistToUrl: true })
    )

    expect(result.current.filters).toEqual({
      tags: ['react', 'vue'],
      count: 42,
    })
  })

  it('should merge URL params with initial filters', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test',
        search: '?filter_status=active',
      },
      writable: true,
    })

    const { result } = renderHook(() =>
      useFilterState({
        persistToUrl: true,
        initialFilters: { role: 'admin' },
      })
    )

    expect(result.current.filters).toEqual({
      status: 'active',
      role: 'admin',
    })
  })

  it('should handle boolean filter values', () => {
    const { result } = renderHook(() => useFilterState())

    act(() => {
      result.current.setFilter('verified', true)
    })

    expect(result.current.filters).toEqual({ verified: true })
  })

  it('should handle numeric filter values', () => {
    const { result } = renderHook(() => useFilterState())

    act(() => {
      result.current.setFilter('count', 42)
    })

    expect(result.current.filters).toEqual({ count: 42 })
  })
})
