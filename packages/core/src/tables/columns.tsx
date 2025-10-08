/**
 * Table Column Builders
 * Factory functions for creating column configurations
 */

import type { ReactNode } from 'react'
import type { BaseModel } from '../types/resource'
import type {
  TextColumnConfig,
  NumberColumnConfig,
  DateColumnConfig,
  BooleanColumnConfig,
  BadgeColumnConfig,
  IconColumnConfig,
  ImageColumnConfig,
  ColorColumnConfig,
  CustomColumnConfig,
  ColumnAlignment,
} from '../types/table'

/**
 * Base column builder with common properties
 */
abstract class BaseColumnBuilder<TConfig, TModel extends BaseModel = BaseModel> {
  protected config: Partial<TConfig>

  constructor(accessor: keyof TModel | string) {
    this.config = { accessor } as Partial<TConfig>
  }

  label(label: string): this {
    ;(this.config as any).label = label
    return this
  }

  align(align: ColumnAlignment): this {
    ;(this.config as any).align = align
    return this
  }

  width(width: string | number): this {
    ;(this.config as any).width = width
    return this
  }

  sortable(sortable = true): this {
    ;(this.config as any).sortable = sortable
    return this
  }

  sortFn(sortFn: (a: TModel, b: TModel) => number): this {
    ;(this.config as any).sortFn = sortFn
    return this
  }

  searchable(searchable = true): this {
    ;(this.config as any).searchable = searchable
    return this
  }

  visible(visible = true): this {
    ;(this.config as any).visible = visible
    return this
  }

  hideable(hideable = true): this {
    ;(this.config as any).hideable = hideable
    return this
  }

  className(className: string): this {
    ;(this.config as any).className = className
    return this
  }

  headerClassName(headerClassName: string): this {
    ;(this.config as any).headerClassName = headerClassName
    return this
  }

  abstract build(): TConfig
}

/**
 * Text column builder
 */
export class TextColumnBuilder<TModel extends BaseModel = BaseModel> extends BaseColumnBuilder<
  TextColumnConfig<TModel>,
  TModel
> {
  constructor(accessor: keyof TModel | string) {
    super(accessor)
    ;(this.config as any).type = 'text'
  }

  truncate(truncate = true): this {
    ;(this.config as any).truncate = truncate
    return this
  }

  maxLength(length: number): this {
    ;(this.config as any).maxLength = length
    return this
  }

  copyable(copyable = true): this {
    ;(this.config as any).copyable = copyable
    return this
  }

  prefix(prefix: ReactNode): this {
    ;(this.config as any).prefix = prefix
    return this
  }

  suffix(suffix: ReactNode): this {
    ;(this.config as any).suffix = suffix
    return this
  }

  transform(fn: (value: string, record: TModel) => string): this {
    ;(this.config as any).transform = fn
    return this
  }

  build(): TextColumnConfig<TModel> {
    return this.config as TextColumnConfig<TModel>
  }
}

/**
 * Number column builder
 */
export class NumberColumnBuilder<TModel extends BaseModel = BaseModel> extends BaseColumnBuilder<
  NumberColumnConfig<TModel>,
  TModel
> {
  constructor(accessor: keyof TModel | string) {
    super(accessor)
    ;(this.config as any).type = 'number'
  }

  format(format: 'number' | 'currency' | 'percentage'): this {
    ;(this.config as any).format = format
    return this
  }

  decimals(decimals: number): this {
    ;(this.config as any).decimals = decimals
    return this
  }

  currency(currency: string): this {
    ;(this.config as any).currency = currency
    return this
  }

  locale(locale: string): this {
    ;(this.config as any).locale = locale
    return this
  }

  prefix(prefix: ReactNode): this {
    ;(this.config as any).prefix = prefix
    return this
  }

  suffix(suffix: ReactNode): this {
    ;(this.config as any).suffix = suffix
    return this
  }

  build(): NumberColumnConfig<TModel> {
    return this.config as NumberColumnConfig<TModel>
  }
}

/**
 * Date column builder
 */
export class DateColumnBuilder<TModel extends BaseModel = BaseModel> extends BaseColumnBuilder<
  DateColumnConfig<TModel>,
  TModel
> {
  constructor(accessor: keyof TModel | string, type: 'date' | 'datetime' = 'date') {
    super(accessor)
    ;(this.config as any).type = type
  }

  format(format: string): this {
    ;(this.config as any).format = format
    return this
  }

  relative(relative = true): this {
    ;(this.config as any).relative = relative
    return this
  }

  timezone(timezone: string): this {
    ;(this.config as any).timezone = timezone
    return this
  }

  build(): DateColumnConfig<TModel> {
    return this.config as DateColumnConfig<TModel>
  }
}

/**
 * Boolean column builder
 */
export class BooleanColumnBuilder<TModel extends BaseModel = BaseModel> extends BaseColumnBuilder<
  BooleanColumnConfig<TModel>,
  TModel
> {
  constructor(accessor: keyof TModel | string) {
    super(accessor)
    ;(this.config as any).type = 'boolean'
  }

  trueLabel(label: string): this {
    ;(this.config as any).trueLabel = label
    return this
  }

  falseLabel(label: string): this {
    ;(this.config as any).falseLabel = label
    return this
  }

  trueIcon(icon: ReactNode): this {
    ;(this.config as any).trueIcon = icon
    return this
  }

  falseIcon(icon: ReactNode): this {
    ;(this.config as any).falseIcon = icon
    return this
  }

  showLabel(show = true): this {
    ;(this.config as any).showLabel = show
    return this
  }

  build(): BooleanColumnConfig<TModel> {
    return this.config as BooleanColumnConfig<TModel>
  }
}

/**
 * Badge column builder
 */
export class BadgeColumnBuilder<TModel extends BaseModel = BaseModel> extends BaseColumnBuilder<
  BadgeColumnConfig<TModel>,
  TModel
> {
  constructor(accessor: keyof TModel | string) {
    super(accessor)
    ;(this.config as any).type = 'badge'
  }

  colors(colors: Record<string, string>): this {
    ;(this.config as any).colors = colors
    return this
  }

  icons(icons: Record<string, ReactNode>): this {
    ;(this.config as any).icons = icons
    return this
  }

  variant(variant: 'default' | 'outline' | 'secondary'): this {
    ;(this.config as any).variant = variant
    return this
  }

  build(): BadgeColumnConfig<TModel> {
    return this.config as BadgeColumnConfig<TModel>
  }
}

/**
 * Icon column builder
 */
export class IconColumnBuilder<TModel extends BaseModel = BaseModel> extends BaseColumnBuilder<
  IconColumnConfig<TModel>,
  TModel
> {
  constructor(accessor: keyof TModel | string, icons: Record<string, ReactNode>) {
    super(accessor)
    ;(this.config as any).type = 'icon'
    ;(this.config as any).icons = icons
  }

  size(size: number): this {
    ;(this.config as any).size = size
    return this
  }

  tooltip(tooltip = true): this {
    ;(this.config as any).tooltip = tooltip
    return this
  }

  build(): IconColumnConfig<TModel> {
    return this.config as IconColumnConfig<TModel>
  }
}

/**
 * Image column builder
 */
export class ImageColumnBuilder<TModel extends BaseModel = BaseModel> extends BaseColumnBuilder<
  ImageColumnConfig<TModel>,
  TModel
> {
  constructor(accessor: keyof TModel | string) {
    super(accessor)
    ;(this.config as any).type = 'image'
  }

  size(size: number): this {
    ;(this.config as any).size = size
    return this
  }

  rounded(rounded = true): this {
    ;(this.config as any).rounded = rounded
    return this
  }

  fallback(fallback: ReactNode): this {
    ;(this.config as any).fallback = fallback
    return this
  }

  preview(preview = true): this {
    ;(this.config as any).preview = preview
    return this
  }

  build(): ImageColumnConfig<TModel> {
    return this.config as ImageColumnConfig<TModel>
  }
}

/**
 * Color column builder
 */
export class ColorColumnBuilder<TModel extends BaseModel = BaseModel> extends BaseColumnBuilder<
  ColorColumnConfig<TModel>,
  TModel
> {
  constructor(accessor: keyof TModel | string) {
    super(accessor)
    ;(this.config as any).type = 'color'
  }

  showLabel(show = true): this {
    ;(this.config as any).showLabel = show
    return this
  }

  build(): ColorColumnConfig<TModel> {
    return this.config as ColorColumnConfig<TModel>
  }
}

/**
 * Custom column builder
 */
export class CustomColumnBuilder<TModel extends BaseModel = BaseModel> extends BaseColumnBuilder<
  CustomColumnConfig<TModel>,
  TModel
> {
  constructor(accessor: keyof TModel | string, render: (record: TModel) => ReactNode) {
    super(accessor)
    ;(this.config as any).type = 'custom'
    ;(this.config as any).render = render
  }

  build(): CustomColumnConfig<TModel> {
    return this.config as CustomColumnConfig<TModel>
  }
}

/**
 * Factory functions for creating column builders
 */
export const TextColumn = {
  make: <TModel extends BaseModel = BaseModel>(accessor: keyof TModel | string) =>
    new TextColumnBuilder<TModel>(accessor),
}

export const NumberColumn = {
  make: <TModel extends BaseModel = BaseModel>(accessor: keyof TModel | string) =>
    new NumberColumnBuilder<TModel>(accessor),
}

export const DateColumn = {
  make: <TModel extends BaseModel = BaseModel>(accessor: keyof TModel | string) =>
    new DateColumnBuilder<TModel>(accessor, 'date'),
}

export const DateTimeColumn = {
  make: <TModel extends BaseModel = BaseModel>(accessor: keyof TModel | string) =>
    new DateColumnBuilder<TModel>(accessor, 'datetime'),
}

export const BooleanColumn = {
  make: <TModel extends BaseModel = BaseModel>(accessor: keyof TModel | string) =>
    new BooleanColumnBuilder<TModel>(accessor),
}

export const BadgeColumn = {
  make: <TModel extends BaseModel = BaseModel>(accessor: keyof TModel | string) =>
    new BadgeColumnBuilder<TModel>(accessor),
}

export const IconColumn = {
  make: <TModel extends BaseModel = BaseModel>(
    accessor: keyof TModel | string,
    icons: Record<string, ReactNode>
  ) => new IconColumnBuilder<TModel>(accessor, icons),
}

export const ImageColumn = {
  make: <TModel extends BaseModel = BaseModel>(accessor: keyof TModel | string) =>
    new ImageColumnBuilder<TModel>(accessor),
}

export const ColorColumn = {
  make: <TModel extends BaseModel = BaseModel>(accessor: keyof TModel | string) =>
    new ColorColumnBuilder<TModel>(accessor),
}

export const CustomColumn = {
  make: <TModel extends BaseModel = BaseModel>(
    accessor: keyof TModel | string,
    render: (record: TModel) => ReactNode
  ) => new CustomColumnBuilder<TModel>(accessor, render),
}
