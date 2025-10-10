import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HighlightedCell } from './HighlightedCell'
import { TableHighlightProvider } from './TableHighlightContext'

describe('HighlightedCell', () => {
  it('should render plain text without context', () => {
    render(<HighlightedCell value="Hello world" />)

    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('should highlight text with context', () => {
    render(
      <TableHighlightProvider query="world">
        <HighlightedCell value="Hello world" />
      </TableHighlightProvider>
    )

    const mark = screen.getByText('world')
    expect(mark.tagName).toBe('MARK')
  })

  it('should not highlight when context disabled', () => {
    const { container } = render(
      <TableHighlightProvider query="world" enabled={false}>
        <HighlightedCell value="Hello world" />
      </TableHighlightProvider>
    )

    const marks = container.querySelectorAll('mark')
    expect(marks).toHaveLength(0)
  })

  it('should force enable highlighting', () => {
    render(
      <TableHighlightProvider query="world" enabled={false}>
        <HighlightedCell value="Hello world" highlight={true} />
      </TableHighlightProvider>
    )

    const mark = screen.getByText('world')
    expect(mark.tagName).toBe('MARK')
  })

  it('should force disable highlighting', () => {
    const { container } = render(
      <TableHighlightProvider query="world" enabled={true}>
        <HighlightedCell value="Hello world" highlight={false} />
      </TableHighlightProvider>
    )

    const marks = container.querySelectorAll('mark')
    expect(marks).toHaveLength(0)
  })

  it('should apply custom config', () => {
    const { container } = render(
      <TableHighlightProvider query="test">
        <HighlightedCell
          value="test"
          config={{ className: 'custom-highlight' }}
        />
      </TableHighlightProvider>
    )

    const mark = container.querySelector('mark')
    expect(mark).toHaveClass('custom-highlight')
  })

  it('should handle number values', () => {
    render(
      <TableHighlightProvider query="123">
        <HighlightedCell value={123} />
      </TableHighlightProvider>
    )

    const mark = screen.getByText('123')
    expect(mark.tagName).toBe('MARK')
  })

  it('should handle null values with fallback', () => {
    render(<HighlightedCell value={null} fallback="N/A" />)

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should handle undefined values with fallback', () => {
    render(<HighlightedCell value={undefined} fallback="--" />)

    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('should use default fallback for null', () => {
    render(<HighlightedCell value={null} />)

    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('should apply className', () => {
    const { container } = render(
      <HighlightedCell value="test" className="custom-class" />
    )

    const span = container.querySelector('span')
    expect(span).toHaveClass('custom-class')
  })

  it('should not highlight when no query in context', () => {
    const { container } = render(
      <TableHighlightProvider query="">
        <HighlightedCell value="Hello world" />
      </TableHighlightProvider>
    )

    const marks = container.querySelectorAll('mark')
    expect(marks).toHaveLength(0)
  })

  it('should preserve context config', () => {
    const { container } = render(
      <TableHighlightProvider
        query="test"
        config={{ className: 'context-highlight' }}
      >
        <HighlightedCell value="test" />
      </TableHighlightProvider>
    )

    const mark = container.querySelector('mark')
    expect(mark).toHaveClass('context-highlight')
  })

  it('should override context config with custom config', () => {
    const { container } = render(
      <TableHighlightProvider
        query="test"
        config={{ className: 'context-highlight' }}
      >
        <HighlightedCell
          value="test"
          config={{ className: 'custom-highlight' }}
        />
      </TableHighlightProvider>
    )

    const mark = container.querySelector('mark')
    expect(mark).toHaveClass('custom-highlight')
    expect(mark).not.toHaveClass('context-highlight')
  })

  it('should handle empty string value', () => {
    const { container } = render(<HighlightedCell value="" />)

    const span = container.querySelector('span')
    expect(span?.textContent).toBe('')
  })
})
