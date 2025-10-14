/**
 * Responsive Table Component
 * Automatically switches between table and card view based on screen size
 */

import type { BaseModel } from '../types/resource'
import type { ColumnDef } from '@tanstack/react-table'
import { useIsMobile } from '../hooks/useMediaQuery'
import { MobileCardList } from './MobileCardList'

export interface ResponsiveTableProps<TModel extends BaseModel> {
  /** Table data */
  data: TModel[]

  /** Column definitions */
  columns: ColumnDef<TModel>[]

  /** Desktop table component */
  desktopTable: React.ReactNode

  /** Fields to show in mobile card view */
  mobileFields?: Array<keyof TModel | { key: keyof TModel; label: string }>

  /** Custom mobile card renderer */
  renderMobileCard?: (item: TModel, index: number) => React.ReactNode

  /** Row/card click handler */
  onRowClick?: (item: TModel) => void

  /** Loading state */
  isLoading?: boolean

  /** Empty state message */
  emptyMessage?: string

  /** Custom className */
  className?: string
}

/**
 * Responsive Table Component
 * Shows table on desktop, cards on mobile
 */
export function ResponsiveTable<TModel extends BaseModel>({
  data,
  columns,
  desktopTable,
  mobileFields,
  renderMobileCard,
  onRowClick,
  isLoading = false,
  emptyMessage,
  className = '',
}: ResponsiveTableProps<TModel>) {
  const isMobile = useIsMobile()

  // Extract field names from columns if not provided
  const defaultMobileFields = mobileFields || (
    columns
      .slice(0, 4) // Show first 4 columns on mobile
      .map((col) => {
        if ('accessorKey' in col && typeof col.accessorKey === 'string') {
          return {
            key: col.accessorKey as keyof TModel,
            label: typeof col.header === 'string' ? col.header : col.accessorKey,
          }
        }
        return null
      })
      .filter(Boolean) as Array<{ key: keyof TModel; label: string }>
  )

  if (isMobile) {
    return (
      <div className={className}>
        <MobileCardList
          data={data}
          fields={defaultMobileFields}
          renderCard={renderMobileCard}
          onCardClick={onRowClick}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
        />
      </div>
    )
  }

  return (
    <div className={className} data-testid="desktop-table">
      {desktopTable}
    </div>
  )
}
