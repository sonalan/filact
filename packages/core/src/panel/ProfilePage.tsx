/**
 * Profile Page Component
 * Displays and allows editing of user profile information
 */

import { useState } from 'react'

export interface ProfilePageProps {
  /** Current user data */
  user?: any

  /** Callback when profile is updated */
  onUpdate?: (data: any) => void | Promise<void>

  /** Fields to display/edit */
  fields?: ProfileField[]

  /** Show avatar upload */
  showAvatar?: boolean

  /** Enable editing */
  editable?: boolean

  /** Custom avatar component */
  avatarComponent?: React.ComponentType<{ user: any; onUpload?: (file: File) => void }>

  /** Custom form component */
  formComponent?: React.ComponentType<{ user: any; fields: ProfileField[]; onSubmit: (data: any) => void }>
}

export interface ProfileField {
  /** Field name */
  name: string

  /** Field label */
  label: string

  /** Field type */
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'date'

  /** Field is editable */
  editable?: boolean

  /** Field is required */
  required?: boolean

  /** Field options (for select) */
  options?: Array<{ value: string; label: string }>

  /** Field validation */
  validate?: (value: any) => string | undefined

  /** Field format function for display */
  format?: (value: any) => string
}

export function ProfilePage({
  user,
  onUpdate,
  fields = defaultFields,
  showAvatar = true,
  editable = true,
  avatarComponent: AvatarComponent,
  formComponent: FormComponent,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
    setFormData(user || {})
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData(user || {})
    setErrors({})
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.name]

      if (field.required && !value) {
        newErrors[field.name] = `${field.label} is required`
      }

      if (field.validate && value) {
        const error = field.validate(value)
        if (error) {
          newErrors[field.name] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onUpdate?.(formData)
      setIsEditing(false)
      setErrors({})
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleAvatarUpload = async (file: File) => {
    // This would be handled by the parent component
    // For now, just call onUpdate with the file
    try {
      await onUpdate?.({ avatar: file })
    } catch (error) {
      console.error('Failed to upload avatar:', error)
    }
  }

  // Use custom form component if provided
  if (FormComponent && isEditing) {
    return (
      <FormComponent
        user={user}
        fields={fields}
        onSubmit={async (data) => {
          setIsSubmitting(true)
          try {
            await onUpdate?.(data)
            setIsEditing(false)
          } catch (error) {
            console.error('Failed to update profile:', error)
          } finally {
            setIsSubmitting(false)
          }
        }}
      />
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
        {editable && !isEditing && (
          <button onClick={handleEdit} type="button">
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        {showAvatar && (
          <div className="profile-avatar-section">
            {AvatarComponent ? (
              <AvatarComponent user={user} onUpload={isEditing ? handleAvatarUpload : undefined} />
            ) : (
              <div className="profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || 'User'} />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-fields">
            {fields.map((field) => {
              const value = isEditing ? formData[field.name] : user?.[field.name]
              const displayValue = field.format ? field.format(value) : value
              const fieldEditable = field.editable !== false

              if (!isEditing) {
                return (
                  <div key={field.name} className="profile-field-display">
                    <label>{field.label}</label>
                    <div className="profile-field-value">{displayValue || '-'}</div>
                  </div>
                )
              }

              if (!fieldEditable) {
                return (
                  <div key={field.name} className="profile-field-display">
                    <label>{field.label}</label>
                    <div className="profile-field-value">{displayValue || '-'}</div>
                  </div>
                )
              }

              return (
                <div key={field.name} className="profile-field-edit">
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={value || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                      disabled={isSubmitting}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={value || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                      disabled={isSubmitting}
                    >
                      <option value="">Select...</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || 'text'}
                      value={value || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                      disabled={isSubmitting}
                    />
                  )}

                  {errors[field.name] && (
                    <div className="profile-field-error">{errors[field.name]}</div>
                  )}
                </div>
              )
            })}
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

/**
 * Default profile fields
 */
const defaultFields: ProfileField[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    validate: (value: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email address'
      }
    },
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
  },
  {
    name: 'bio',
    label: 'Bio',
    type: 'textarea',
  },
]
