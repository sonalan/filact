/**
 * Text highlighting utilities for search results
 */

import { type ReactNode } from 'react'

/**
 * Highlight configuration
 */
export interface HighlightConfig {
  /** CSS class name for highlighted text */
  className?: string

  /** Case sensitive matching */
  caseSensitive?: boolean

  /** Match whole words only */
  wholeWord?: boolean

  /** Maximum number of highlights per text */
  maxHighlights?: number
}

/**
 * Default highlight configuration
 */
const DEFAULT_CONFIG: Required<HighlightConfig> = {
  className: 'bg-yellow-200 font-semibold',
  caseSensitive: false,
  wholeWord: false,
  maxHighlights: -1, // unlimited
}

/**
 * Escape special regex characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Build regex pattern for highlighting
 */
function buildHighlightPattern(query: string, config: Required<HighlightConfig>): RegExp {
  const escapedQuery = escapeRegExp(query)
  const pattern = config.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery
  const flags = config.caseSensitive ? 'g' : 'gi'

  return new RegExp(pattern, flags)
}

/**
 * Highlight matches in text
 */
export function highlightText(
  text: string,
  query: string,
  config?: HighlightConfig
): ReactNode {
  if (!query || !text) {
    return text
  }

  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const pattern = buildHighlightPattern(query, finalConfig)
  const parts: ReactNode[] = []

  let lastIndex = 0
  let matchCount = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Check max highlights limit
    if (finalConfig.maxHighlights > 0 && matchCount >= finalConfig.maxHighlights) {
      break
    }

    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add highlighted match
    parts.push(
      <mark key={`highlight-${matchCount}-${match.index}`} className={finalConfig.className}>
        {match[0]}
      </mark>
    )

    lastIndex = match.index + match[0].length
    matchCount++

    // Prevent infinite loop for zero-length matches
    if (match.index === pattern.lastIndex) {
      pattern.lastIndex++
    }
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  // If no highlights were added, return the original text
  if (matchCount === 0) {
    return text
  }

  return parts
}

/**
 * Highlight matches in multiple texts (for multi-column search)
 */
export function highlightMultipleTexts(
  texts: Record<string, string>,
  query: string,
  config?: HighlightConfig
): Record<string, ReactNode> {
  const result: Record<string, ReactNode> = {}

  Object.entries(texts).forEach(([key, text]) => {
    result[key] = highlightText(text, query, config)
  })

  return result
}

/**
 * Check if text contains query
 */
export function containsQuery(
  text: string,
  query: string,
  caseSensitive: boolean = false
): boolean {
  if (!query || !text) {
    return false
  }

  if (caseSensitive) {
    return text.includes(query)
  }

  return text.toLowerCase().includes(query.toLowerCase())
}

/**
 * Get snippet of text around match
 */
export function getMatchSnippet(
  text: string,
  query: string,
  config?: {
    beforeChars?: number
    afterChars?: number
    caseSensitive?: boolean
  }
): string | null {
  const { beforeChars = 50, afterChars = 50, caseSensitive = false } = config || {}

  if (!query || !text) {
    return null
  }

  const searchText = caseSensitive ? text : text.toLowerCase()
  const searchQuery = caseSensitive ? query : query.toLowerCase()
  const matchIndex = searchText.indexOf(searchQuery)

  if (matchIndex === -1) {
    return null
  }

  const start = Math.max(0, matchIndex - beforeChars)
  const end = Math.min(text.length, matchIndex + query.length + afterChars)

  let snippet = text.substring(start, end)

  // Add ellipsis if truncated
  if (start > 0) {
    snippet = '...' + snippet
  }
  if (end < text.length) {
    snippet = snippet + '...'
  }

  return snippet
}

/**
 * Highlight React component
 */
export interface HighlightProps {
  /** Text to highlight */
  text: string

  /** Search query */
  query: string

  /** Highlight configuration */
  config?: HighlightConfig

  /** Additional className for wrapper */
  className?: string
}

/**
 * Highlight component for rendering highlighted text
 */
export function Highlight({ text, query, config, className = '' }: HighlightProps): JSX.Element {
  const highlighted = highlightText(text, query, config)

  return <span className={className}>{highlighted}</span>
}
