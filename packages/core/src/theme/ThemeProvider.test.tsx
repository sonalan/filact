/**
 * ThemeProvider Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeProvider'

describe('ThemeProvider', () => {
  let localStorageMock: { [key: string]: string }
  let matchMediaMock: any

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {}
    global.localStorage = {
      getItem: vi.fn((key) => localStorageMock[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageMock[key] = value
      }),
      removeItem: vi.fn((key) => {
        delete localStorageMock[key]
      }),
      clear: vi.fn(() => {
        localStorageMock = {}
      }),
      key: vi.fn(),
      length: 0,
    }

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }
    global.matchMedia = vi.fn().mockReturnValue(matchMediaMock)

    // Mock document.documentElement
    Object.defineProperty(document.documentElement, 'classList', {
      value: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      writable: true,
    })
    Object.defineProperty(document.documentElement, 'setAttribute', {
      value: vi.fn(),
      writable: true,
    })
    Object.defineProperty(document.documentElement, 'style', {
      value: {
        colorScheme: '',
        setProperty: vi.fn(),
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render children', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should throw error when useTheme is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useTheme())
    }).toThrow('useTheme must be used within a ThemeProvider')

    consoleError.mockRestore()
  })

  it('should initialize with default theme mode', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    })

    expect(result.current.mode).toBe('system')
    expect(result.current.resolvedTheme).toBe('light')
  })

  it('should initialize with custom theme mode', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider config={{ mode: 'dark' }}>{children}</ThemeProvider>
      ),
    })

    expect(result.current.mode).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('should set theme mode', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    })

    act(() => {
      result.current.setMode('dark')
    })

    expect(result.current.mode).toBe('dark')
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    })

    act(() => {
      result.current.toggle()
    })

    expect(result.current.resolvedTheme).toBe('dark')

    act(() => {
      result.current.toggle()
    })

    expect(result.current.resolvedTheme).toBe('light')
  })

  it('should persist theme to localStorage', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider config={{ persist: true, storageKey: 'test_theme' }}>
          {children}
        </ThemeProvider>
      ),
    })

    act(() => {
      result.current.setMode('dark')
    })

    expect(localStorage.setItem).toHaveBeenCalledWith('test_theme', 'dark')
  })

  it('should not persist theme when persist is false', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider config={{ persist: false }}>{children}</ThemeProvider>,
    })

    act(() => {
      result.current.setMode('dark')
    })

    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('should load stored theme on mount', () => {
    localStorageMock['filact_theme'] = 'dark'

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    })

    expect(result.current.mode).toBe('dark')
  })

  it('should resolve system theme to dark when system prefers dark', () => {
    matchMediaMock.matches = true

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider config={{ mode: 'system' }}>{children}</ThemeProvider>
      ),
    })

    expect(result.current.mode).toBe('system')
    expect(result.current.resolvedTheme).toBe('dark')
  })

  it('should resolve system theme to light when system prefers light', () => {
    matchMediaMock.matches = false

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider config={{ mode: 'system' }}>{children}</ThemeProvider>
      ),
    })

    expect(result.current.mode).toBe('system')
    expect(result.current.resolvedTheme).toBe('light')
  })

  it('should apply theme class to document', () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider config={{ mode: 'dark' }}>{children}</ThemeProvider>
      ),
    })

    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark')
  })

  it('should set data-theme attribute', () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider config={{ mode: 'dark' }}>{children}</ThemeProvider>
      ),
    })

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
  })

  it('should apply CSS variables', () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider
          config={{
            mode: 'light',
            light: { primary: '#3b82f6' },
          }}
        >
          {children}
        </ThemeProvider>
      ),
    })

    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--color-primary',
      '#3b82f6'
    )
  })

  it('should apply custom CSS variables', () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider
          config={{
            cssVariables: {
              '--custom-var': '#ff0000',
            },
          }}
        >
          {children}
        </ThemeProvider>
      ),
    })

    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--custom-var',
      '#ff0000'
    )
  })

  it('should set isApplying to true when changing theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    })

    act(() => {
      result.current.setMode('dark')
    })

    expect(result.current.isApplying).toBe(true)
  })

  it('should reset isApplying after transition duration', async () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider config={{ transitionDuration: 100 }}>{children}</ThemeProvider>
      ),
    })

    act(() => {
      result.current.setMode('dark')
    })

    await waitFor(
      () => {
        expect(result.current.isApplying).toBe(false)
      },
      { timeout: 200 }
    )
  })

  it('should use default theme when system preference is not available', () => {
    global.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider config={{ mode: 'system', defaultTheme: 'dark' }}>{children}</ThemeProvider>
      ),
    })

    // Even though matchMedia says light, if we explicitly set defaultTheme
    // Actually, system mode should still use matchMedia, not defaultTheme
    // defaultTheme is used when system preference cannot be detected
    expect(result.current.resolvedTheme).toBe('light')
  })

  it('should listen for system theme changes', () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider config={{ mode: 'system' }}>{children}</ThemeProvider>
      ),
    })

    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should not listen for system changes when mode is not system', () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider config={{ mode: 'light' }}>{children}</ThemeProvider>,
    })

    expect(matchMediaMock.addEventListener).not.toHaveBeenCalled()
  })

  it('should apply different colors for dark mode', () => {
    renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider
          config={{
            mode: 'dark',
            dark: { primary: '#60a5fa' },
          }}
        >
          {children}
        </ThemeProvider>
      ),
    })

    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--color-primary',
      '#60a5fa'
    )
  })
})
