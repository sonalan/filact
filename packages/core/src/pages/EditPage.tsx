/**
 * Edit Page Component
 * Auto-generated CRUD edit page with form integration
 */

import { useNavigate, useParams } from 'react-router-dom'
import type { BaseModel } from '../types/resource'
import type { ResourceConfig } from '../resources/builder'
import { useResourceOne, useResourceUpdate } from '../hooks/useResource'

export interface EditPageProps<TModel extends BaseModel> {
  /** Resource configuration */
  config: ResourceConfig<TModel>

  /** Record ID to edit (optional if using route params) */
  id?: string | number

  /** Callback after successful update */
  onSuccess?: (record: TModel) => void

  /** Callback on cancel */
  onCancel?: () => void

  /** Custom form renderer */
  renderForm?: (props: {
    record: TModel
    onSubmit: (data: Partial<TModel>) => void
    isLoading: boolean
  }) => React.ReactNode
}

/**
 * Edit Page Component
 * Displays a form for editing existing records
 */
export function EditPage<TModel extends BaseModel>({
  config,
  id: propId,
  onSuccess,
  onCancel,
  renderForm,
}: EditPageProps<TModel>) {
  const navigate = useNavigate()
  const params = useParams()

  // Use prop id if provided, otherwise try to get from route params
  const id = propId ?? params.id

  const { data: record, isLoading, isError, error } = useResourceOne(config, id)
  const { mutate, isPending: isUpdating, isError: isUpdateError, error: updateError } = useResourceUpdate(config)

  const handleSubmit = (data: Partial<TModel>) => {
    if (!id) return

    mutate(
      { id, data },
      {
        onSuccess: (updated) => {
          if (onSuccess) {
            onSuccess(updated)
          } else {
            // Default: navigate back to list
            navigate('..')
          }
        },
      }
    )
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      // Default: navigate back to list
      navigate('..')
    }
  }

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
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Edit {config.model.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update the form below to edit this {config.model.name.toLowerCase()}
        </p>
      </div>

      {/* Error Alert */}
      {isUpdateError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Error updating record</p>
          <p className="text-sm mt-1">{updateError?.message || 'An error occurred'}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border rounded-lg p-6">
        {renderForm ? (
          renderForm({ record, onSubmit: handleSubmit, isLoading: isUpdating })
        ) : (
          <DefaultEditForm
            config={config}
            record={record}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isUpdating}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Default edit form renderer
 * Renders a basic form based on the form schema with pre-filled values
 */
function DefaultEditForm<TModel extends BaseModel>({
  config,
  record,
  onSubmit,
  onCancel,
  isLoading,
}: {
  config: ResourceConfig<TModel>
  record: TModel
  onSubmit: (data: Partial<TModel>) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: Record<string, unknown> = {}

    // Process form data and handle checkboxes
    const form = e.currentTarget
    formData.forEach((value, key) => {
      const field = config.form?.fields.find(f => String(f.name) === key)
      if (field?.type === 'checkbox') {
        // Checkbox is checked if it appears in FormData
        data[key] = true
      } else {
        data[key] = value
      }
    })

    // Handle unchecked checkboxes (they don't appear in FormData)
    config.form?.fields.forEach(field => {
      if (field.type === 'checkbox' && !formData.has(String(field.name))) {
        data[String(field.name)] = false
      }
    })

    onSubmit(data as Partial<TModel>)
  }

  if (!config.form) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No form schema defined for this resource</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {config.form.fields.map((field) => {
        const fieldValue = record[field.name as keyof TModel]

        return (
          <div key={String(field.name)}>
            <label
              htmlFor={String(field.name)}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
              <input
                type={field.type}
                id={String(field.name)}
                name={String(field.name)}
                defaultValue={String(fieldValue ?? '')}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled || isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            ) : field.type === 'textarea' ? (
              <textarea
                id={String(field.name)}
                name={String(field.name)}
                defaultValue={String(fieldValue ?? '')}
                placeholder={field.placeholder}
                required={field.required}
                disabled={field.disabled || isLoading}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            ) : field.type === 'select' && 'options' in field ? (
              <select
                id={String(field.name)}
                name={String(field.name)}
                defaultValue={String(fieldValue ?? '')}
                required={field.required}
                disabled={field.disabled || isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select...</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={String(field.name)}
                  name={String(field.name)}
                  defaultChecked={Boolean(fieldValue)}
                  disabled={field.disabled || isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={String(field.name)} className="ml-2 text-sm text-gray-700">
                  {field.placeholder}
                </label>
              </div>
            ) : null}

            {field.helperText && (
              <p className="text-sm text-gray-500 mt-1">{field.helperText}</p>
            )}
          </div>
        )
      })}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </form>
  )
}
