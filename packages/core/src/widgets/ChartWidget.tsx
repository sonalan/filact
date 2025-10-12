/**
 * Chart Widget Component
 * Displays data visualizations with various chart types
 */

import { useMemo, ReactNode } from 'react'

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut'

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  [key: string]: any
}

export interface ChartSeries {
  name: string
  data: number[]
  color?: string
}

export interface ChartWidgetProps {
  /** Chart type */
  type: ChartType

  /** Chart data */
  data: ChartDataPoint[] | ChartSeries[]

  /** Chart title */
  title?: string

  /** Chart description */
  description?: string

  /** Chart height in pixels */
  height?: number

  /** Show legend */
  showLegend?: boolean

  /** Show grid lines */
  showGrid?: boolean

  /** Show data labels */
  showDataLabels?: boolean

  /** X-axis label */
  xAxisLabel?: string

  /** Y-axis label */
  yAxisLabel?: string

  /** X-axis categories (for bar/line charts) */
  categories?: string[]

  /** Custom colors */
  colors?: string[]

  /** Loading state */
  loading?: boolean

  /** Error message */
  error?: string

  /** Custom className */
  className?: string

  /** Click handler for data points */
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
]

/**
 * Chart Widget Component
 * Simple data visualization component
 */
export function ChartWidget({
  type,
  data,
  title,
  description,
  height = 300,
  showLegend = true,
  showGrid = true,
  showDataLabels = false,
  xAxisLabel,
  yAxisLabel,
  categories,
  colors = DEFAULT_COLORS,
  loading = false,
  error,
  className = '',
  onDataPointClick,
}: ChartWidgetProps) {
  // Normalize data to ChartDataPoint[]
  const chartData = useMemo(() => {
    if (data.length === 0) return []

    // Check if it's series data
    if ('name' in data[0] && 'data' in data[0]) {
      const series = data as ChartSeries[]
      return series[0].data.map((value, index) => ({
        label: categories?.[index] || `Point ${index + 1}`,
        value,
        color: colors[index % colors.length],
      }))
    }

    return data as ChartDataPoint[]
  }, [data, categories, colors])

  // Calculate totals for percentage calculations
  const total = useMemo(() => {
    return chartData.reduce((sum, point) => sum + point.value, 0)
  }, [chartData])

  // Render loading state
  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg shadow p-6 ${className}`}
        style={{ height }}
      >
        <div className="animate-pulse space-y-4">
          {title && <div className="h-6 bg-gray-200 rounded w-1/3" />}
          <div className="h-full bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div
        className={`bg-white rounded-lg shadow p-6 ${className}`}
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-900 font-medium">Failed to load chart</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Render empty state
  if (chartData.length === 0) {
    return (
      <div
        className={`bg-white rounded-lg shadow p-6 ${className}`}
        style={{ height }}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No data to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}

      {/* Chart Container */}
      <div style={{ height }}>
        {type === 'pie' || type === 'donut' ? (
          <PieChart
            data={chartData}
            colors={colors}
            showLegend={showLegend}
            showDataLabels={showDataLabels}
            isDonut={type === 'donut'}
            total={total}
            onDataPointClick={onDataPointClick}
          />
        ) : (
          <BarLineChart
            type={type}
            data={chartData}
            colors={colors}
            showGrid={showGrid}
            showDataLabels={showDataLabels}
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
            onDataPointClick={onDataPointClick}
          />
        )}
      </div>
    </div>
  )
}

// Simple Pie/Donut Chart Implementation
function PieChart({
  data,
  colors,
  showLegend,
  showDataLabels,
  isDonut,
  total,
  onDataPointClick,
}: {
  data: ChartDataPoint[]
  colors: string[]
  showLegend: boolean
  showDataLabels: boolean
  isDonut: boolean
  total: number
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void
}) {
  const radius = 100
  const centerX = 120
  const centerY = 120
  const innerRadius = isDonut ? radius * 0.6 : 0

  let currentAngle = -90

  const slices = data.map((point, index) => {
    const percentage = (point.value / total) * 100
    const angle = (point.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    // Calculate arc path
    const x1 = centerX + radius * Math.cos(startRad)
    const y1 = centerY + radius * Math.sin(startRad)
    const x2 = centerX + radius * Math.cos(endRad)
    const y2 = centerY + radius * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    let path: string
    if (innerRadius > 0) {
      // Donut chart
      const x3 = centerX + innerRadius * Math.cos(endRad)
      const y3 = centerY + innerRadius * Math.sin(endRad)
      const x4 = centerX + innerRadius * Math.cos(startRad)
      const y4 = centerY + innerRadius * Math.sin(startRad)

      path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
    } else {
      // Pie chart
      path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    }

    // Label position
    const labelAngle = startAngle + angle / 2
    const labelRad = (labelAngle * Math.PI) / 180
    const labelRadius = innerRadius > 0 ? (radius + innerRadius) / 2 : (radius * 2) / 3
    const labelX = centerX + labelRadius * Math.cos(labelRad)
    const labelY = centerY + labelRadius * Math.sin(labelRad)

    currentAngle = endAngle

    return {
      path,
      color: point.color || colors[index % colors.length],
      label: point.label,
      value: point.value,
      percentage,
      labelX,
      labelY,
      dataPoint: point,
    }
  })

  return (
    <div className="flex items-center gap-8">
      <svg width="240" height="240" viewBox="0 0 240 240" className="flex-shrink-0">
        {slices.map((slice, index) => (
          <g key={index}>
            <path
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
              className="transition-opacity hover:opacity-80 cursor-pointer"
              onClick={() => onDataPointClick?.(slice.dataPoint, index)}
            />
            {showDataLabels && slice.percentage > 5 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-white pointer-events-none"
              >
                {slice.percentage.toFixed(0)}%
              </text>
            )}
          </g>
        ))}
      </svg>

      {showLegend && (
        <div className="flex-1 space-y-2">
          {slices.map((slice, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80"
              onClick={() => onDataPointClick?.(slice.dataPoint, index)}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-gray-700 flex-1">{slice.label}</span>
              <span className="text-gray-900 font-medium">
                {slice.value.toLocaleString()}
              </span>
              <span className="text-gray-500 text-xs">
                ({slice.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Simple Bar/Line/Area Chart Implementation
function BarLineChart({
  type,
  data,
  colors,
  showGrid,
  showDataLabels,
  xAxisLabel,
  yAxisLabel,
  onDataPointClick,
}: {
  type: ChartType
  data: ChartDataPoint[]
  colors: string[]
  showGrid: boolean
  showDataLabels: boolean
  xAxisLabel?: string
  yAxisLabel?: string
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void
}) {
  const maxValue = Math.max(...data.map((d) => d.value))
  const chartHeight = 200
  const chartWidth = 400
  const padding = 40
  const barWidth = (chartWidth - padding * 2) / data.length - 10

  return (
    <div className="flex flex-col items-center">
      <svg
        width={chartWidth + padding * 2}
        height={chartHeight + padding * 2}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {showGrid && (
          <g>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <line
                key={index}
                x1={padding}
                y1={padding + chartHeight * ratio}
                x2={chartWidth + padding}
                y2={padding + chartHeight * ratio}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
          </g>
        )}

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight + padding}
          stroke="#9ca3af"
          strokeWidth="2"
        />

        {/* X-axis */}
        <line
          x1={padding}
          y1={chartHeight + padding}
          x2={chartWidth + padding}
          y2={chartHeight + padding}
          stroke="#9ca3af"
          strokeWidth="2"
        />

        {/* Bars/Lines */}
        {type === 'bar' ? (
          <g>
            {data.map((point, index) => {
              const height = (point.value / maxValue) * chartHeight
              const x = padding + index * (barWidth + 10) + 5
              const y = padding + chartHeight - height

              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    fill={point.color || colors[index % colors.length]}
                    className="transition-opacity hover:opacity-80 cursor-pointer"
                    onClick={() => onDataPointClick?.(point, index)}
                  />
                  {showDataLabels && (
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {point.value}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        ) : (
          <g>
            {/* Line/Area path */}
            {(() => {
              const points = data.map((point, index) => {
                const x =
                  padding + (index / (data.length - 1 || 1)) * chartWidth
                const y =
                  padding + chartHeight - (point.value / maxValue) * chartHeight
                return { x, y }
              })

              const linePath = points
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                .join(' ')

              const areaPath =
                type === 'area'
                  ? `${linePath} L ${points[points.length - 1].x} ${chartHeight + padding} L ${padding} ${chartHeight + padding} Z`
                  : null

              return (
                <>
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill={colors[0]}
                      opacity="0.2"
                      className="pointer-events-none"
                    />
                  )}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={colors[0]}
                    strokeWidth="2"
                    className="pointer-events-none"
                  />
                  {points.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={colors[0]}
                      className="cursor-pointer hover:r-6 transition-all"
                      onClick={() => onDataPointClick?.(data[index], index)}
                    />
                  ))}
                </>
              )
            })()}
          </g>
        )}

        {/* X-axis labels */}
        <g>
          {data.map((point, index) => {
            const x =
              type === 'bar'
                ? padding + index * (barWidth + 10) + barWidth / 2 + 5
                : padding + (index / (data.length - 1 || 1)) * chartWidth

            return (
              <text
                key={index}
                x={x}
                y={chartHeight + padding + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {point.label}
              </text>
            )
          })}
        </g>

        {/* Axis labels */}
        {yAxisLabel && (
          <text
            x={padding - 30}
            y={padding + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${padding - 30} ${padding + chartHeight / 2})`}
            className="text-sm fill-gray-700 font-medium"
          >
            {yAxisLabel}
          </text>
        )}
        {xAxisLabel && (
          <text
            x={padding + chartWidth / 2}
            y={chartHeight + padding + 50}
            textAnchor="middle"
            className="text-sm fill-gray-700 font-medium"
          >
            {xAxisLabel}
          </text>
        )}
      </svg>
    </div>
  )
}

/**
 * Chart Widget Builder
 */
export class ChartWidgetBuilder {
  private config: Partial<ChartWidgetProps> = {}

  constructor(type: ChartType) {
    this.config.type = type
    this.config.data = []
  }

  data(data: ChartDataPoint[] | ChartSeries[]): this {
    this.config.data = data
    return this
  }

  title(title: string): this {
    this.config.title = title
    return this
  }

  description(description: string): this {
    this.config.description = description
    return this
  }

  height(height: number): this {
    this.config.height = height
    return this
  }

  showLegend(show = true): this {
    this.config.showLegend = show
    return this
  }

  showGrid(show = true): this {
    this.config.showGrid = show
    return this
  }

  showDataLabels(show = true): this {
    this.config.showDataLabels = show
    return this
  }

  xAxisLabel(label: string): this {
    this.config.xAxisLabel = label
    return this
  }

  yAxisLabel(label: string): this {
    this.config.yAxisLabel = label
    return this
  }

  categories(categories: string[]): this {
    this.config.categories = categories
    return this
  }

  colors(colors: string[]): this {
    this.config.colors = colors
    return this
  }

  loading(loading = true): this {
    this.config.loading = loading
    return this
  }

  error(error: string): this {
    this.config.error = error
    return this
  }

  className(className: string): this {
    this.config.className = className
    return this
  }

  onDataPointClick(handler: (dataPoint: ChartDataPoint, index: number) => void): this {
    this.config.onDataPointClick = handler
    return this
  }

  build(): ChartWidgetProps {
    if (!this.config.type) {
      throw new Error('Chart type is required')
    }
    if (!this.config.data || this.config.data.length === 0) {
      throw new Error('Chart data is required')
    }
    return this.config as ChartWidgetProps
  }
}

export const Chart = {
  line: () => new ChartWidgetBuilder('line'),
  bar: () => new ChartWidgetBuilder('bar'),
  pie: () => new ChartWidgetBuilder('pie'),
  area: () => new ChartWidgetBuilder('area'),
  donut: () => new ChartWidgetBuilder('donut'),
}
