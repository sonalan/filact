/**
 * Stats Widget Component
 * Display KPIs and metrics with trend indicators
 */

import { ReactNode } from 'react'

export type TrendDirection = 'up' | 'down' | 'neutral'

export interface StatsWidgetProps {
  /** Main value to display */
  value: string | number

  /** Label/title for the stat */
  label: string

  /** Optional description */
  description?: string

  /** Icon to display */
  icon?: ReactNode

  /** Trend direction */
  trend?: TrendDirection

  /** Trend value (e.g., "+12%", "-5%") */
  trendValue?: string

  /** Comparison text (e.g., "vs last month") */
  comparisonText?: string

  /** Previous period value for auto-calculation */
  previousValue?: number

  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'

  /** Loading state */
  loading?: boolean

  /** Click handler */
  onClick?: () => void

  /** Custom className */
  className?: string

  /** Format function for value display */
  formatValue?: (value: string | number) => string
}

/**
 * Calculate trend from current and previous values
 */
function calculateTrend(
  current: number,
  previous: number
): { direction: TrendDirection; value: string } {
  if (previous === 0) {
    return { direction: 'neutral', value: '0%' }
  }

  const change = ((current - previous) / previous) * 100
  const direction: TrendDirection =
    change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'

  return {
    direction,
    value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
  }
}

/**
 * Default value formatter
 */
function defaultFormatValue(value: string | number): string {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return value.toString()
}

/**
 * Stats Widget Component
 * Display KPI metrics with trends
 */
export function StatsWidget({
  value,
  label,
  description,
  icon,
  trend,
  trendValue,
  comparisonText = 'vs previous period',
  previousValue,
  variant = 'default',
  loading = false,
  onClick,
  className = '',
  formatValue = defaultFormatValue,
}: StatsWidgetProps) {
  // Auto-calculate trend if previousValue is provided
  const calculatedTrend =
    previousValue !== undefined && typeof value === 'number'
      ? calculateTrend(value, previousValue)
      : null

  const finalTrend = trend || calculatedTrend?.direction
  const finalTrendValue = trendValue || calculatedTrend?.value

  // Variant colors
  const variantColors = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }

  const iconColors = {
    default: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }

  const formattedValue = formatValue(value)

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-lg border ${variantColors[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      } ${className}`}
    >
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              {description && (
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
            {icon && (
              <div className={`ml-4 ${iconColors[variant]}`}>{icon}</div>
            )}
          </div>

          <div className="mt-3">
            <p className="text-3xl font-bold text-gray-900">{formattedValue}</p>
          </div>

          {(finalTrend || finalTrendValue) && (
            <div className="mt-3 flex items-center gap-2">
              {finalTrend && (
                <span className={`text-sm font-medium ${trendColors[finalTrend]}`}>
                  {finalTrend === 'up' && (
                    <svg
                      className="inline w-4 h-4 mr-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {finalTrend === 'down' && (
                    <svg
                      className="inline w-4 h-4 mr-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {finalTrend === 'neutral' && (
                    <svg
                      className="inline w-4 h-4 mr-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {finalTrendValue}
                </span>
              )}
              <span className="text-sm text-gray-500">{comparisonText}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
