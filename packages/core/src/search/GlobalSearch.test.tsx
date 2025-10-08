/**
 * GlobalSearch Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { PanelProvider } from '../panel/PanelProvider'
import { createPanel } from '../panel/builder'
import { createRestDataProvider } from '../providers/rest'
import { createResource } from '../resources/builder'
import { GlobalSearch } from './GlobalSearch'
import { useGlobalSearch } from './useGlobalSearch'

// Mock useGlobalSearch hook
vi.mock('./useGlobalSearch', () => ({
  useGlobalSearch: vi.fn(),
}))

const mockUseGlobalSearch = vi.mocked(useGlobalSearch)

const provider = createRestDataProvider({ baseUrl: 'http://api.example.com' })
const userResource = createResource({ name: 'User', endpoint: 'users', primaryKey: 'id' }, provider).build()
const panelConfig = createPanel('test', 'Test Panel').provider(provider).resource(userResource).build()

describe('GlobalSearch', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    // Reset mock
    mockUseGlobalSearch.mockReturnValue({
      isOpen: false,
      query: '',
      results: [],
      recentSearches: [],
      isLoading: false,
      open: vi.fn(),
      close: vi.fn(),
      toggle: vi.fn(),
      setQuery: vi.fn(),
      clearQuery: vi.fn(),
      addRecentSearch: vi.fn(),
      clearRecentSearches: vi.fn(),
      search: vi.fn(),
      config: {
        enabled: true,
        shortcut: 'mod+k',
        placeholder: 'Search...',
        maxRecentSearches: 5,
        fuzzySearch: true,
        minSearchLength: 2,
        debounceMs: 300,
        providers: [],
        enabledCategories: ['resources', 'pages', 'actions', 'records', 'custom'],
        categoryLabels: {
          resources: 'Resources',
          pages: 'Pages',
          actions: 'Actions',
          records: 'Records',
          custom: 'Other',
        },
        showRecentSearches: true,
      },
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <PanelProvider config={panelConfig}>{children}</PanelProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )

  it('should not render when closed', () => {
    const { container } = render(<GlobalSearch />, { wrapper })
    expect(container.firstChild).toBeNull()
  })

  it('should render when open', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
    })

    render(<GlobalSearch />, { wrapper })

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('should display search input', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
    })

    render(<GlobalSearch />, { wrapper })

    const input = screen.getByPlaceholderText('Search...')
    expect(input).toBeInTheDocument()
  })

  it('should call setQuery when typing', async () => {
    const setQuery = vi.fn()
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      setQuery,
    })

    const user = userEvent.setup()
    render(<GlobalSearch />, { wrapper })

    const input = screen.getByPlaceholderText('Search...')
    await user.type(input, 'test')

    // cmdk calls setQuery for each character
    expect(setQuery).toHaveBeenCalled()
  })

  it('should display search results', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      results: [
        {
          id: 'result-1',
          title: 'Test Result',
          subtitle: 'Test subtitle',
          category: 'resources',
        },
      ],
    })

    render(<GlobalSearch />, { wrapper })

    expect(screen.getByText('Test Result')).toBeInTheDocument()
    expect(screen.getByText('Test subtitle')).toBeInTheDocument()
  })

  it('should group results by category', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      results: [
        {
          id: 'resource-1',
          title: 'Resource 1',
          category: 'resources',
        },
        {
          id: 'action-1',
          title: 'Action 1',
          category: 'actions',
        },
      ],
    })

    render(<GlobalSearch />, { wrapper })

    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('should display recent searches when query is empty', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      query: '',
      recentSearches: [
        { query: 'recent 1', timestamp: Date.now() },
        { query: 'recent 2', timestamp: Date.now() },
      ],
    })

    render(<GlobalSearch />, { wrapper })

    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
    expect(screen.getByText('recent 1')).toBeInTheDocument()
    expect(screen.getByText('recent 2')).toBeInTheDocument()
  })

  it('should display empty state when no results', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      query: 'test',
      results: [],
    })

    render(<GlobalSearch />, { wrapper })

    expect(screen.getByText(/No results found for "test"/i)).toBeInTheDocument()
  })

  it('should display loading state', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      isLoading: true,
    })

    render(<GlobalSearch />, { wrapper })

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should call close when overlay is clicked', async () => {
    const close = vi.fn()
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      close,
    })

    const user = userEvent.setup()
    render(<GlobalSearch />, { wrapper })

    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50')
    expect(overlay).toBeInTheDocument()

    if (overlay) {
      await user.click(overlay)
      expect(close).toHaveBeenCalled()
    }
  })

  it('should display clear button when query is not empty', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      query: 'test',
    })

    render(<GlobalSearch />, { wrapper })

    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('should call setQuery when clear button is clicked', async () => {
    const setQuery = vi.fn()
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      query: 'test',
      setQuery,
    })

    const user = userEvent.setup()
    render(<GlobalSearch />, { wrapper })

    const clearButton = screen.getByText('Clear')
    await user.click(clearButton)

    expect(setQuery).toHaveBeenCalledWith('')
  })

  it('should render custom empty state', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      query: 'test',
      results: [],
    })

    render(<GlobalSearch renderEmpty={(query) => <div>Custom empty for {query}</div>} />, {
      wrapper,
    })

    expect(screen.getByText('Custom empty for test')).toBeInTheDocument()
  })

  it('should render custom loading state', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      isLoading: true,
    })

    render(<GlobalSearch renderLoading={() => <div>Custom loading</div>} />, { wrapper })

    expect(screen.getByText('Custom loading')).toBeInTheDocument()
  })

  it('should display keyboard shortcuts in footer', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
    })

    render(<GlobalSearch />, { wrapper })

    expect(screen.getByText('Navigate')).toBeInTheDocument()
    expect(screen.getByText('Select')).toBeInTheDocument()
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('should call clearRecentSearches when clear recent is clicked', async () => {
    const clearRecentSearches = vi.fn()
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
      recentSearches: [{ query: 'recent 1', timestamp: Date.now() }],
      clearRecentSearches,
    })

    const user = userEvent.setup()
    render(<GlobalSearch />, { wrapper })

    const clearButton = screen.getByText('Clear recent searches')
    await user.click(clearButton)

    expect(clearRecentSearches).toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    mockUseGlobalSearch.mockReturnValue({
      ...mockUseGlobalSearch(),
      isOpen: true,
    })

    const { container } = render(<GlobalSearch className="custom-class" />, { wrapper })

    const searchContainer = container.querySelector('.custom-class')
    expect(searchContainer).toBeInTheDocument()
  })
})
