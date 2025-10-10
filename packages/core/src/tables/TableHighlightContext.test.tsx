import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TableHighlightProvider, useTableHighlight } from './TableHighlightContext'

function TestComponent() {
  const { query, config, enabled } = useTableHighlight()

  return (
    <div>
      <span data-testid="query">{query}</span>
      <span data-testid="enabled">{String(enabled)}</span>
      <span data-testid="config">{config?.className || 'none'}</span>
    </div>
  )
}

describe('TableHighlightContext', () => {
  it('should provide default values outside provider', () => {
    const { getByTestId } = render(<TestComponent />)

    expect(getByTestId('query').textContent).toBe('')
    expect(getByTestId('enabled').textContent).toBe('false')
  })

  it('should provide query value', () => {
    const { getByTestId } = render(
      <TableHighlightProvider query="test search">
        <TestComponent />
      </TableHighlightProvider>
    )

    expect(getByTestId('query').textContent).toBe('test search')
  })

  it('should provide enabled state', () => {
    const { getByTestId } = render(
      <TableHighlightProvider query="test" enabled={true}>
        <TestComponent />
      </TableHighlightProvider>
    )

    expect(getByTestId('enabled').textContent).toBe('true')
  })

  it('should default enabled to true', () => {
    const { getByTestId } = render(
      <TableHighlightProvider query="test">
        <TestComponent />
      </TableHighlightProvider>
    )

    expect(getByTestId('enabled').textContent).toBe('true')
  })

  it('should provide config', () => {
    const { getByTestId } = render(
      <TableHighlightProvider query="test" config={{ className: 'custom' }}>
        <TestComponent />
      </TableHighlightProvider>
    )

    expect(getByTestId('config').textContent).toBe('custom')
  })

  it('should handle disabled state', () => {
    const { getByTestId } = render(
      <TableHighlightProvider query="test" enabled={false}>
        <TestComponent />
      </TableHighlightProvider>
    )

    expect(getByTestId('enabled').textContent).toBe('false')
  })

  it('should allow nested providers', () => {
    const { getByTestId } = render(
      <TableHighlightProvider query="outer">
        <TableHighlightProvider query="inner">
          <TestComponent />
        </TableHighlightProvider>
      </TableHighlightProvider>
    )

    expect(getByTestId('query').textContent).toBe('inner')
  })
})
