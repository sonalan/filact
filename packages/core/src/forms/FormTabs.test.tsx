/**
 * FormTabs Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormTabs } from './FormTabs'

describe('FormTabs', () => {
  const tabs = [
    { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
    { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
    { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
  ]

  it('should render all tabs', () => {
    render(<FormTabs tabs={tabs} />)

    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
  })

  it('should show first tab content by default', () => {
    render(<FormTabs tabs={tabs} />)

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('should switch tab content on click', async () => {
    const user = userEvent.setup()
    render(<FormTabs tabs={tabs} />)

    await user.click(screen.getByText('Tab 2'))

    expect(screen.getByText('Content 2')).toBeInTheDocument()
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
  })

  it('should respect defaultTab prop', () => {
    render(<FormTabs tabs={tabs} defaultTab="tab2" />)

    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('should call onTabChange when tab is clicked', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()

    render(<FormTabs tabs={tabs} onTabChange={onTabChange} />)

    await user.click(screen.getByText('Tab 2'))

    expect(onTabChange).toHaveBeenCalledWith('tab2')
  })

  it('should render tabs with icons', () => {
    const tabsWithIcons = [
      { id: 'tab1', label: 'Tab 1', content: <div>Content</div>, icon: <span>📝</span> },
    ]

    render(<FormTabs tabs={tabsWithIcons} />)

    expect(screen.getByText('📝')).toBeInTheDocument()
  })

  it('should disable tabs when disabled prop is true', async () => {
    const user = userEvent.setup()
    const tabsWithDisabled = [
      { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
      { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div>, disabled: true },
    ]

    render(<FormTabs tabs={tabsWithDisabled} />)

    const disabledTab = screen.getByText('Tab 2')
    await user.click(disabledTab)

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('should render vertical orientation', () => {
    const { container } = render(<FormTabs tabs={tabs} orientation="vertical" />)

    const tabsContainer = container.querySelector('.flex.gap-6')
    expect(tabsContainer).toBeInTheDocument()
  })

  it('should handle controlled activeTab', async () => {
    const user = userEvent.setup()
    const onTabChange = vi.fn()

    render(<FormTabs tabs={tabs} activeTab="tab2" onTabChange={onTabChange} />)

    expect(screen.getByText('Content 2')).toBeInTheDocument()

    await user.click(screen.getByText('Tab 3'))
    expect(onTabChange).toHaveBeenCalledWith('tab3')
  })
})
