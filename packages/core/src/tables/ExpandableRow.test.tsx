/**
 * ExpandableRow Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpandableRow, ExpandableContent } from './ExpandableRow'

describe('ExpandableRow', () => {
  it('should render collapse button', () => {
    const onToggle = vi.fn()
    render(
      <table>
        <tbody>
          <ExpandableRow isExpanded={false} onToggle={onToggle} colSpan={3}>
            <div>Expanded content</div>
          </ExpandableRow>
        </tbody>
      </table>
    )

    expect(screen.getByLabelText('Expand row')).toBeInTheDocument()
  })

  it('should toggle expansion when button clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()

    render(
      <table>
        <tbody>
          <ExpandableRow isExpanded={false} onToggle={onToggle} colSpan={3}>
            <div>Expanded content</div>
          </ExpandableRow>
        </tbody>
      </table>
    )

    const button = screen.getByLabelText('Expand row')
    await user.click(button)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('should show content when expanded', () => {
    const onToggle = vi.fn()

    render(
      <table>
        <tbody>
          <ExpandableRow isExpanded={true} onToggle={onToggle} colSpan={3}>
            <div>Expanded content</div>
          </ExpandableRow>
        </tbody>
      </table>
    )

    expect(screen.getByText('Expanded content')).toBeInTheDocument()
    expect(screen.getByLabelText('Collapse row')).toBeInTheDocument()
  })

  it('should hide content when collapsed', () => {
    const onToggle = vi.fn()

    render(
      <table>
        <tbody>
          <ExpandableRow isExpanded={false} onToggle={onToggle} colSpan={3}>
            <div>Expanded content</div>
          </ExpandableRow>
        </tbody>
      </table>
    )

    expect(screen.queryByText('Expanded content')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const onToggle = vi.fn()
    const { container } = render(
      <table>
        <tbody>
          <ExpandableRow
            isExpanded={false}
            onToggle={onToggle}
            colSpan={3}
            className="custom-class"
          >
            <div>Content</div>
          </ExpandableRow>
        </tbody>
      </table>
    )

    const row = container.querySelector('tr')
    expect(row).toHaveClass('custom-class')
  })

  it('should set correct colspan', () => {
    const onToggle = vi.fn()
    const { container } = render(
      <table>
        <tbody>
          <ExpandableRow isExpanded={false} onToggle={onToggle} colSpan={5}>
            <div>Content</div>
          </ExpandableRow>
        </tbody>
      </table>
    )

    const td = container.querySelector('td')
    expect(td).toHaveAttribute('colspan', '5')
  })

  it('should rotate icon when expanded', () => {
    const onToggle = vi.fn()
    const { container } = render(
      <table>
        <tbody>
          <ExpandableRow isExpanded={true} onToggle={onToggle} colSpan={3}>
            <div>Content</div>
          </ExpandableRow>
        </tbody>
      </table>
    )

    const icon = container.querySelector('svg')
    expect(icon).toHaveClass('rotate-90')
  })
})

describe('ExpandableContent', () => {
  it('should render children', () => {
    render(
      <ExpandableContent>
        <div>Content 1</div>
        <div>Content 2</div>
      </ExpandableContent>
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ExpandableContent className="custom-class">
        <div>Content</div>
      </ExpandableContent>
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
