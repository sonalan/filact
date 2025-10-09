/**
 * Table Filter Builders
 * Factory functions for creating filter configurations
 */

import type { Filter, FilterType, SelectOption } from '../types/table'

/**
 * Base filter builder
 */
class BaseFilterBuilder<T extends FilterType> {
  protected config: Partial<Filter>

  constructor(name: string, type: T) {
    this.config = {
      name,
      type,
      label: name,
    }
  }

  label(label: string): this {
    this.config.label = label
    return this
  }

  default(value: unknown): this {
    this.config.default = value
    return this
  }

  placeholder(placeholder: string): this {
    this.config.placeholder = placeholder
    return this
  }

  disabled(disabled = true): this {
    this.config.disabled = disabled
    return this
  }

  build(): Filter {
    if (!this.config.label) {
      throw new Error('Filter label is required')
    }
    return this.config as Filter
  }
}

/**
 * Text filter builder
 */
export class TextFilterBuilder extends BaseFilterBuilder<'text'> {
  constructor(name: string) {
    super(name, 'text')
  }
}

/**
 * Select filter builder
 */
export class SelectFilterBuilder extends BaseFilterBuilder<'select'> {
  constructor(name: string) {
    super(name, 'select')
  }

  options(options: SelectOption[]): this {
    this.config.options = options
    return this
  }

  multiple(multiple = true): this {
    if (multiple) {
      this.config.type = 'multiselect'
    }
    this.config.multiple = multiple
    return this
  }
}

/**
 * Date filter builder
 */
export class DateFilterBuilder extends BaseFilterBuilder<'date'> {
  constructor(name: string) {
    super(name, 'date')
  }
}

/**
 * Date range filter builder
 */
export class DateRangeFilterBuilder extends BaseFilterBuilder<'daterange'> {
  constructor(name: string) {
    super(name, 'daterange')
  }
}

/**
 * Number filter builder
 */
export class NumberFilterBuilder extends BaseFilterBuilder<'number'> {
  constructor(name: string) {
    super(name, 'number')
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
}

/**
 * Boolean filter builder
 */
export class BooleanFilterBuilder extends BaseFilterBuilder<'boolean'> {
  constructor(name: string) {
    super(name, 'boolean')
  }
}

/**
 * Custom filter builder
 */
export class CustomFilterBuilder extends BaseFilterBuilder<'custom'> {
  constructor(
    name: string,
    component: React.ComponentType<{
      value: unknown
      onChange: (value: unknown) => void
    }>
  ) {
    super(name, 'custom')
    this.config.component = component
  }
}

/**
 * Factory functions for creating filter builders
 */
export const TextFilter = {
  make: (name: string) => new TextFilterBuilder(name),
}

export const SelectFilter = {
  make: (name: string) => new SelectFilterBuilder(name),
}

export const DateFilter = {
  make: (name: string) => new DateFilterBuilder(name),
}

export const DateRangeFilter = {
  make: (name: string) => new DateRangeFilterBuilder(name),
}

export const NumberFilter = {
  make: (name: string) => new NumberFilterBuilder(name),
}

export const BooleanFilter = {
  make: (name: string) => new BooleanFilterBuilder(name),
}

export const CustomFilter = {
  make: (
    name: string,
    component: React.ComponentType<{
      value: unknown
      onChange: (value: unknown) => void
    }>
  ) => new CustomFilterBuilder(name, component),
}
