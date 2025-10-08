/**
 * FormFieldset Component Tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormFieldset } from './FormFieldset'

describe('FormFieldset', () => {
  it('should render legend', () => {
    render(
      <FormFieldset legend="Personal Information">
        <div>Content</div>
      </FormFieldset>
    )

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(
      <FormFieldset legend="Details" description="Enter your details below">
        <div>Content</div>
      </FormFieldset>
    )

    expect(screen.getByText('Enter your details below')).toBeInTheDocument()
  })

  it('should render children', () => {
    render(
      <FormFieldset>
        <div>Field 1</div>
        <div>Field 2</div>
      </FormFieldset>
    )

    expect(screen.getByText('Field 1')).toBeInTheDocument()
    expect(screen.getByText('Field 2')).toBeInTheDocument()
  })

  it('should apply bordered style by default', () => {
    const { container } = render(
      <FormFieldset legend="Test">
        <div>Content</div>
      </FormFieldset>
    )

    const fieldset = container.querySelector('fieldset')
    expect(fieldset).toHaveClass('border')
  })

  it('should remove border when bordered is false', () => {
    const { container } = render(
      <FormFieldset legend="Test" bordered={false}>
        <div>Content</div>
      </FormFieldset>
    )

    const fieldset = container.querySelector('fieldset')
    expect(fieldset).not.toHaveClass('border')
  })

  it('should disable fieldset when disabled is true', () => {
    const { container } = render(
      <FormFieldset legend="Test" disabled>
        <div>Content</div>
      </FormFieldset>
    )

    const fieldset = container.querySelector('fieldset')
    expect(fieldset).toBeDisabled()
    expect(fieldset).toHaveClass('opacity-60')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <FormFieldset legend="Test" className="custom-class">
        <div>Content</div>
      </FormFieldset>
    )

    const fieldset = container.querySelector('fieldset')
    expect(fieldset).toHaveClass('custom-class')
  })

  it('should render without legend', () => {
    render(
      <FormFieldset>
        <div>Content</div>
      </FormFieldset>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByRole('legend')).not.toBeInTheDocument()
  })
})
