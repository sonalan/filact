import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NestedTable } from './NestedTable'

interface TestModel {
  id: number
  name: string
}

describe('NestedTable', () => {
  const mockRecord: TestModel = { id: 1, name: 'Test' }

  it('should render children content', () => {
    render(
      <NestedTable record={mockRecord}>
        <div>Nested content</div>
      </NestedTable>
    )

    expect(screen.getByText('Nested content')).toBeInTheDocument()
  })

  it('should apply indentation based on level', () => {
    const { container } = render(
      <NestedTable record={mockRecord} level={2}>
        <div>Content</div>
      </NestedTable>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.paddingLeft).toBe('4rem')
  })

  it('should use default level of 1', () => {
    const { container } = render(
      <NestedTable record={mockRecord}>
        <div>Content</div>
      </NestedTable>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.paddingLeft).toBe('2rem')
  })

  it('should render loading state', () => {
    render(
      <NestedTable record={mockRecord} isLoading={true}>
        <div>Content</div>
      </NestedTable>
    )

    expect(screen.getByText('Loading nested data...')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('should render custom loading content', () => {
    render(
      <NestedTable
        record={mockRecord}
        isLoading={true}
        loadingContent={<div>Custom loading</div>}
      >
        <div>Content</div>
      </NestedTable>
    )

    expect(screen.getByText('Custom loading')).toBeInTheDocument()
    expect(screen.queryByText('Loading nested data...')).not.toBeInTheDocument()
  })

  it('should render error state', () => {
    const error = new Error('Failed to load')

    render(
      <NestedTable record={mockRecord} error={error}>
        <div>Content</div>
      </NestedTable>
    )

    expect(screen.getByText(/Error loading nested data:/)).toBeInTheDocument()
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('should render custom error content', () => {
    const error = new Error('Failed')

    render(
      <NestedTable
        record={mockRecord}
        error={error}
        errorContent={<div>Custom error</div>}
      >
        <div>Content</div>
      </NestedTable>
    )

    expect(screen.getByText('Custom error')).toBeInTheDocument()
    expect(screen.queryByText(/Error loading nested data:/)).not.toBeInTheDocument()
  })

  it('should prioritize error over loading state', () => {
    const error = new Error('Failed')

    render(
      <NestedTable record={mockRecord} error={error} isLoading={true}>
        <div>Content</div>
      </NestedTable>
    )

    expect(screen.getByText(/Error loading nested data:/)).toBeInTheDocument()
    expect(screen.queryByText('Loading nested data...')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <NestedTable record={mockRecord} className="custom-class">
        <div>Content</div>
      </NestedTable>
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should have visual indicators for nested state', () => {
    const { container } = render(
      <NestedTable record={mockRecord}>
        <div>Content</div>
      </NestedTable>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('bg-gray-50')
    expect(wrapper).toHaveClass('border-l-4')
    expect(wrapper).toHaveClass('border-gray-300')
  })

  it('should have different styling for error state', () => {
    const { container } = render(
      <NestedTable record={mockRecord} error={new Error('Test')}>
        <div>Content</div>
      </NestedTable>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('bg-red-50')
    expect(wrapper).toHaveClass('border-red-400')
  })

  it('should render loading spinner', () => {
    const { container } = render(
      <NestedTable record={mockRecord} isLoading={true}>
        <div>Content</div>
      </NestedTable>
    )

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
