import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  highlightText,
  highlightMultipleTexts,
  containsQuery,
  getMatchSnippet,
  Highlight,
} from './highlight'

describe('highlightText', () => {
  it('should highlight single match', () => {
    const result = highlightText('Hello world', 'world')

    expect(result).toBeDefined()
  })

  it('should highlight multiple matches', () => {
    const { container } = render(<>{highlightText('test test test', 'test')}</>)
    const marks = container.querySelectorAll('mark')

    expect(marks).toHaveLength(3)
  })

  it('should be case insensitive by default', () => {
    const { container } = render(<>{highlightText('Hello World', 'hello')}</>)
    const marks = container.querySelectorAll('mark')

    expect(marks).toHaveLength(1)
    expect(marks[0].textContent).toBe('Hello')
  })

  it('should support case sensitive mode', () => {
    const { container } = render(
      <>{highlightText('Hello hello', 'hello', { caseSensitive: true })}</>
    )
    const marks = container.querySelectorAll('mark')

    expect(marks).toHaveLength(1)
    expect(marks[0].textContent).toBe('hello')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <>{highlightText('test', 'test', { className: 'custom-highlight' })}</>
    )
    const mark = container.querySelector('mark')

    expect(mark).toHaveClass('custom-highlight')
  })

  it('should return original text when no query', () => {
    const result = highlightText('Hello world', '')

    expect(result).toBe('Hello world')
  })

  it('should return original text when no match', () => {
    const result = highlightText('Hello world', 'xyz')

    expect(result).toBe('Hello world')
  })

  it('should support whole word matching', () => {
    const { container } = render(
      <>{highlightText('test testing', 'test', { wholeWord: true })}</>
    )
    const marks = container.querySelectorAll('mark')

    expect(marks).toHaveLength(1)
    expect(marks[0].textContent).toBe('test')
  })

  it('should respect maxHighlights limit', () => {
    const { container } = render(
      <>{highlightText('test test test test', 'test', { maxHighlights: 2 })}</>
    )
    const marks = container.querySelectorAll('mark')

    expect(marks).toHaveLength(2)
  })

  it('should handle special regex characters', () => {
    const { container } = render(<>{highlightText('Price: $100', '$100')}</>)
    const marks = container.querySelectorAll('mark')

    expect(marks).toHaveLength(1)
    expect(marks[0].textContent).toBe('$100')
  })

  it('should preserve text between matches', () => {
    const { container } = render(<>{highlightText('a test b test c', 'test')}</>)

    expect(container.textContent).toBe('a test b test c')
  })

  it('should handle empty text', () => {
    const result = highlightText('', 'test')

    expect(result).toBe('')
  })

  it('should handle adjacent matches', () => {
    const { container } = render(<>{highlightText('testtest', 'test')}</>)
    const marks = container.querySelectorAll('mark')

    expect(marks).toHaveLength(2)
  })
})

describe('highlightMultipleTexts', () => {
  it('should highlight all provided texts', () => {
    const texts = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
    }

    const result = highlightMultipleTexts(texts, 'john')

    expect(result.name).toBeDefined()
    expect(result.email).toBeDefined()
    expect(result.role).toBeDefined()
  })

  it('should apply config to all texts', () => {
    const texts = {
      field1: 'test',
      field2: 'TEST',
    }

    const result = highlightMultipleTexts(texts, 'test', { caseSensitive: true })

    const { container: c1 } = render(<>{result.field1}</>)
    const { container: c2 } = render(<>{result.field2}</>)

    expect(c1.querySelectorAll('mark')).toHaveLength(1)
    expect(c2.querySelectorAll('mark')).toHaveLength(0)
  })
})

describe('containsQuery', () => {
  it('should return true for matching text', () => {
    expect(containsQuery('Hello world', 'world')).toBe(true)
  })

  it('should return false for non-matching text', () => {
    expect(containsQuery('Hello world', 'xyz')).toBe(false)
  })

  it('should be case insensitive by default', () => {
    expect(containsQuery('Hello World', 'hello')).toBe(true)
  })

  it('should support case sensitive mode', () => {
    expect(containsQuery('Hello World', 'hello', true)).toBe(false)
    expect(containsQuery('Hello World', 'Hello', true)).toBe(true)
  })

  it('should return false for empty query', () => {
    expect(containsQuery('Hello world', '')).toBe(false)
  })

  it('should return false for empty text', () => {
    expect(containsQuery('', 'test')).toBe(false)
  })
})

describe('getMatchSnippet', () => {
  it('should return snippet around match', () => {
    const text = 'The quick brown fox jumps over the lazy dog'
    const snippet = getMatchSnippet(text, 'fox')

    expect(snippet).toContain('fox')
    expect(snippet).toBeTruthy()
  })

  it('should add ellipsis when truncated', () => {
    const text = 'The quick brown fox jumps over the lazy dog'
    const snippet = getMatchSnippet(text, 'fox', { beforeChars: 5, afterChars: 5 })

    expect(snippet).toContain('...')
    expect(snippet).toContain('fox')
  })

  it('should not add leading ellipsis at start', () => {
    const text = 'Hello world'
    const snippet = getMatchSnippet(text, 'Hello')

    expect(snippet?.startsWith('...')).toBe(false)
  })

  it('should not add trailing ellipsis at end', () => {
    const text = 'Hello world'
    const snippet = getMatchSnippet(text, 'world')

    expect(snippet?.endsWith('...')).toBe(false)
  })

  it('should return null for no match', () => {
    const snippet = getMatchSnippet('Hello world', 'xyz')

    expect(snippet).toBeNull()
  })

  it('should return null for empty query', () => {
    const snippet = getMatchSnippet('Hello world', '')

    expect(snippet).toBeNull()
  })

  it('should support case sensitive mode', () => {
    const snippet = getMatchSnippet('Hello world', 'hello', { caseSensitive: true })

    expect(snippet).toBeNull()
  })

  it('should use default character limits', () => {
    const text = 'a'.repeat(200)
    const snippet = getMatchSnippet(text + 'MATCH' + 'b'.repeat(200), 'MATCH')

    expect(snippet).toBeTruthy()
    expect(snippet!.length).toBeLessThan(200)
  })
})

describe('Highlight component', () => {
  it('should render highlighted text', () => {
    render(<Highlight text="Hello world" query="world" />)

    const mark = screen.getByText('world')
    expect(mark.tagName).toBe('MARK')
  })

  it('should apply custom className to wrapper', () => {
    const { container } = render(
      <Highlight text="Hello world" query="world" className="custom-wrapper" />
    )
    const span = container.querySelector('span')

    expect(span).toHaveClass('custom-wrapper')
  })

  it('should pass config to highlightText', () => {
    render(
      <Highlight text="test TEST" query="test" config={{ caseSensitive: true }} />
    )

    const marks = screen.getAllByText('test')
    expect(marks).toHaveLength(1)
  })

  it('should render plain text when no match', () => {
    render(<Highlight text="Hello world" query="xyz" />)

    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })
})
