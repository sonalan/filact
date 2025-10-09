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

describe('TableSearch - Multi-Column Search', () => {
  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should pass searchColumns to onSearch callback', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const searchColumns = ['name', 'email', 'role']

    render(<TableSearch onSearch={onSearch} searchColumns={searchColumns} />)

    const input = screen.getByLabelText('Search')

    act(() => {
      fireEvent.change(input, { target: { value: 'test' } })
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(onSearch).toHaveBeenCalledWith('test', searchColumns)
  })

  it('should render column selector when showColumnSelector is true', () => {
    const searchColumns = ['name', 'email', 'role']

    render(
      <TableSearch
        onSearch={vi.fn()}
        searchColumns={searchColumns}
        showColumnSelector={true}
      />
    )

    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('role')).toBeInTheDocument()
  })

  it('should not render column selector when showColumnSelector is false', () => {
    const searchColumns = ['name', 'email']

    render(
      <TableSearch
        onSearch={vi.fn()}
        searchColumns={searchColumns}
        showColumnSelector={false}
      />
    )

    expect(screen.queryByText('name')).not.toBeInTheDocument()
    expect(screen.queryByText('email')).not.toBeInTheDocument()
  })

  it('should toggle column selection', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const user = userEvent.setup({ delay: null })
    const searchColumns = ['name', 'email']

    render(
      <TableSearch
        onSearch={onSearch}
        searchColumns={searchColumns}
        showColumnSelector={true}
        value="test"
      />
    )

    const nameButton = screen.getByText('name')
    const emailButton = screen.getByText('email')

    // Initially all columns selected
    expect(nameButton).toHaveClass('bg-blue-50')
    expect(emailButton).toHaveClass('bg-blue-50')

    // Click name to deselect
    await user.click(nameButton)

    expect(nameButton).toHaveClass('bg-white')
    expect(onSearch).toHaveBeenCalledWith('test', ['email'])

    // Click name again to reselect
    await user.click(nameButton)

    expect(nameButton).toHaveClass('bg-blue-50')
    expect(onSearch).toHaveBeenCalledWith('test', ['email', 'name'])
  })

  it('should pass undefined when no columns selected', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const user = userEvent.setup({ delay: null })
    const searchColumns = ['name']

    render(
      <TableSearch
        onSearch={onSearch}
        searchColumns={searchColumns}
        showColumnSelector={true}
        value="test"
      />
    )

    const nameButton = screen.getByText('name')

    // Deselect the only column
    await user.click(nameButton)

    expect(onSearch).toHaveBeenCalledWith('test', undefined)
  })

  it('should re-trigger search when column selection changes', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const user = userEvent.setup({ delay: null })
    const searchColumns = ['name', 'email']

    render(
      <TableSearch
        onSearch={onSearch}
        searchColumns={searchColumns}
        showColumnSelector={true}
      />
    )

    const input = screen.getByLabelText('Search')

    // Type in search
    act(() => {
      fireEvent.change(input, { target: { value: 'test' } })
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(onSearch).toHaveBeenCalledWith('test', searchColumns)
    onSearch.mockClear()

    // Toggle column
    const nameButton = screen.getByText('name')
    await user.click(nameButton)

    expect(onSearch).toHaveBeenCalledWith('test', ['email'])
  })

  it('should not trigger search on column toggle when no search value', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup({ delay: null })
    const searchColumns = ['name', 'email']

    render(
      <TableSearch
        onSearch={onSearch}
        searchColumns={searchColumns}
        showColumnSelector={true}
      />
    )

    const nameButton = screen.getByText('name')
    await user.click(nameButton)

    // onSearch should not be called since there's no search value
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('should sync selected columns with searchColumns prop changes', () => {
    const onSearch = vi.fn()
    const { rerender } = render(
      <TableSearch
        onSearch={onSearch}
        searchColumns={['name']}
        showColumnSelector={true}
      />
    )

    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.queryByText('email')).not.toBeInTheDocument()

    rerender(
      <TableSearch
        onSearch={onSearch}
        searchColumns={['name', 'email']}
        showColumnSelector={true}
      />
    )

    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
  })
})
