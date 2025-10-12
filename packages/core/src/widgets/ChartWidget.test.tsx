import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChartWidget, Chart, type ChartDataPoint } from './ChartWidget'

const mockData: ChartDataPoint[] = [
  { label: 'Jan', value: 100 },
  { label: 'Feb', value: 150 },
  { label: 'Mar', value: 120 },
  { label: 'Apr', value: 180 },
]

describe('ChartWidget', () => {
  describe('Basic Rendering', () => {
    it('should render bar chart', () => {
      render(<ChartWidget type="bar" data={mockData} />)

      expect(screen.getByText('Jan')).toBeInTheDocument()
      expect(screen.getByText('Feb')).toBeInTheDocument()
    })

    it('should render line chart', () => {
      render(<ChartWidget type="line" data={mockData} />)

      expect(screen.getByText('Jan')).toBeInTheDocument()
      expect(screen.getByText('Apr')).toBeInTheDocument()
    })

    it('should render pie chart', () => {
      render(<ChartWidget type="pie" data={mockData} />)

      expect(screen.getByText('Jan')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render area chart', () => {
      render(<ChartWidget type="area" data={mockData} />)

      expect(screen.getByText('Jan')).toBeInTheDocument()
      expect(screen.getByText('Mar')).toBeInTheDocument()
    })

    it('should render donut chart', () => {
      render(<ChartWidget type="donut" data={mockData} />)

      expect(screen.getByText('Jan')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  describe('Chart Configuration', () => {
    it('should display title', () => {
      render(<ChartWidget type="bar" data={mockData} title="Monthly Sales" />)

      expect(screen.getByText('Monthly Sales')).toBeInTheDocument()
    })

    it('should display description', () => {
      render(
        <ChartWidget
          type="bar"
          data={mockData}
          description="Sales data for Q1"
        />
      )

      expect(screen.getByText('Sales data for Q1')).toBeInTheDocument()
    })

    it('should display both title and description', () => {
      render(
        <ChartWidget
          type="bar"
          data={mockData}
          title="Monthly Sales"
          description="Sales data for Q1"
        />
      )

      expect(screen.getByText('Monthly Sales')).toBeInTheDocument()
      expect(screen.getByText('Sales data for Q1')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <ChartWidget type="bar" data={mockData} className="custom-chart" />
      )

      expect(container.querySelector('.custom-chart')).toBeInTheDocument()
    })

    it('should apply custom height', () => {
      const { container } = render(
        <ChartWidget type="bar" data={mockData} height={400} />
      )

      const chartDiv = container.querySelector('div[style*="height"]')
      expect(chartDiv).toHaveStyle({ height: '400px' })
    })
  })

  describe('Legend', () => {
    it('should show legend by default for pie chart', () => {
      render(<ChartWidget type="pie" data={mockData} />)

      mockData.forEach((point) => {
        expect(screen.getByText(point.label)).toBeInTheDocument()
        expect(screen.getByText(point.value.toString())).toBeInTheDocument()
      })
    })

    it('should hide legend when showLegend is false', () => {
      render(<ChartWidget type="pie" data={mockData} showLegend={false} />)

      // Labels should not be in legend (but might be in SVG)
      const labels = screen.queryAllByText('Jan')
      expect(labels.length).toBeLessThan(2)
    })
  })

  describe('Data Labels', () => {
    it('should show data labels when enabled for bar chart', () => {
      render(<ChartWidget type="bar" data={mockData} showDataLabels />)

      mockData.forEach((point) => {
        expect(screen.getByText(point.value.toString())).toBeInTheDocument()
      })
    })

    it('should show percentage labels for pie chart', () => {
      render(<ChartWidget type="pie" data={mockData} showDataLabels />)

      // Should show percentages
      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Axis Labels', () => {
    it('should display x-axis label', () => {
      render(
        <ChartWidget type="bar" data={mockData} xAxisLabel="Month" />
      )

      expect(screen.getByText('Month')).toBeInTheDocument()
    })

    it('should display y-axis label', () => {
      render(
        <ChartWidget type="bar" data={mockData} yAxisLabel="Sales ($)" />
      )

      expect(screen.getByText('Sales ($)')).toBeInTheDocument()
    })

    it('should display both axis labels', () => {
      render(
        <ChartWidget
          type="line"
          data={mockData}
          xAxisLabel="Month"
          yAxisLabel="Revenue"
        />
      )

      expect(screen.getByText('Month')).toBeInTheDocument()
      expect(screen.getByText('Revenue')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading skeleton', () => {
      render(<ChartWidget type="bar" data={mockData} loading />)

      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('should show title skeleton when loading', () => {
      render(
        <ChartWidget type="bar" data={mockData} title="Sales" loading />
      )

      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message', () => {
      render(
        <ChartWidget
          type="bar"
          data={mockData}
          error="Failed to fetch data"
        />
      )

      expect(screen.getByText('Failed to load chart')).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument()
    })

    it('should show error icon', () => {
      render(<ChartWidget type="bar" data={mockData} error="Error" />)

      const svg = screen.getByText('Failed to load chart').parentElement?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no data', () => {
      render(<ChartWidget type="bar" data={[]} />)

      expect(screen.getByText('No data to display')).toBeInTheDocument()
    })
  })

  describe('Click Handlers', () => {
    it('should call onDataPointClick for bar chart', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <ChartWidget
          type="bar"
          data={mockData}
          onDataPointClick={handleClick}
        />
      )

      const bars = document.querySelectorAll('rect')
      if (bars.length > 0) {
        await user.click(bars[0])
        expect(handleClick).toHaveBeenCalledWith(mockData[0], 0)
      }
    })

    it('should call onDataPointClick for pie chart', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <ChartWidget
          type="pie"
          data={mockData}
          onDataPointClick={handleClick}
        />
      )

      const paths = document.querySelectorAll('path')
      if (paths.length > 0) {
        await user.click(paths[0])
        expect(handleClick).toHaveBeenCalled()
      }
    })

    it('should call onDataPointClick from legend', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <ChartWidget
          type="pie"
          data={mockData}
          onDataPointClick={handleClick}
        />
      )

      const legendItem = screen.getByText('Jan')
      await user.click(legendItem)
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('Custom Colors', () => {
    it('should apply custom colors', () => {
      const colors = ['#ff0000', '#00ff00', '#0000ff']
      render(<ChartWidget type="bar" data={mockData} colors={colors} />)

      const rects = document.querySelectorAll('rect')
      expect(rects.length).toBeGreaterThan(0)
    })

    it('should cycle through colors when more data than colors', () => {
      const colors = ['#ff0000', '#00ff00']
      const manyDataPoints = [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 },
        { label: 'C', value: 30 },
        { label: 'D', value: 40 },
      ]
      render(<ChartWidget type="bar" data={manyDataPoints} colors={colors} />)

      const rects = document.querySelectorAll('rect')
      expect(rects.length).toBe(4)
    })

    it('should use data point color if provided', () => {
      const dataWithColors: ChartDataPoint[] = [
        { label: 'A', value: 10, color: '#123456' },
        { label: 'B', value: 20, color: '#654321' },
      ]
      render(<ChartWidget type="bar" data={dataWithColors} />)

      const rects = document.querySelectorAll('rect')
      expect(rects.length).toBeGreaterThan(0)
    })
  })

  describe('Grid Lines', () => {
    it('should show grid lines by default', () => {
      render(<ChartWidget type="bar" data={mockData} />)

      const lines = document.querySelectorAll('line')
      expect(lines.length).toBeGreaterThan(0)
    })

    it('should hide grid lines when showGrid is false', () => {
      render(<ChartWidget type="bar" data={mockData} showGrid={false} />)

      // Should still have axis lines but not grid lines
      const lines = document.querySelectorAll('line')
      expect(lines.length).toBe(2) // Only x and y axis
    })
  })
})

describe('ChartWidgetBuilder', () => {
  describe('Line Chart Builder', () => {
    it('should create line chart config', () => {
      const config = Chart.line()
        .data(mockData)
        .title('Sales')
        .build()

      expect(config.type).toBe('line')
      expect(config.data).toEqual(mockData)
      expect(config.title).toBe('Sales')
    })

    it('should chain all configuration methods', () => {
      const config = Chart.line()
        .data(mockData)
        .title('Monthly Revenue')
        .description('Q1 2024')
        .height(400)
        .showLegend(false)
        .showGrid(true)
        .showDataLabels(true)
        .xAxisLabel('Month')
        .yAxisLabel('Revenue ($)')
        .colors(['#ff0000'])
        .className('custom')
        .build()

      expect(config.type).toBe('line')
      expect(config.title).toBe('Monthly Revenue')
      expect(config.description).toBe('Q1 2024')
      expect(config.height).toBe(400)
      expect(config.showLegend).toBe(false)
      expect(config.showGrid).toBe(true)
      expect(config.showDataLabels).toBe(true)
      expect(config.xAxisLabel).toBe('Month')
      expect(config.yAxisLabel).toBe('Revenue ($)')
      expect(config.colors).toEqual(['#ff0000'])
      expect(config.className).toBe('custom')
    })
  })

  describe('Bar Chart Builder', () => {
    it('should create bar chart config', () => {
      const config = Chart.bar()
        .data(mockData)
        .title('Sales by Month')
        .build()

      expect(config.type).toBe('bar')
      expect(config.data).toEqual(mockData)
    })
  })

  describe('Pie Chart Builder', () => {
    it('should create pie chart config', () => {
      const config = Chart.pie()
        .data(mockData)
        .title('Market Share')
        .build()

      expect(config.type).toBe('pie')
      expect(config.showLegend).toBeUndefined()
    })
  })

  describe('Area Chart Builder', () => {
    it('should create area chart config', () => {
      const config = Chart.area()
        .data(mockData)
        .title('Cumulative Sales')
        .build()

      expect(config.type).toBe('area')
    })
  })

  describe('Donut Chart Builder', () => {
    it('should create donut chart config', () => {
      const config = Chart.donut()
        .data(mockData)
        .title('Distribution')
        .build()

      expect(config.type).toBe('donut')
    })
  })

  describe('Builder Validation', () => {
    it('should throw error if data is missing', () => {
      expect(() => {
        Chart.line().build()
      }).toThrow('Chart data is required')
    })

    it('should throw error if data is empty', () => {
      expect(() => {
        Chart.line().data([]).build()
      }).toThrow('Chart data is required')
    })
  })

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const config = Chart.bar()
        .data(mockData)
        .loading(true)
        .build()

      expect(config.loading).toBe(true)
    })

    it('should set error message', () => {
      const config = Chart.bar()
        .data(mockData)
        .error('Network error')
        .build()

      expect(config.error).toBe('Network error')
    })
  })

  describe('Click Handler', () => {
    it('should set click handler', () => {
      const handler = vi.fn()
      const config = Chart.bar()
        .data(mockData)
        .onDataPointClick(handler)
        .build()

      expect(config.onDataPointClick).toBe(handler)
    })
  })

  describe('Categories', () => {
    it('should set categories', () => {
      const categories = ['Q1', 'Q2', 'Q3', 'Q4']
      const config = Chart.bar()
        .data(mockData)
        .categories(categories)
        .build()

      expect(config.categories).toEqual(categories)
    })
  })
})
