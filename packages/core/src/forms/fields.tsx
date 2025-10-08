/**
 * Form Field Builders
 * Factory functions for creating field configurations
 */

import type {
  TextFieldConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  SelectOption,
  CheckboxFieldConfig,
  RadioFieldConfig,
  DateFieldConfig,
  FileFieldConfig,
} from '../types'

/**
 * Text input field builder
 */
export class TextInputBuilder {
  private config: Partial<TextFieldConfig> = {
    type: 'text',
    name: '',
  }

  constructor(name: string) {
    this.config.name = name
  }

  label(label: string): this {
    this.config.label = label
    return this
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder
    return this
  }

  required(required = true): this {
    this.config.required = required
    return this
  }

  minLength(length: number): this {
    this.config.minLength = length
    return this
  }

  maxLength(length: number): this {
    this.config.maxLength = length
    return this
  }

  pattern(pattern: string): this {
    this.config.pattern = pattern
    return this
  }

  disabled(disabled: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.disabled = disabled
    return this
  }

  readonly(readonly: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.readonly = readonly
    return this
  }

  visible(visible: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.visible = visible
    return this
  }

  helperText(text: string): this {
    this.config.helperText = text
    return this
  }

  default(value: unknown): this {
    this.config.default = value
    return this
  }

  columnSpan(span: number): this {
    this.config.columnSpan = span
    return this
  }

  build(): TextFieldConfig {
    if (!this.config.name) {
      throw new Error('Field name is required')
    }
    return this.config as TextFieldConfig
  }
}

/**
 * Email input field builder
 */
export class EmailInputBuilder extends TextInputBuilder {
  constructor(name: string) {
    super(name)
    this.config.type = 'email'
  }
}

/**
 * Password input field builder
 */
export class PasswordInputBuilder extends TextInputBuilder {
  constructor(name: string) {
    super(name)
    this.config.type = 'password'
  }
}

/**
 * Textarea field builder
 */
export class TextareaBuilder extends TextInputBuilder {
  constructor(name: string) {
    super(name)
    this.config.type = 'textarea'
  }
}

/**
 * Number input field builder
 */
export class NumberInputBuilder {
  private config: Partial<NumberFieldConfig> = {
    type: 'number',
    name: '',
  }

  constructor(name: string) {
    this.config.name = name
  }

  label(label: string): this {
    this.config.label = label
    return this
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder
    return this
  }

  required(required = true): this {
    this.config.required = required
    return this
  }

  min(min: number): this {
    this.config.min = min
    return this
  }

  max(max: number): this {
    this.config.max = max
    return this
  }

  step(step: number): this {
    this.config.step = step
    return this
  }

  disabled(disabled: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.disabled = disabled
    return this
  }

  readonly(readonly: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.readonly = readonly
    return this
  }

  visible(visible: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.visible = visible
    return this
  }

  default(value: unknown): this {
    this.config.default = value
    return this
  }

  columnSpan(span: number): this {
    this.config.columnSpan = span
    return this
  }

  build(): NumberFieldConfig {
    if (!this.config.name) {
      throw new Error('Field name is required')
    }
    return this.config as NumberFieldConfig
  }
}

/**
 * Select field builder
 */
export class SelectBuilder {
  private config: Partial<SelectFieldConfig> = {
    type: 'select',
    name: '',
    options: [],
  }

  constructor(name: string) {
    this.config.name = name
  }

  label(label: string): this {
    this.config.label = label
    return this
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder
    return this
  }

  required(required = true): this {
    this.config.required = required
    return this
  }

  options(options: SelectOption[] | ((values: Record<string, unknown>) => SelectOption[] | Promise<SelectOption[]>)): this {
    this.config.options = options
    return this
  }

  searchable(searchable = true): this {
    this.config.searchable = searchable
    return this
  }

  clearable(clearable = true): this {
    this.config.clearable = clearable
    return this
  }

  multiple(multiple = true): this {
    this.config.multiple = multiple
    if (multiple) {
      this.config.type = 'multiselect'
    }
    return this
  }

  disabled(disabled: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.disabled = disabled
    return this
  }

  readonly(readonly: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.readonly = readonly
    return this
  }

  visible(visible: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.visible = visible
    return this
  }

  default(value: unknown): this {
    this.config.default = value
    return this
  }

  columnSpan(span: number): this {
    this.config.columnSpan = span
    return this
  }

  build(): SelectFieldConfig {
    if (!this.config.name) {
      throw new Error('Field name is required')
    }
    return this.config as SelectFieldConfig
  }
}

/**
 * Checkbox field builder
 */
export class CheckboxBuilder {
  private config: Partial<CheckboxFieldConfig> = {
    type: 'checkbox',
    name: '',
    label: '',
  }

  constructor(name: string, label: string) {
    this.config.name = name
    this.config.label = label
  }

  description(description: string): this {
    this.config.description = description
    return this
  }

  required(required = true): this {
    this.config.required = required
    return this
  }

  disabled(disabled: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.disabled = disabled
    return this
  }

  readonly(readonly: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.readonly = readonly
    return this
  }

  visible(visible: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.visible = visible
    return this
  }

  default(value: unknown): this {
    this.config.default = value
    return this
  }

  columnSpan(span: number): this {
    this.config.columnSpan = span
    return this
  }

  build(): CheckboxFieldConfig {
    if (!this.config.name) {
      throw new Error('Field name is required')
    }
    return this.config as CheckboxFieldConfig
  }
}

/**
 * Switch field builder (same as checkbox but different UI)
 */
export class SwitchBuilder extends CheckboxBuilder {
  constructor(name: string, label: string) {
    super(name, label)
    this.config.type = 'switch'
  }
}

/**
 * Radio field builder
 */
export class RadioBuilder {
  private config: Partial<RadioFieldConfig> = {
    type: 'radio',
    name: '',
    options: [],
  }

  constructor(name: string) {
    this.config.name = name
  }

  label(label: string): this {
    this.config.label = label
    return this
  }

  options(options: SelectOption[]): this {
    this.config.options = options
    return this
  }

  inline(inline = true): this {
    this.config.inline = inline
    return this
  }

  required(required = true): this {
    this.config.required = required
    return this
  }

  disabled(disabled: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.disabled = disabled
    return this
  }

  readonly(readonly: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.readonly = readonly
    return this
  }

  visible(visible: boolean | ((values: Record<string, unknown>) => boolean)): this {
    this.config.visible = visible
    return this
  }

  helperText(text: string): this {
    this.config.helperText = text
    return this
  }

  default(value: unknown): this {
    this.config.default = value
    return this
  }

  columnSpan(span: number): this {
    this.config.columnSpan = span
    return this
  }

  build(): RadioFieldConfig {
    if (!this.config.name) {
      throw new Error('Field name is required')
    }
    if (!this.config.options || this.config.options.length === 0) {
      throw new Error('Radio field must have at least one option')
    }
    return this.config as RadioFieldConfig
  }
}

/**
 * Factory functions for creating field builders
 */
export const TextInput = {
  make: (name: string) => new TextInputBuilder(name),
}

export const EmailInput = {
  make: (name: string) => new EmailInputBuilder(name),
}

export const PasswordInput = {
  make: (name: string) => new PasswordInputBuilder(name),
}

export const Textarea = {
  make: (name: string) => new TextareaBuilder(name),
}

export const NumberInput = {
  make: (name: string) => new NumberInputBuilder(name),
}

export const Select = {
  make: (name: string) => new SelectBuilder(name),
}

export const Checkbox = {
  make: (name: string, label: string) => new CheckboxBuilder(name, label),
}

export const Switch = {
  make: (name: string, label: string) => new SwitchBuilder(name, label),
}

export const Radio = {
  make: (name: string) => new RadioBuilder(name),
}
