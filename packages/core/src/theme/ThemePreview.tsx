/**
 * Theme Preview Component
 * Preview theme with sample UI elements before applying
 */

import { useState } from 'react'
import type { ThemeMode, ColorScheme } from './types'

export interface ThemePreviewProps {
  /** Theme to preview */
  theme: ThemeMode

  /** Light color scheme */
  lightScheme?: ColorScheme

  /** Dark color scheme */
  darkScheme?: ColorScheme

  /** Apply theme callback */
  onApply?: (theme: ThemeMode) => void

  /** Cancel callback */
  onCancel?: () => void

  /** Custom className */
  className?: string

  /** Show action buttons */
  showActions?: boolean
}

/**
 * Theme Preview Component
 * Shows a preview of the theme with sample UI elements
 */
export function ThemePreview({
  theme,
  lightScheme,
  darkScheme,
  onApply,
  onCancel,
  className = '',
  showActions = true,
}: ThemePreviewProps) {
  const [previewTheme, setPreviewTheme] = useState<ThemeMode>(theme)

  const resolvedTheme = previewTheme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : previewTheme

  const scheme = resolvedTheme === 'dark' ? darkScheme : lightScheme

  const isDark = resolvedTheme === 'dark'

  const bgColor = isDark ? '#1a1a1a' : '#ffffff'
  const textColor = isDark ? '#e5e5e5' : '#171717'
  const borderColor = isDark ? '#404040' : '#e5e5e5'
  const primaryColor = scheme?.primary || (isDark ? '#3b82f6' : '#2563eb')
  const secondaryBg = isDark ? '#262626' : '#f5f5f5'

  return (
    <div className={`p-6 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Theme Preview</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreviewTheme('light')}
            className={`px-3 py-1 text-sm rounded ${
              previewTheme === 'light'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setPreviewTheme('dark')}
            className={`px-3 py-1 text-sm rounded ${
              previewTheme === 'dark'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setPreviewTheme('system')}
            className={`px-3 py-1 text-sm rounded ${
              previewTheme === 'system'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            System
          </button>
        </div>
      </div>

      {/* Preview Window */}
      <div
        className="rounded-lg p-6 space-y-4"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
          <h4 className="text-xl font-bold">Sample Application</h4>
          <button
            type="button"
            className="px-4 py-2 rounded font-medium"
            style={{ backgroundColor: primaryColor, color: '#ffffff' }}
          >
            Primary Button
          </button>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded"
            style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
          >
            <h5 className="font-semibold mb-2">Card Title</h5>
            <p className="text-sm opacity-80">
              This is a preview of how content will look in this theme.
            </p>
          </div>
          <div
            className="p-4 rounded"
            style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
          >
            <h5 className="font-semibold mb-2">Another Card</h5>
            <p className="text-sm opacity-80">
              Colors and contrast are adjusted based on the selected theme.
            </p>
          </div>
        </div>

        {/* Form Elements */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Input Field</label>
            <input
              type="text"
              placeholder="Sample input"
              className="w-full px-3 py-2 rounded"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="preview-checkbox"
              className="rounded"
              style={{ accentColor: primaryColor }}
            />
            <label htmlFor="preview-checkbox" className="text-sm">
              Checkbox option
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div
          className="p-3 rounded text-sm"
          style={{
            backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
            color: isDark ? '#93c5fd' : '#1e40af',
            border: `1px solid ${isDark ? '#3b82f6' : '#93c5fd'}`,
          }}
        >
          <strong>Info:</strong> This is how informational messages will appear.
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex justify-end gap-2 mt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
          )}
          {onApply && (
            <button
              type="button"
              onClick={() => onApply(previewTheme)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
            >
              Apply Theme
            </button>
          )}
        </div>
      )}
    </div>
  )
}
