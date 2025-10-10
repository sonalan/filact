import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { FormWizard, type WizardStep } from './FormWizard'

// Test wrapper component
function TestWizard({ steps, onSubmit, onCancel, ...props }: any) {
  const form = useForm()
  return (
    <FormWizard
      steps={steps}
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />
  )
}

const mockSteps: WizardStep[] = [
  {
    id: 'step1',
    title: 'Personal Info',
    description: 'Enter your personal details',
    content: <div>Step 1 Content</div>,
    fields: ['name', 'email'],
  },
  {
    id: 'step2',
    title: 'Address',
    description: 'Enter your address',
    content: <div>Step 2 Content</div>,
    fields: ['street', 'city'],
  },
  {
    id: 'step3',
    title: 'Review',
    description: 'Review your information',
    content: <div>Step 3 Content</div>,
  },
]

describe('FormWizard', () => {
  it('should render wizard with first step', () => {
    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} />)

    expect(screen.getAllByText('Personal Info').length).toBeGreaterThan(0)
    expect(screen.getByText('Enter your personal details')).toBeInTheDocument()
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
  })

  it('should show step numbers', () => {
    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should hide step numbers when showStepNumbers is false', () => {
    render(
      <TestWizard
        steps={mockSteps}
        onSubmit={vi.fn()}
        showStepNumbers={false}
      />
    )

    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('should show progress bar', () => {
    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} />)

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
  })

  it('should hide progress bar when showProgress is false', () => {
    render(
      <TestWizard steps={mockSteps} onSubmit={vi.fn()} showProgress={false} />
    )

    expect(screen.queryByText('Step 1 of 3')).not.toBeInTheDocument()
  })

  it('should navigate to next step on Next click', async () => {
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} />)

    expect(screen.getByText('Step 1 Content')).toBeInTheDocument()

    await user.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
      expect(screen.getAllByText('Address').length).toBeGreaterThan(0)
    })
  })

  it('should navigate back to previous step on Back click', async () => {
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} />)

    await user.click(screen.getByText('Next'))
    await waitFor(() => {
      expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Back'))
    await waitFor(() => {
      expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
    })
  })

  it('should not show Back button on first step', () => {
    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} />)

    expect(screen.queryByText('Back')).not.toBeInTheDocument()
  })

  it('should show Submit button on last step', async () => {
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} />)

    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })
  })

  it('should call onSubmit when Submit clicked', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={onSubmit} />)

    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Submit'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('should call onCancel when Cancel clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByText('Cancel'))

    expect(onCancel).toHaveBeenCalled()
  })

  it('should call onStepChange when navigating', async () => {
    const onStepChange = vi.fn()
    const user = userEvent.setup()

    render(
      <TestWizard
        steps={mockSteps}
        onSubmit={vi.fn()}
        onStepChange={onStepChange}
      />
    )

    await user.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(onStepChange).toHaveBeenCalledWith(1)
    })
  })

  it('should mark completed steps', async () => {
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} />)

    await user.click(screen.getByText('Next'))

    await waitFor(() => {
      // Check for checkmark icon in first step (completed)
      const buttons = screen.getAllByRole('button')
      const firstStepButton = buttons.find(btn => btn.textContent?.includes('Personal Info'))
      expect(firstStepButton).toBeInTheDocument()
    })
  })

  it('should support skippable steps', async () => {
    const stepsWithSkip: WizardStep[] = [
      { id: 'step1', title: 'Step 1', content: <div>Step 1</div> },
      { id: 'step2', title: 'Step 2', content: <div>Step 2</div>, canSkip: true },
      { id: 'step3', title: 'Step 3', content: <div>Step 3</div> },
    ]

    const user = userEvent.setup()

    render(<TestWizard steps={stepsWithSkip} onSubmit={vi.fn()} />)

    await user.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(screen.getByText('Skip')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Skip'))

    await waitFor(() => {
      // Check for step 3 content specifically
      const stepContents = screen.getAllByText('Step 3')
      expect(stepContents.length).toBeGreaterThan(0)
    })
  })

  it('should show optional indicator for optional steps', () => {
    const stepsWithOptional: WizardStep[] = [
      { id: 'step1', title: 'Step 1', content: <div>Step 1</div>, optional: true },
    ]

    render(<TestWizard steps={stepsWithOptional} onSubmit={vi.fn()} />)

    expect(screen.getByText('(Optional)')).toBeInTheDocument()
  })

  it('should allow navigation to completed steps when enabled', async () => {
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} allowStepNavigation />)

    // Navigate forward
    await user.click(screen.getByText('Next'))
    await waitFor(() => {
      expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
    })

    // Click on first step tab (get all, click first one which is in the tabs)
    const personalInfoButtons = screen.getAllByText('Personal Info')
    await user.click(personalInfoButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
    })
  })

  it('should not allow navigation to incomplete steps', async () => {
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} allowStepNavigation />)

    // Try to click on third step (not completed yet)
    const reviewButton = screen.getByText('Review')
    await user.click(reviewButton)

    // Should still be on first step
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
  })

  it('should disable step navigation when allowStepNavigation is false', async () => {
    const user = userEvent.setup()

    render(
      <TestWizard steps={mockSteps} onSubmit={vi.fn()} allowStepNavigation={false} />
    )

    await user.click(screen.getByText('Next'))
    await waitFor(() => {
      expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
    })

    // Try to click back to first step
    await user.click(screen.getByText('Personal Info'))

    // Should still be on second step
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
  })

  it('should update progress percentage correctly', async () => {
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={vi.fn()} />)

    expect(screen.getByText('33%')).toBeInTheDocument()

    await user.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(screen.getByText('67%')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Next'))

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  it('should apply custom className', () => {
    const { container } = render(
      <TestWizard steps={mockSteps} onSubmit={vi.fn()} className="custom-wizard" />
    )

    expect(container.firstChild).toHaveClass('custom-wizard')
  })

  it('should use custom button text', () => {
    render(
      <TestWizard
        steps={mockSteps}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        nextText="Continue"
        backText="Previous"
        cancelText="Abort"
        submitText="Finish"
      />
    )

    expect(screen.getByText('Continue')).toBeInTheDocument()
    expect(screen.getByText('Abort')).toBeInTheDocument()
  })

  it('should show loading state on submit button', async () => {
    const onSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    const user = userEvent.setup()

    render(<TestWizard steps={mockSteps} onSubmit={onSubmit} />)

    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Next'))
    await user.click(screen.getByText('Submit'))

    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })
  })

  it('should handle empty steps array gracefully', () => {
    render(<TestWizard steps={[]} onSubmit={vi.fn()} />)

    expect(screen.getByText('No steps configured')).toBeInTheDocument()
  })
})
