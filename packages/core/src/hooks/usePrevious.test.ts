import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePrevious } from './usePrevious'

describe('usePrevious', () => {
  it('should return undefined on initial render', () => {
    const { result } = renderHook(() => usePrevious('initial'))

    expect(result.current).toBeUndefined()
  })

  it('should return previous value after rerender', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: 'second' })
    expect(result.current).toBe('first')

    rerender({ value: 'third' })
    expect(result.current).toBe('second')
  })

  it('should work with numbers', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: 1 })
    expect(result.current).toBe(0)

    rerender({ value: 2 })
    expect(result.current).toBe(1)
  })

  it('should work with booleans', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: false },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: true })
    expect(result.current).toBe(false)

    rerender({ value: false })
    expect(result.current).toBe(true)
  })

  it('should work with objects', () => {
    const obj1 = { name: 'John', age: 30 }
    const obj2 = { name: 'Jane', age: 25 }
    const obj3 = { name: 'Bob', age: 35 }

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: obj2 })
    expect(result.current).toBe(obj1)

    rerender({ value: obj3 })
    expect(result.current).toBe(obj2)
  })

  it('should work with arrays', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [4, 5, 6]
    const arr3 = [7, 8, 9]

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: arr1 },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: arr2 })
    expect(result.current).toBe(arr1)

    rerender({ value: arr3 })
    expect(result.current).toBe(arr2)
  })

  it('should handle null values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: null as string | null },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: 'not null' })
    expect(result.current).toBeNull()

    rerender({ value: null })
    expect(result.current).toBe('not null')
  })

  it('should handle undefined values', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: undefined as string | undefined },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: 'defined' })
    expect(result.current).toBeUndefined()

    rerender({ value: undefined })
    expect(result.current).toBe('defined')
  })

  it('should not update when value is same reference', () => {
    const obj = { name: 'John' }

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj },
    })

    expect(result.current).toBeUndefined()

    // Rerender with same reference
    rerender({ value: obj })
    expect(result.current).toBe(obj)

    // Rerender again with same reference
    rerender({ value: obj })
    expect(result.current).toBe(obj)
  })

  it('should track rapid value changes', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: 2 })
    expect(result.current).toBe(1)

    rerender({ value: 3 })
    expect(result.current).toBe(2)

    rerender({ value: 4 })
    expect(result.current).toBe(3)

    rerender({ value: 5 })
    expect(result.current).toBe(4)
  })

  it('should work with functions', () => {
    const fn1 = () => 'first'
    const fn2 = () => 'second'

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: fn1 },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: fn2 })
    expect(result.current).toBe(fn1)
  })

  it('should work with symbols', () => {
    const sym1 = Symbol('first')
    const sym2 = Symbol('second')

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: sym1 },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: sym2 })
    expect(result.current).toBe(sym1)
  })

  it('should handle same primitive value changes', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'test' },
    })

    expect(result.current).toBeUndefined()

    // Even same value should update previous
    rerender({ value: 'test' })
    expect(result.current).toBe('test')

    rerender({ value: 'test' })
    expect(result.current).toBe('test')
  })

  it('should work in practical counter example', () => {
    let count = 0

    const { result, rerender } = renderHook(() => usePrevious(count))

    expect(result.current).toBeUndefined()

    count = 1
    rerender()
    expect(result.current).toBe(0)

    count = 2
    rerender()
    expect(result.current).toBe(1)

    count = 3
    rerender()
    expect(result.current).toBe(2)
  })

  it('should work with complex nested objects', () => {
    const obj1 = {
      user: { name: 'John', address: { city: 'NYC' } },
      items: [1, 2, 3],
    }
    const obj2 = {
      user: { name: 'Jane', address: { city: 'LA' } },
      items: [4, 5, 6],
    }

    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: obj2 })
    expect(result.current).toBe(obj1)
    expect(result.current?.user.name).toBe('John')
  })

  it('should handle zero and empty values correctly', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 0 },
    })

    expect(result.current).toBeUndefined()

    rerender({ value: '' })
    expect(result.current).toBe(0)

    rerender({ value: false })
    expect(result.current).toBe('')

    rerender({ value: null })
    expect(result.current).toBe(false)
  })
})
