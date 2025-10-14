import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useVirtualizedTable } from './useVirtualizedTable'
import type { BaseModel } from '../types/resource'
import type { ColumnDef } from '@tanstack/react-table'

interface TestItem extends BaseModel {
  id: number
  name: string
  value: number
}

describe('useVirtualizedTable', () => {
  const mockData: TestItem[] = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 },
  ]

  const mockColumns: ColumnDef<TestItem>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'value', header: 'Value' },
  ]

  it('should create table instance', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
      })
    )

    expect(result.current).toBeDefined()
    expect(result.current.getRowModel).toBeDefined()
  })

  it('should return correct number of rows', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
      })
    )

    const rows = result.current.getRowModel().rows
    expect(rows.length).toBe(3)
  })

  it('should enable sorting by default', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
      })
    )

    const firstColumn = result.current.getAllColumns()[0]
    expect(firstColumn?.getCanSort()).toBe(true)
  })

  it('should disable sorting when specified', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
        enableSorting: false,
      })
    )

    const firstColumn = result.current.getAllColumns()[0]
    expect(firstColumn?.getCanSort()).toBe(false)
  })

  it('should apply initial sorting', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
        initialSorting: [{ id: 'value', desc: true }],
      })
    )

    const rows = result.current.getRowModel().rows
    expect(rows[0]?.original.value).toBe(300)
    expect(rows[2]?.original.value).toBe(100)
  })

  it('should handle empty data', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: [],
        columns: mockColumns,
      })
    )

    const rows = result.current.getRowModel().rows
    expect(rows.length).toBe(0)
  })

  it('should handle large datasets', () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: i * 100,
    }))

    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: largeData,
        columns: mockColumns,
      })
    )

    const rows = result.current.getRowModel().rows
    expect(rows.length).toBe(10000)
  })

  it('should enable filtering when specified', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
        enableFiltering: true,
      })
    )

    const firstColumn = result.current.getAllColumns()[0]
    expect(firstColumn?.getCanFilter()).toBe(true)
  })

  it('should disable multi-sort by default', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
      })
    )

    expect(result.current.options.enableMultiSort).toBe(false)
  })

  it('should enable multi-sort when specified', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
        enableMultiSort: true,
      })
    )

    expect(result.current.options.enableMultiSort).toBe(true)
  })

  it('should update when data changes', () => {
    const { result, rerender } = renderHook(
      ({ data }) =>
        useVirtualizedTable({
          data,
          columns: mockColumns,
        }),
      {
        initialProps: { data: mockData },
      }
    )

    expect(result.current.getRowModel().rows.length).toBe(3)

    const newData = [...mockData, { id: 4, name: 'Item 4', value: 400 }]
    rerender({ data: newData })

    expect(result.current.getRowModel().rows.length).toBe(4)
  })

  it('should memoize columns', () => {
    const { result, rerender } = renderHook(
      ({ columns }) =>
        useVirtualizedTable({
          data: mockData,
          columns,
        }),
      {
        initialProps: { columns: mockColumns },
      }
    )

    const initialColumns = result.current.getAllColumns()

    rerender({ columns: mockColumns })

    const rerenderedColumns = result.current.getAllColumns()
    expect(initialColumns).toEqual(rerenderedColumns)
  })

  it('should handle initial filters', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
        enableFiltering: true,
        initialFilters: [{ id: 'name', value: 'Item 1' }],
      })
    )

    expect(result.current.getState().columnFilters).toEqual([
      { id: 'name', value: 'Item 1' },
    ])
  })

  it('should return header groups', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
      })
    )

    const headerGroups = result.current.getHeaderGroups()
    expect(headerGroups.length).toBeGreaterThan(0)
    expect(headerGroups[0]?.headers.length).toBe(2)
  })

  it('should provide column visibility controls', () => {
    const { result } = renderHook(() =>
      useVirtualizedTable({
        data: mockData,
        columns: mockColumns,
      })
    )

    const allColumns = result.current.getAllColumns()
    expect(allColumns.length).toBe(2)
    expect(allColumns[0]?.getIsVisible()).toBe(true)
  })
})
