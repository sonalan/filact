/**
 * Form Layout Components Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormSection } from './FormSection'
import { FormGrid } from './FormGrid'
import { FormCard } from './FormCard'

describe('Form Layout Components', () => {
  describe('FormSection', () => {
    it('should render title and description', () => {
      render(
        <FormSection title="Personal Information" description="Enter your personal details">
          <div>Content</div>
        </FormSection>
      )

      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Enter your personal details')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render children without title', () => {
      render(
        <FormSection>
          <div>Content</div>
        </FormSection>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should be collapsible', async () => {
      const user = userEvent.setup()
      render(
        <FormSection title="Section" collapsible defaultCollapsed={false}>
          <div>Content</div>
        </FormSection>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()

      const collapseButton = screen.getByLabelText('Collapse section')
      await user.click(collapseButton)

      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })

    it('should start collapsed when defaultCollapsed is true', () => {
      render(
        <FormSection title="Section" collapsible defaultCollapsed>
          <div>Content</div>
        </FormSection>
      )

      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })

    it('should not show collapse button when not collapsible', () => {
      render(
        <FormSection title="Section">
          <div>Content</div>
        </FormSection>
      )

      expect(screen.queryByLabelText('Collapse section')).not.toBeInTheDocument()
    })
  })

  describe('FormGrid', () => {
    it('should render children in grid', () => {
      render(
        <FormGrid columns={2}>
          <div>Field 1</div>
          <div>Field 2</div>
        </FormGrid>
      )

      expect(screen.getByText('Field 1')).toBeInTheDocument()
      expect(screen.getByText('Field 2')).toBeInTheDocument()
    })

    it('should apply correct grid columns class', () => {
      const { container } = render(
        <FormGrid columns={3}>
          <div>Content</div>
        </FormGrid>
      )

      const grid = container.firstChild as HTMLElement
      expect(grid.className).toContain('grid-cols-1')
      expect(grid.className).toContain('md:grid-cols-2')
      expect(grid.className).toContain('lg:grid-cols-3')
    })

    it('should apply custom className', () => {
      const { container } = render(
        <FormGrid className="custom-class">
          <div>Content</div>
        </FormGrid>
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('FormCard', () => {
    it('should render title and description', () => {
      render(
        <FormCard title="Card Title" description="Card description">
          <div>Content</div>
        </FormCard>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card description')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render children without title', () => {
      render(
        <FormCard>
          <div>Content</div>
        </FormCard>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should apply border when bordered is true', () => {
      const { container } = render(
        <FormCard bordered>
          <div>Content</div>
        </FormCard>
      )

      expect(container.firstChild).toHaveClass('border')
    })

    it('should not apply border when bordered is false', () => {
      const { container } = render(
        <FormCard bordered={false}>
          <div>Content</div>
        </FormCard>
      )

      expect(container.firstChild).not.toHaveClass('border')
    })

    it('should apply shadow when shadow is true', () => {
      const { container } = render(
        <FormCard shadow>
          <div>Content</div>
        </FormCard>
      )

      expect(container.firstChild).toHaveClass('shadow-sm')
    })

    it('should apply correct padding class', () => {
      const { container } = render(
        <FormCard padding="lg">
          <div>Content</div>
        </FormCard>
      )

      expect(container.firstChild).toHaveClass('p-8')
    })
  })
})
