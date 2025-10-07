import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TableSearch, useTableSearch } from './TableSearch'
import { renderHook, act } from '@testing-library/react'

describe('TableSearch', () => {
  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should render search input', () => {
    render(<TableSearch onSearch={vi.fn()} />)

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })

  it('should use custom placeholder', () => {
    render(<TableSearch onSearch={vi.fn()} placeholder="Find users..." />)

    expect(screen.getByPlaceholderText('Find users...')).toBeInTheDocument()
  })

  it('should display search icon', () => {
    const { container } = render(<TableSearch onSearch={vi.fn()} />)

    const searchIcon = container.querySelector('svg')
    expect(searchIcon).toBeInTheDocument()
  })

  it('should call onSearch after debounce delay', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()

    render(<TableSearch onSearch={onSearch} debounceMs={300} />)

    const input = screen.getByLabelText('Search')

    // Change input value
    act(() => {
      fireEvent.change(input, { target: { value: 'test' } })
    })

    // Should not call immediately
    expect(onSearch).not.toHaveBeenCalled()

    // Fast-forward time past debounce delay
    await act(async () => {
      vi.runAllTimers()
    })

    expect(onSearch).toHaveBeenCalledWith('test')
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('should debounce multiple rapid changes', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()

    render(<TableSearch onSearch={onSearch} debounceMs={300} />)

    const input = screen.getByLabelText('Search')

    // Simulate multiple rapid changes
    act(() => {
      fireEvent.change(input, { target: { value: 'h' } })
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      fireEvent.change(input, { target: { value: 'he' } })
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      fireEvent.change(input, { target: { value: 'hello' } })
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Should not have called yet
    expect(onSearch).not.toHaveBeenCalled()

    // Fast-forward past debounce delay
    await act(async () => {
      vi.runAllTimers()
    })

    // Should only call once with final value
    expect(onSearch).toHaveBeenCalledWith('hello')
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup({ delay: null })

    render(<TableSearch onSearch={vi.fn()} showClear />)

    const input = screen.getByLabelText('Search')

    // Initially no clear button
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()

    // Type something
    await user.type(input, 'test')

    // Clear button should appear
    await waitFor(() => {
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
    })
  })

  it('should clear input when clear button is clicked', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup({ delay: null })

    render(<TableSearch onSearch={onSearch} showClear />)

    const input = screen.getByLabelText('Search')

    // Type something
    await user.type(input, 'test')

    // Click clear button
    const clearButton = await screen.findByLabelText('Clear search')
    await user.click(clearButton)

    // Input should be cleared
    expect(input).toHaveValue('')

    // Should call onSearch with empty string immediately
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('should not show clear button when showClear is false', async () => {
    const user = userEvent.setup({ delay: null })

    render(<TableSearch onSearch={vi.fn()} showClear={false} />)

    const input = screen.getByLabelText('Search')
    await user.type(input, 'test')

    await waitFor(() => {
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
    })
  })

  it('should not show clear button when disabled', async () => {
    const user = userEvent.setup({ delay: null })

    render(<TableSearch onSearch={vi.fn()} disabled showClear />)

    const input = screen.getByLabelText('Search')

    // Input should be disabled
    expect(input).toBeDisabled()

    // Even with value, clear button should not show when disabled
    await user.type(input, 'test')
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
  })

  it('should sync with external value prop', () => {
    const { rerender } = render(<TableSearch onSearch={vi.fn()} value="initial" />)

    const input = screen.getByLabelText('Search')
    expect(input).toHaveValue('initial')

    // Update value prop
    rerender(<TableSearch onSearch={vi.fn()} value="updated" />)

    expect(input).toHaveValue('updated')
  })

  it('should disable input when disabled prop is true', () => {
    render(<TableSearch onSearch={vi.fn()} disabled />)

    const input = screen.getByLabelText('Search')
    expect(input).toBeDisabled()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <TableSearch onSearch={vi.fn()} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should cancel pending search on unmount', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()

    const { unmount } = render(<TableSearch onSearch={onSearch} debounceMs={300} />)

    // Type something but unmount before debounce completes
    const input = screen.getByLabelText('Search')
    input.focus()

    unmount()

    // Fast-forward time
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    // Should not have called onSearch
    expect(onSearch).not.toHaveBeenCalled()
  })
})

describe('useTableSearch', () => {
  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should initialize with initial value', () => {
    const { result } = renderHook(() => useTableSearch('initial'))

    expect(result.current.searchQuery).toBe('initial')
    expect(result.current.debouncedQuery).toBe('initial')
  })

  it('should update search query immediately', () => {
    const { result } = renderHook(() => useTableSearch())

    act(() => {
      result.current.setSearchQuery('new query')
    })

    expect(result.current.searchQuery).toBe('new query')
    // Debounced value should not update yet
    expect(result.current.debouncedQuery).toBe('')
  })

  it('should update debounced query after delay', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTableSearch('', 300))

    act(() => {
      result.current.setSearchQuery('new query')
    })

    // Fast-forward time
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.debouncedQuery).toBe('new query')
  })

  it('should debounce multiple rapid changes', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTableSearch('', 300))

    act(() => {
      result.current.setSearchQuery('a')
    })

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      result.current.setSearchQuery('ab')
    })

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    act(() => {
      result.current.setSearchQuery('abc')
    })

    // Debounced value should still be initial
    expect(result.current.debouncedQuery).toBe('')

    // Fast-forward past debounce delay
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    // Should update to final value
    expect(result.current.debouncedQuery).toBe('abc')
  })

  it('should use custom debounce delay', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTableSearch('', 500))

    act(() => {
      result.current.setSearchQuery('test')
    })

    // After 300ms, should not update
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.debouncedQuery).toBe('')

    // After 500ms total, should update
    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current.debouncedQuery).toBe('test')
  })
})
