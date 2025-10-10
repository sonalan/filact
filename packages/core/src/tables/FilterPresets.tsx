/**
 * Filter Presets Component
 * Allows users to save and load filter combinations
 */

import { useState } from 'react'
import type { Filter } from '../types/table'

export interface FilterPreset {
  id: string
  name: string
  filters: Record<string, unknown>
  description?: string
  isDefault?: boolean
}

export interface FilterPresetsProps {
  /** Available presets */
  presets: FilterPreset[]

  /** Current active filters */
  currentFilters?: Record<string, unknown>

  /** Apply preset handler */
  onApplyPreset: (preset: FilterPreset) => void

  /** Save preset handler */
  onSavePreset?: (name: string, filters: Record<string, unknown>, description?: string) => void

  /** Delete preset handler */
  onDeletePreset?: (presetId: string) => void

  /** Update preset handler */
  onUpdatePreset?: (presetId: string, filters: Record<string, unknown>) => void

  /** Custom className */
  className?: string

  /** Show save button */
  showSave?: boolean

  /** Show delete button */
  showDelete?: boolean
}

/**
 * Filter Presets Component
 * Manage and apply filter presets
 */
export function FilterPresets({
  presets,
  currentFilters = {},
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  onUpdatePreset,
  className = '',
  showSave = true,
  showDelete = true,
}: FilterPresetsProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')

  const handleSave = () => {
    if (!presetName.trim() || !onSavePreset) return

    onSavePreset(presetName.trim(), currentFilters, presetDescription.trim() || undefined)
    setPresetName('')
    setPresetDescription('')
    setShowSaveDialog(false)
  }

  const handleUpdate = (presetId: string) => {
    if (!onUpdatePreset) return
    onUpdatePreset(presetId, currentFilters)
  }

  const hasActiveFilters = Object.keys(currentFilters).length > 0

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Filter Presets</h3>
        {showSave && hasActiveFilters && onSavePreset && (
          <button
            type="button"
            onClick={() => setShowSaveDialog(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Save as preset
          </button>
        )}
      </div>

      {presets.length === 0 ? (
        <p className="text-sm text-gray-500">No saved presets</p>
      ) : (
        <div className="space-y-1">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
            >
              <button
                type="button"
                onClick={() => onApplyPreset(preset)}
                className="flex-1 text-left"
              >
                <div className="text-sm font-medium text-gray-900">
                  {preset.name}
                  {preset.isDefault && (
                    <span className="ml-2 text-xs text-gray-500">(Default)</span>
                  )}
                </div>
                {preset.description && (
                  <div className="text-xs text-gray-500">{preset.description}</div>
                )}
              </button>

              <div className="flex items-center gap-1">
                {onUpdatePreset && hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => handleUpdate(preset.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Update preset with current filters"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
                {showDelete && onDeletePreset && !preset.isDefault && (
                  <button
                    type="button"
                    onClick={() => onDeletePreset(preset.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete preset"
                  >
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Save Filter Preset</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preset Name
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Filters"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description of this filter preset"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowSaveDialog(false)
                  setPresetName('')
                  setPresetDescription('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!presetName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
