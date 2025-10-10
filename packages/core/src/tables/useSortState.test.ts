import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSortState } from './useSortState'

describe('useSortState', () => {
  let replaceStateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    replaceStateMock = vi.fn()

    Object.defineProperty(window.history, 'replaceState', {
      value: replaceStateMock,
      writable: true,
    })

    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test',
        search: '',
        href: 'http://localhost/test',
      },
      writable: true,
    })
  })

  describe('single sort mode', () => {
    it('should initialize with no sort', () => {
      const { result } = renderHook(() => useSortState())

      expect(result.current.sort).toBeNull()
      expect(result.current.hasSort).toBe(false)
    })

    it('should initialize with provided initial sort', () => {
      const { result } = renderHook(() =>
        useSortState({ initialSort: { field: 'name', direction: 'asc' } })
      )

      expect(result.current.sort).toEqual({ field: 'name', direction: 'asc' })
      expect(result.current.hasSort).toBe(true)
    })

    it('should set single sort', () => {
      const { result } = renderHook(() => useSortState())

      act(() => {
        result.current.setSingleSort('name', 'asc')
      })

      expect(result.current.sort).toEqual({ field: 'name', direction: 'asc' })
    })

    it('should toggle sort direction', () => {
      const { result } = renderHook(() => useSortState())

      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sort).toEqual({ field: 'name', direction: 'asc' })

      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sort).toEqual({ field: 'name', direction: 'desc' })

      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sort).toBeNull()
    })

    it('should switch to different field when toggling', () => {
      const { result } = renderHook(() =>
        useSortState({ initialSort: { field: 'name', direction: 'asc' } })
      )

      act(() => {
        result.current.toggleSort('email')
      })

      expect(result.current.sort).toEqual({ field: 'email', direction: 'asc' })
    })

    it('should remove sort', () => {
      const { result } = renderHook(() =>
        useSortState({ initialSort: { field: 'name', direction: 'asc' } })
      )

      act(() => {
        result.current.removeSort('name')
      })

      expect(result.current.sort).toBeNull()
    })

    it('should clear sort', () => {
      const { result } = renderHook(() =>
        useSortState({ initialSort: { field: 'name', direction: 'asc' } })
      )

      act(() => {
        result.current.clearSort()
      })

      expect(result.current.sort).toBeNull()
    })

    it('should get sort direction for field', () => {
      const { result } = renderHook(() =>
        useSortState({ initialSort: { field: 'name', direction: 'asc' } })
      )

      expect(result.current.getSortDirection('name')).toBe('asc')
      expect(result.current.getSortDirection('email')).toBeNull()
    })

    it('should check if field is sorted', () => {
      const { result } = renderHook(() =>
        useSortState({ initialSort: { field: 'name', direction: 'asc' } })
      )

      expect(result.current.isSorted('name')).toBe(true)
      expect(result.current.isSorted('email')).toBe(false)
    })
  })

  describe('multi sort mode', () => {
    it('should initialize with empty array', () => {
      const { result } = renderHook(() => useSortState({ multiSort: true }))

      expect(result.current.sort).toEqual([])
      expect(result.current.hasSort).toBe(false)
    })

    it('should initialize with provided initial sorts', () => {
      const { result } = renderHook(() =>
        useSortState({
          multiSort: true,
          initialSort: [
            { field: 'name', direction: 'asc' },
            { field: 'email', direction: 'desc' },
          ],
        })
      )

      expect(result.current.sort).toEqual([
        { field: 'name', direction: 'asc' },
        { field: 'email', direction: 'desc' },
      ])
      expect(result.current.hasSort).toBe(true)
    })

    it('should add sort column', () => {
      const { result } = renderHook(() => useSortState({ multiSort: true }))

      act(() => {
        result.current.addSort('name', 'asc')
      })

      expect(result.current.sort).toEqual([{ field: 'name', direction: 'asc' }])

      act(() => {
        result.current.addSort('email', 'desc')
      })

      expect(result.current.sort).toEqual([
        { field: 'name', direction: 'asc' },
        { field: 'email', direction: 'desc' },
      ])
    })

    it('should update existing sort column direction', () => {
      const { result } = renderHook(() =>
        useSortState({
          multiSort: true,
          initialSort: [{ field: 'name', direction: 'asc' }],
        })
      )

      act(() => {
        result.current.addSort('name', 'desc')
      })

      expect(result.current.sort).toEqual([{ field: 'name', direction: 'desc' }])
    })

    it('should toggle sort in multi-sort mode', () => {
      const { result } = renderHook(() => useSortState({ multiSort: true }))

      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sort).toEqual([{ field: 'name', direction: 'asc' }])

      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sort).toEqual([{ field: 'name', direction: 'desc' }])

      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sort).toEqual([])
    })

    it('should add multiple columns with toggle', () => {
      const { result } = renderHook(() => useSortState({ multiSort: true }))

      act(() => {
        result.current.toggleSort('name')
      })

      act(() => {
        result.current.toggleSort('email')
      })

      expect(result.current.sort).toEqual([
        { field: 'name', direction: 'asc' },
        { field: 'email', direction: 'asc' },
      ])
    })

    it('should remove sort column', () => {
      const { result } = renderHook(() =>
        useSortState({
          multiSort: true,
          initialSort: [
            { field: 'name', direction: 'asc' },
            { field: 'email', direction: 'desc' },
          ],
        })
      )

      act(() => {
        result.current.removeSort('name')
      })

      expect(result.current.sort).toEqual([{ field: 'email', direction: 'desc' }])
    })

    it('should clear all sorts', () => {
      const { result } = renderHook(() =>
        useSortState({
          multiSort: true,
          initialSort: [
            { field: 'name', direction: 'asc' },
            { field: 'email', direction: 'desc' },
          ],
        })
      )

      act(() => {
        result.current.clearSort()
      })

      expect(result.current.sort).toEqual([])
    })

    it('should get sort direction for field in multi-sort', () => {
      const { result } = renderHook(() =>
        useSortState({
          multiSort: true,
          initialSort: [
            { field: 'name', direction: 'asc' },
            { field: 'email', direction: 'desc' },
          ],
        })
      )

      expect(result.current.getSortDirection('name')).toBe('asc')
      expect(result.current.getSortDirection('email')).toBe('desc')
      expect(result.current.getSortDirection('phone')).toBeNull()
    })
  })

  describe('URL persistence', () => {
    it('should update URL when persistToUrl is true', () => {
      const { result } = renderHook(() => useSortState({ persistToUrl: true }))

      act(() => {
        result.current.setSingleSort('name', 'asc')
      })

      expect(replaceStateMock).toHaveBeenCalled()
    })

    it('should not update URL when persistToUrl is false', () => {
      const { result } = renderHook(() => useSortState({ persistToUrl: false }))

      act(() => {
        result.current.setSingleSort('name', 'asc')
      })

      expect(replaceStateMock).not.toHaveBeenCalled()
    })

    it('should use custom URL parameter name', () => {
      const { result } = renderHook(() =>
        useSortState({ persistToUrl: true, urlParam: 'order' })
      )

      act(() => {
        result.current.setSingleSort('name', 'asc')
      })

      expect(replaceStateMock).toHaveBeenCalled()
    })

    it('should initialize from URL parameter', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/test',
          search: '?sort={"field":"name","direction":"asc"}',
        },
        writable: true,
      })

      const { result } = renderHook(() => useSortState({ persistToUrl: true }))

      expect(result.current.sort).toEqual({ field: 'name', direction: 'asc' })
    })

    it('should initialize multi-sort from URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/test',
          search: '?sort=[{"field":"name","direction":"asc"},{"field":"email","direction":"desc"}]',
        },
        writable: true,
      })

      const { result } = renderHook(() =>
        useSortState({ persistToUrl: true, multiSort: true })
      )

      expect(result.current.sort).toEqual([
        { field: 'name', direction: 'asc' },
        { field: 'email', direction: 'desc' },
      ])
    })

    it('should call onSortChange callback', () => {
      const onSortChange = vi.fn()
      const { result } = renderHook(() => useSortState({ onSortChange }))

      act(() => {
        result.current.setSingleSort('name', 'asc')
      })

      expect(onSortChange).toHaveBeenCalledWith({ field: 'name', direction: 'asc' })
    })

    it('should remove URL param when sort is cleared', () => {
      const { result } = renderHook(() =>
        useSortState({
          persistToUrl: true,
          initialSort: { field: 'name', direction: 'asc' },
        })
      )

      replaceStateMock.mockClear()

      act(() => {
        result.current.clearSort()
      })

      expect(replaceStateMock).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle setting sort directly', () => {
      const { result } = renderHook(() => useSortState())

      act(() => {
        result.current.setSort({ field: 'name', direction: 'desc' })
      })

      expect(result.current.sort).toEqual({ field: 'name', direction: 'desc' })
    })

    it('should not add sort in single-sort mode', () => {
      const { result } = renderHook(() => useSortState({ multiSort: false }))

      act(() => {
        result.current.addSort('name', 'asc')
      })

      // addSort should do nothing in single-sort mode
      expect(result.current.sort).toBeNull()
    })

    it('should handle removeSort for non-existent field', () => {
      const { result } = renderHook(() =>
        useSortState({ initialSort: { field: 'name', direction: 'asc' } })
      )

      act(() => {
        result.current.removeSort('email')
      })

      expect(result.current.sort).toEqual({ field: 'name', direction: 'asc' })
    })
  })
})
