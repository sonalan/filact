import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  WidgetGrid,
  Widget,
  GridBuilder,
  GridLayouts,
  useGridLayout,
  WidgetSpans,
} from './WidgetGrid'
import { renderHook, act } from '@testing-library/react'

describe('WidgetGrid', () => {
  describe('Basic Rendering', () => {
    it('should render grid container', () => {
      const { container } = render(
        <WidgetGrid>
          <div>Widget 1</div>
          <div>Widget 2</div>
        </WidgetGrid>
      )

      expect(container.querySelector('.grid')).toBeInTheDocument()
      expect(screen.getByText('Widget 1')).toBeInTheDocument()
      expect(screen.getByText('Widget 2')).toBeInTheDocument()
    })

    it('should render multiple widgets', () => {
      render(
        <WidgetGrid>
          <Widget>Widget 1</Widget>
          <Widget>Widget 2</Widget>
          <Widget>Widget 3</Widget>
        </WidgetGrid>
      )

      expect(screen.getByText('Widget 1')).toBeInTheDocument()
      expect(screen.getByText('Widget 2')).toBeInTheDocument()
      expect(screen.getByText('Widget 3')).toBeInTheDocument()
    })

    it('should render empty grid', () => {
      const { container } = render(<WidgetGrid>{null}</WidgetGrid>)

      expect(container.querySelector('.grid')).toBeInTheDocument()
    })
  })

  describe('Grid Configuration', () => {
    it('should apply default columns', () => {
      const { container } = render(
        <WidgetGrid>
          <div>Widget</div>
        </WidgetGrid>
      )

      const grid = container.querySelector('.grid') as HTMLElement
      expect(grid?.style.getPropertyValue('--grid-columns')).toBe('12')
    })

    it('should apply custom columns', () => {
      const { container } = render(
        <WidgetGrid columns={6}>
          <div>Widget</div>
        </WidgetGrid>
      )

      const grid = container.querySelector('.grid') as HTMLElement
      expect(grid?.style.getPropertyValue('--grid-columns')).toBe('6')
    })

    it('should apply default gap', () => {
      const { container } = render(
        <WidgetGrid>
          <div>Widget</div>
        </WidgetGrid>
      )

      const grid = container.querySelector('.grid')
      expect(grid).toHaveStyle({ gap: '16px' })
    })

    it('should apply custom gap', () => {
      const { container } = render(
        <WidgetGrid gap={24}>
          <div>Widget</div>
        </WidgetGrid>
      )

      const grid = container.querySelector('.grid')
      expect(grid).toHaveStyle({ gap: '24px' })
    })

    it('should apply custom className', () => {
      const { container } = render(
        <WidgetGrid className="custom-grid">
          <div>Widget</div>
        </WidgetGrid>
      )

      expect(container.querySelector('.custom-grid')).toBeInTheDocument()
    })

    it('should apply minColumnWidth', () => {
      const { container } = render(
        <WidgetGrid minColumnWidth={400}>
          <div>Widget</div>
        </WidgetGrid>
      )

      const grid = container.querySelector('.grid')
      expect(grid?.style.gridTemplateColumns).toContain('400px')
    })
  })

  describe('Widget Component', () => {
    it('should render widget with default span', () => {
      const { container } = render(
        <Widget>
          <div>Content</div>
        </Widget>
      )

      const widget = container.querySelector('.widget')
      expect(widget).toBeInTheDocument()
      expect(widget).toHaveStyle({ gridColumn: 'span 1' })
      expect(widget).toHaveStyle({ gridRow: 'span 1' })
    })

    it('should apply column span', () => {
      const { container } = render(
        <Widget colSpan={6}>
          <div>Content</div>
        </Widget>
      )

      const widget = container.querySelector('.widget')
      expect(widget).toHaveStyle({ gridColumn: 'span 6' })
    })

    it('should apply row span', () => {
      const { container } = render(
        <Widget rowSpan={2}>
          <div>Content</div>
        </Widget>
      )

      const widget = container.querySelector('.widget')
      expect(widget).toHaveStyle({ gridRow: 'span 2' })
    })

    it('should apply both column and row span', () => {
      const { container } = render(
        <Widget colSpan={8} rowSpan={3}>
          <div>Content</div>
        </Widget>
      )

      const widget = container.querySelector('.widget')
      expect(widget).toHaveStyle({ gridColumn: 'span 8' })
      expect(widget).toHaveStyle({ gridRow: 'span 3' })
    })

    it('should limit column span to 12', () => {
      const { container } = render(
        <Widget colSpan={20}>
          <div>Content</div>
        </Widget>
      )

      const widget = container.querySelector('.widget')
      expect(widget).toHaveStyle({ gridColumn: 'span 12' })
    })

    it('should apply custom className', () => {
      const { container } = render(
        <Widget className="custom-widget">
          <div>Content</div>
        </Widget>
      )

      expect(container.querySelector('.custom-widget')).toBeInTheDocument()
    })
  })

  describe('Grid with Widgets', () => {
    it('should render grid with multiple widgets of different spans', () => {
      render(
        <WidgetGrid>
          <Widget colSpan={12}>Full Width</Widget>
          <Widget colSpan={6}>Half Width 1</Widget>
          <Widget colSpan={6}>Half Width 2</Widget>
          <Widget colSpan={4}>Third Width 1</Widget>
          <Widget colSpan={4}>Third Width 2</Widget>
          <Widget colSpan={4}>Third Width 3</Widget>
        </WidgetGrid>
      )

      expect(screen.getByText('Full Width')).toBeInTheDocument()
      expect(screen.getByText('Half Width 1')).toBeInTheDocument()
      expect(screen.getByText('Third Width 1')).toBeInTheDocument()
    })

    it('should render complex dashboard layout', () => {
      render(
        <WidgetGrid columns={12} gap={16}>
          <Widget colSpan={3} rowSpan={2}>
            Sidebar
          </Widget>
          <Widget colSpan={9}>Header</Widget>
          <Widget colSpan={6}>Content Left</Widget>
          <Widget colSpan={3}>Content Right</Widget>
        </WidgetGrid>
      )

      expect(screen.getByText('Sidebar')).toBeInTheDocument()
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Content Left')).toBeInTheDocument()
    })
  })
})

describe('GridBuilder', () => {
  it('should create grid config with defaults', () => {
    const config = GridBuilder.make().build()

    expect(config.columns).toBe(12)
    expect(config.gap).toBe(16)
    expect(config.minColumnWidth).toBe(300)
  })

  it('should set columns', () => {
    const config = GridBuilder.make().columns(6).build()

    expect(config.columns).toBe(6)
  })

  it('should set gap', () => {
    const config = GridBuilder.make().gap(24).build()

    expect(config.gap).toBe(24)
  })

  it('should set minColumnWidth', () => {
    const config = GridBuilder.make().minColumnWidth(400).build()

    expect(config.minColumnWidth).toBe(400)
  })

  it('should set className', () => {
    const config = GridBuilder.make().className('custom').build()

    expect(config.className).toBe('custom')
  })

  it('should chain all configuration methods', () => {
    const config = GridBuilder.make()
      .columns(8)
      .gap(20)
      .minColumnWidth(350)
      .className('dashboard')
      .build()

    expect(config.columns).toBe(8)
    expect(config.gap).toBe(20)
    expect(config.minColumnWidth).toBe(350)
    expect(config.className).toBe('dashboard')
  })
})

describe('GridLayouts', () => {
  it('should have singleColumn preset', () => {
    expect(GridLayouts.singleColumn).toEqual({
      columns: 1,
      gap: 16,
    })
  })

  it('should have twoColumn preset', () => {
    expect(GridLayouts.twoColumn).toEqual({
      columns: 2,
      gap: 16,
    })
  })

  it('should have threeColumn preset', () => {
    expect(GridLayouts.threeColumn).toEqual({
      columns: 3,
      gap: 16,
    })
  })

  it('should have fourColumn preset', () => {
    expect(GridLayouts.fourColumn).toEqual({
      columns: 4,
      gap: 16,
    })
  })

  it('should have dashboard preset', () => {
    expect(GridLayouts.dashboard).toEqual({
      columns: 12,
      gap: 16,
    })
  })

  it('should have compact preset', () => {
    expect(GridLayouts.compact).toEqual({
      columns: 12,
      gap: 8,
    })
  })

  it('should have comfortable preset', () => {
    expect(GridLayouts.comfortable).toEqual({
      columns: 12,
      gap: 24,
    })
  })

  it('should work with WidgetGrid', () => {
    const { container } = render(
      <WidgetGrid {...GridLayouts.threeColumn}>
        <div>Widget</div>
      </WidgetGrid>
    )

    const grid = container.querySelector('.grid') as HTMLElement
    expect(grid?.style.getPropertyValue('--grid-columns')).toBe('3')
    expect(grid).toHaveStyle({ gap: '16px' })
  })
})

describe('WidgetSpans', () => {
  it('should have full width preset', () => {
    expect(WidgetSpans.full).toEqual({ colSpan: 12, rowSpan: 1 })
  })

  it('should have half width preset', () => {
    expect(WidgetSpans.half).toEqual({ colSpan: 6, rowSpan: 1 })
  })

  it('should have third width preset', () => {
    expect(WidgetSpans.third).toEqual({ colSpan: 4, rowSpan: 1 })
  })

  it('should have quarter width preset', () => {
    expect(WidgetSpans.quarter).toEqual({ colSpan: 3, rowSpan: 1 })
  })

  it('should have twoThirds width preset', () => {
    expect(WidgetSpans.twoThirds).toEqual({ colSpan: 8, rowSpan: 1 })
  })

  it('should have large preset', () => {
    expect(WidgetSpans.large).toEqual({ colSpan: 6, rowSpan: 2 })
  })

  it('should have featured preset', () => {
    expect(WidgetSpans.featured).toEqual({ colSpan: 12, rowSpan: 2 })
  })

  it('should have sidebar preset', () => {
    expect(WidgetSpans.sidebar).toEqual({ colSpan: 3, rowSpan: 2 })
  })

  it('should work with Widget component', () => {
    const { container } = render(
      <Widget {...WidgetSpans.large}>
        <div>Content</div>
      </Widget>
    )

    const widget = container.querySelector('.widget')
    expect(widget).toHaveStyle({ gridColumn: 'span 6' })
    expect(widget).toHaveStyle({ gridRow: 'span 2' })
  })
})

describe('useGridLayout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return empty layout initially', () => {
    const { result } = renderHook(() => useGridLayout('test'))

    expect(result.current.getLayout()).toEqual({})
  })

  it('should save layout to localStorage', () => {
    const { result } = renderHook(() => useGridLayout('test'))

    const layout = {
      widget1: { colSpan: 6, rowSpan: 1 },
      widget2: { colSpan: 6, rowSpan: 2 },
    }

    act(() => {
      result.current.saveLayout(layout)
    })

    expect(result.current.getLayout()).toEqual(layout)
  })

  it('should retrieve saved layout', () => {
    const { result } = renderHook(() => useGridLayout('test'))

    const layout = {
      widget1: { colSpan: 4 },
      widget2: { rowSpan: 3 },
    }

    act(() => {
      result.current.saveLayout(layout)
    })

    // Get layout again
    expect(result.current.getLayout()).toEqual(layout)
  })

  it('should clear layout', () => {
    const { result } = renderHook(() => useGridLayout('test'))

    const layout = { widget1: { colSpan: 6 } }

    act(() => {
      result.current.saveLayout(layout)
    })

    expect(result.current.getLayout()).toEqual(layout)

    act(() => {
      result.current.clearLayout()
    })

    expect(result.current.getLayout()).toEqual({})
  })

  it('should isolate layouts by key', () => {
    const { result: result1 } = renderHook(() => useGridLayout('dashboard1'))
    const { result: result2 } = renderHook(() => useGridLayout('dashboard2'))

    const layout1 = { widget1: { colSpan: 6 } }
    const layout2 = { widget1: { colSpan: 12 } }

    act(() => {
      result1.current.saveLayout(layout1)
      result2.current.saveLayout(layout2)
    })

    expect(result1.current.getLayout()).toEqual(layout1)
    expect(result2.current.getLayout()).toEqual(layout2)
  })

  it('should handle invalid JSON gracefully', () => {
    localStorage.setItem('grid-layout-test', 'invalid json')

    const { result } = renderHook(() => useGridLayout('test'))

    expect(result.current.getLayout()).toEqual({})
  })

  it('should update layout', () => {
    const { result } = renderHook(() => useGridLayout('test'))

    const initialLayout = { widget1: { colSpan: 6 } }
    const updatedLayout = { widget1: { colSpan: 12 }, widget2: { colSpan: 6 } }

    act(() => {
      result.current.saveLayout(initialLayout)
    })

    expect(result.current.getLayout()).toEqual(initialLayout)

    act(() => {
      result.current.saveLayout(updatedLayout)
    })

    expect(result.current.getLayout()).toEqual(updatedLayout)
  })
})
