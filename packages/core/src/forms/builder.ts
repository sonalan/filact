/**
 * Form Builder
 * Provides a fluent API for building forms
 */

import type {
  Field,
  FormSchema,
  FormSection,
  FormTab,
  WizardStep,
  BaseModel,
} from '../types'

/**
 * Form Builder class
 * Provides a chainable API for constructing form schemas
 */
export class FormBuilder<TModel extends BaseModel = BaseModel> {
  private fields: Field[] = []
  private sections?: FormSection[]
  private tabs?: FormTab[]
  private wizard?: WizardStep[]
  private columns?: number
  private submitLabel?: string
  private cancelLabel?: string

  /**
   * Set the form fields
   */
  schema(fields: Field[]): this {
    this.fields = fields
    return this
  }

  /**
   * Add fields to the form
   */
  addFields(...fields: Field[]): this {
    this.fields.push(...fields)
    return this
  }

  /**
   * Remove a field by name
   */
  removeField(name: string): this {
    this.fields = this.fields.filter((field) => field.name !== name)
    return this
  }

  /**
   * Get a field by name
   */
  getField(name: string): Field | undefined {
    return this.fields.find((field) => field.name === name)
  }

  /**
   * Clear all fields
   */
  clearFields(): this {
    this.fields = []
    return this
  }

  /**
   * Set the number of columns for grid layout
   */
  grid(columns: number): this {
    this.columns = columns
    return this
  }

  /**
   * Add form sections
   */
  withSections(sections: FormSection[]): this {
    this.sections = sections
    return this
  }

  /**
   * Add a section to the form
   */
  addSection(section: FormSection): this {
    if (!this.sections) {
      this.sections = []
    }
    this.sections.push(section)
    return this
  }

  /**
   * Remove a section by title
   */
  removeSection(title: string): this {
    if (this.sections) {
      this.sections = this.sections.filter((section) => section.title !== title)
    }
    return this
  }

  /**
   * Get a section by title
   */
  getSection(title: string): FormSection | undefined {
    return this.sections?.find((section) => section.title === title)
  }

  /**
   * Add form tabs
   */
  withTabs(tabs: FormTab[]): this {
    this.tabs = tabs
    return this
  }

  /**
   * Add wizard steps
   */
  withWizard(steps: WizardStep[]): this {
    this.wizard = steps
    return this
  }

  /**
   * Set submit button label
   */
  submit(label: string): this {
    this.submitLabel = label
    return this
  }

  /**
   * Set cancel button label
   */
  cancel(label: string): this {
    this.cancelLabel = label
    return this
  }

  /**
   * Build and return the form schema
   */
  build(): FormSchema<TModel> {
    return {
      fields: this.fields,
      sections: this.sections,
      tabs: this.tabs,
      wizard: this.wizard,
      columns: this.columns,
      submitLabel: this.submitLabel,
      cancelLabel: this.cancelLabel,
    }
  }
}

/**
 * Create a form builder instance
 */
export function createFormBuilder<
  TModel extends BaseModel = BaseModel
>(): FormBuilder<TModel> {
  return new FormBuilder<TModel>()
}
