/**
 * Mobile Card List Component
 * Displays table data as cards on mobile devices
 */

import type { BaseModel } from '../types/resource'

export interface MobileCardListProps<TModel extends BaseModel> {
  /** Data to display */
  data: TModel[]

  /** Fields to display in each card */
  fields?: Array<keyof TModel | { key: keyof TModel; label: string }>

  /** Custom card render function */
  renderCard?: (item: TModel, index: number) => React.ReactNode

  /** Card click handler */
  onCardClick?: (item: TModel) => void

  /** Loading state */
  isLoading?: boolean

  /** Empty state message */
  emptyMessage?: string

  /** Custom className */
  className?: string
}

/**
 * Mobile Card List Component
 * Renders data as cards for mobile-friendly viewing
 */
export function MobileCardList<TModel extends BaseModel>({
  data,
  fields,
  renderCard,
  onCardClick,
  isLoading = false,
  emptyMessage = 'No items found',
  className = '',
}: MobileCardListProps<TModel>) {
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`} data-testid="mobile-cards">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div
        className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}
        data-testid="mobile-cards"
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`} data-testid="mobile-cards">
      {data.map((item, index) => {
        if (renderCard) {
          return (
            <div key={item.id} data-testid="user-card">
              {renderCard(item, index)}
            </div>
          )
        }

        return (
          <div
            key={item.id}
            data-testid="user-card"
            className={`
              bg-white dark:bg-gray-800 rounded-lg p-4 shadow
              ${onCardClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
            `}
            onClick={() => onCardClick?.(item)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onCardClick) {
                e.preventDefault()
                onCardClick(item)
              }
            }}
            role={onCardClick ? 'button' : undefined}
            tabIndex={onCardClick ? 0 : undefined}
          >
            {fields ? (
              <div className="space-y-2">
                {fields.map((field) => {
                  const key = typeof field === 'string' ? field : field.key
                  const label =
                    typeof field === 'string'
                      ? String(key)
                      : field.label

                  return (
                    <div key={String(key)} className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {label}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {String(item[key] ?? '-')}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(item).map(([key, value]) => {
                  if (key === 'id') return null

                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {key}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {String(value ?? '-')}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
