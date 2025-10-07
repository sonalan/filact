/**
 * Show Page Component
 * Auto-generated CRUD show page for viewing record details
 */

import { useNavigate, useParams } from 'react-router-dom'
import type { BaseModel } from '../types/resource'
import type { ResourceConfig } from '../resources/builder'
import { useResourceOne } from '../hooks/useResource'

export interface ShowPageProps<TModel extends BaseModel> {
  /** Resource configuration */
  config: ResourceConfig<TModel>

  /** Record ID to show (optional if using route params) */
  id?: string | number

  /** Custom renderer for record details */
  renderDetails?: (record: TModel) => React.ReactNode

  /** Custom actions */
  actions?: React.ReactNode
}

/**
 * Show Page Component
 * Displays detailed view of a single record
 */
export function ShowPage<TModel extends BaseModel>({
  config,
  id: propId,
  renderDetails,
  actions,
}: ShowPageProps<TModel>) {
  const navigate = useNavigate()
  const params = useParams()

  // Use prop id if provided, otherwise try to get from route params
  const id = propId ?? params.id

  const { data: record, isLoading, isError, error } = useResourceOne(config, id)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div>Loading...</div>
      </div>
    )
  }

  // Error loading record
  if (isError || !record) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        <div>
          <h3 className="text-lg font-semibold mb-2">Error loading {config.model.name}</h3>
          <p className="text-sm">{error?.message || 'Record not found'}</p>
          <button
            onClick={() => navigate('..')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{config.model.name} Details</h1>
          <p className="text-sm text-gray-500 mt-1">
            View details for {config.model.name.toLowerCase()} #{String(record[config.model.primaryKey || 'id'])}
          </p>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Details */}
      <div className="bg-white border rounded-lg p-6">
        {renderDetails ? (
          renderDetails(record)
        ) : (
          <DefaultDetails config={config} record={record} />
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={() => navigate('..')}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to List
        </button>
      </div>
    </div>
  )
}

/**
 * Default details renderer
 * Displays record fields in a grid layout
 */
function DefaultDetails<TModel extends BaseModel>({
  config,
  record,
}: {
  config: ResourceConfig<TModel>
  record: TModel
}) {
  // If form schema is available, use it to determine which fields to show
  const fieldsToShow = config.form?.fields || []

  if (fieldsToShow.length === 0) {
    // Fallback: show all record properties
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(record).map(([key, value]) => (
          <div key={key}>
            <dt className="text-sm font-medium text-gray-500 mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </dt>
            <dd className="text-sm text-gray-900">
              {value !== null && value !== undefined
                ? typeof value === 'boolean'
                  ? value
                    ? 'Yes'
                    : 'No'
                  : String(value)
                : '-'}
            </dd>
          </div>
        ))}
      </div>
    )
  }

  // Use form schema fields
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {fieldsToShow.map((field) => {
        const value = record[field.name as keyof TModel]

        return (
          <div key={String(field.name)}>
            <dt className="text-sm font-medium text-gray-500 mb-1">{field.label}</dt>
            <dd className="text-sm text-gray-900">
              {field.type === 'checkbox' ? (
                value ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    No
                  </span>
                )
              ) : field.type === 'select' && 'options' in field ? (
                field.options?.find((opt) => opt.value === value)?.label || String(value ?? '-')
              ) : value !== null && value !== undefined ? (
                String(value)
              ) : (
                '-'
              )}
            </dd>
          </div>
        )
      })}
    </div>
  )
}
