/**
 * Bulk Actions Helpers
 * Utility functions for creating common bulk actions
 */

import type { BaseModel } from '../types/resource'
import type { BulkAction } from '../types/action'
import type { ResourceConfig } from '../resources/builder'

/**
 * Creates a bulk delete action
 */
export function createBulkDeleteAction<TModel extends BaseModel>(
  config: ResourceConfig<TModel>,
  options?: {
    label?: string
    confirmTitle?: string
    confirmMessage?: string
    requireConfirmation?: boolean
  }
): BulkAction<TModel> {
  return {
    label: options?.label || 'Delete Selected',
    destructive: true,
    requireConfirmation: options?.requireConfirmation !== false,
    confirmTitle: options?.confirmTitle || 'Delete Records',
    confirmMessage:
      options?.confirmMessage ||
      'Are you sure you want to delete the selected records? This action cannot be undone.',
    handler: async (records: TModel[]) => {
      const ids = records.map((record) => record[config.model.primaryKey || 'id'])

      // Run beforeDelete hook for each record if it exists
      if (config.hooks?.beforeDelete) {
        for (const record of records) {
          const canDelete = await config.hooks.beforeDelete(record)
          if (canDelete === false) {
            throw new Error(`Delete operation cancelled by hook for record ${record[config.model.primaryKey || 'id']}`)
          }
        }
      }

      // Perform bulk delete
      await config.provider.deleteMany(config.model.endpoint, {
        filter: {
          [config.model.primaryKey || 'id']: { in: ids },
        },
      })

      // Run afterDelete hook for each record if it exists
      if (config.hooks?.afterDelete) {
        for (const id of ids) {
          await config.hooks.afterDelete(id)
        }
      }
    },
  }
}

/**
 * Creates a bulk export action
 */
export function createBulkExportAction<TModel extends BaseModel>(
  format: 'csv' | 'json',
  options?: {
    label?: string
    filename?: string
  }
): BulkAction<TModel> {
  return {
    label: options?.label || `Export as ${format.toUpperCase()}`,
    handler: async (records: TModel[]) => {
      const filename = options?.filename || `export-${Date.now()}.${format}`

      if (format === 'csv') {
        const csv = convertToCSV(records)
        downloadFile(csv, filename, 'text/csv')
      } else {
        const json = JSON.stringify(records, null, 2)
        downloadFile(json, filename, 'application/json')
      }
    },
  }
}

/**
 * Creates a custom bulk action
 */
export function createBulkAction<TModel extends BaseModel>(
  label: string,
  handler: (records: TModel[]) => Promise<void>,
  options?: {
    destructive?: boolean
    requireConfirmation?: boolean
    confirmTitle?: string
    confirmMessage?: string
  }
): BulkAction<TModel> {
  return {
    label,
    destructive: options?.destructive,
    requireConfirmation: options?.requireConfirmation,
    confirmTitle: options?.confirmTitle,
    confirmMessage: options?.confirmMessage,
    handler,
  }
}

/**
 * Helper: Convert records to CSV format
 */
function convertToCSV<TModel extends BaseModel>(records: TModel[]): string {
  if (records.length === 0) return ''

  const headers = Object.keys(records[0])
  const rows = records.map((record) =>
    headers.map((header) => {
      const value = record[header as keyof TModel]
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value ?? '')
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
  )

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

/**
 * Helper: Download file to browser
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
