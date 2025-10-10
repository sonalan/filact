/**
 * Form Wizard Component
 * Multi-step form with navigation and validation
 */

import { useState, useCallback, ReactNode, useMemo } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'

export interface WizardStep {
  id: string
  title: string
  description?: string
  content: ReactNode
  fields?: string[]
  optional?: boolean
  canSkip?: boolean
}

export interface FormWizardProps<TFieldValues extends FieldValues = FieldValues> {
  /** Wizard steps configuration */
  steps: WizardStep[]

  /** Form instance from useForm */
  form: UseFormReturn<TFieldValues>

  /** Submit callback */
  onSubmit: (data: TFieldValues) => void | Promise<void>

  /** Cancel callback */
  onCancel?: () => void

  /** Step change callback */
  onStepChange?: (step: number) => void

  /** Custom className */
  className?: string

  /** Show progress indicator */
  showProgress?: boolean

  /** Show step numbers */
  showStepNumbers?: boolean

  /** Allow navigation to completed steps */
  allowStepNavigation?: boolean

  /** Submit button text */
  submitText?: string

  /** Next button text */
  nextText?: string

  /** Back button text */
  backText?: string

  /** Cancel button text */
  cancelText?: string
}

/**
 * Form Wizard Component
 * Multi-step form with step validation and navigation
 */
export function FormWizard<TFieldValues extends FieldValues = FieldValues>({
  steps,
  form,
  onSubmit,
  onCancel,
  onStepChange,
  className = '',
  showProgress = true,
  showStepNumbers = true,
  allowStepNavigation = true,
  submitText = 'Submit',
  nextText = 'Next',
  backText = 'Back',
  cancelText = 'Cancel',
}: FormWizardProps<TFieldValues>) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle empty steps array
  if (steps.length === 0) {
    return <div className={className}>No steps configured</div>
  }

  const currentStepConfig = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  // Calculate progress percentage
  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100
  }, [currentStep, steps.length])

  // Validate current step fields
  const validateCurrentStep = useCallback(async () => {
    if (!currentStepConfig.fields || currentStepConfig.fields.length === 0) {
      return true
    }

    const result = await form.trigger(currentStepConfig.fields as any)
    return result
  }, [form, currentStepConfig])

  // Go to next step
  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep()

    if (!isValid && !currentStepConfig.optional) {
      return
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep))
    const nextStep = currentStep + 1
    setCurrentStep(nextStep)
    onStepChange?.(nextStep)
  }, [currentStep, currentStepConfig, validateCurrentStep, onStepChange])

  // Go to previous step
  const handleBack = useCallback(() => {
    const prevStep = currentStep - 1
    setCurrentStep(prevStep)
    onStepChange?.(prevStep)
  }, [currentStep, onStepChange])

  // Skip current step
  const handleSkip = useCallback(() => {
    if (!currentStepConfig.canSkip) return

    const nextStep = currentStep + 1
    setCurrentStep(nextStep)
    onStepChange?.(nextStep)
  }, [currentStep, currentStepConfig, onStepChange])

  // Navigate to specific step
  const goToStep = useCallback(
    (stepIndex: number) => {
      if (!allowStepNavigation) return
      if (stepIndex === currentStep) return
      if (stepIndex > currentStep && !completedSteps.has(stepIndex - 1)) return

      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex)
    },
    [currentStep, completedSteps, allowStepNavigation, onStepChange]
  )

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const isValid = await validateCurrentStep()
      if (!isValid && !currentStepConfig.optional) {
        return
      }

      setIsSubmitting(true)
      try {
        await form.handleSubmit(onSubmit)(e)
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, onSubmit, validateCurrentStep, currentStepConfig]
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = completedSteps.has(index)
          const isClickable = allowStepNavigation && (isCompleted || index < currentStep)

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => goToStep(index)}
              disabled={!isClickable && !isActive}
              className={`flex-1 py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : isCompleted
                    ? 'border-transparent text-gray-900 hover:text-blue-600 hover:border-gray-300'
                    : 'border-transparent text-gray-500 cursor-not-allowed'
              } ${isClickable && !isActive ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-center gap-2">
                {showStepNumbers && (
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Step Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStepConfig.title}
            </h2>
            {currentStepConfig.description && (
              <p className="mt-1 text-sm text-gray-600">
                {currentStepConfig.description}
              </p>
            )}
            {currentStepConfig.optional && (
              <p className="mt-1 text-sm text-gray-500 italic">(Optional)</p>
            )}
          </div>

          {/* Step Fields */}
          <div className="py-4">{currentStepConfig.content}</div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {backText}
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {cancelText}
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {currentStepConfig.canSkip && !isLastStep && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                  Skip
                </button>
              )}
              {!isLastStep ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {nextText}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : submitText}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
