/**
 * Rich Text Editor Field Builder
 * Builder for rich text editing fields with formatting options
 */

import { ReactNode } from 'react'
import type { z } from 'zod'

export interface RichTextFieldConfig {
  type: 'richtext'
  name: string
  label?: string
  placeholder?: string
  helperText?: string
  required?: boolean
  disabled?: boolean | ((values: Record<string, unknown>) => boolean)
  readonly?: boolean | ((values: Record<string, unknown>) => boolean)
  visible?: boolean | ((values: Record<string, unknown>) => boolean)
  default?: string
  validation?: z.ZodType
  columnSpan?: number
  className?: string
  minLength?: number
  maxLength?: number

  // Rich text specific
  toolbar?: RichTextToolbarOption[]
  height?: number
  maxHeight?: number
  allowedFormats?: RichTextFormat[]
  onImageUpload?: (file: File) => Promise<string>
  enableCodeBlocks?: boolean
  enableTables?: boolean
  enableLists?: boolean
  enableLinks?: boolean
  enableImages?: boolean
  theme?: 'light' | 'dark'
}

export type RichTextFormat =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'heading'
  | 'blockquote'
  | 'codeBlock'
  | 'bulletList'
  | 'orderedList'
  | 'link'
  | 'image'
  | 'table'
  | 'horizontalRule'
  | 'hardBreak'
  | 'clear'

export type RichTextToolbarOption =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'heading'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'blockquote'
  | 'codeBlock'
  | 'bulletList'
  | 'orderedList'
  | 'link'
  | 'image'
  | 'table'
  | 'hr'
  | 'clear'
  | '|' // Separator

/**
 * Rich Text Editor Builder
 */
export class RichTextEditorBuilder {
  private config: Partial<RichTextFieldConfig> = {
    type: 'richtext',
    name: '',
    toolbar: [
      'bold',
      'italic',
      'underline',
      '|',
      'heading',
      'blockquote',
      '|',
      'bulletList',
      'orderedList',
      '|',
      'link',
      'image',
      '|',
      'clear',
    ],
    height: 300,
    enableCodeBlocks: true,
    enableTables: true,
    enableLists: true,
    enableLinks: true,
    enableImages: true,
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

  default(value: string): this {
    this.config.default = value
    return this
  }

  columnSpan(span: number): this {
    this.config.columnSpan = span
    return this
  }

  validate(schema: z.ZodType): this {
    this.config.validation = schema
    return this
  }

  className(className: string): this {
    this.config.className = className
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

  toolbar(options: RichTextToolbarOption[]): this {
    this.config.toolbar = options
    return this
  }

  height(height: number): this {
    this.config.height = height
    return this
  }

  maxHeight(height: number): this {
    this.config.maxHeight = height
    return this
  }

  allowedFormats(formats: RichTextFormat[]): this {
    this.config.allowedFormats = formats
    return this
  }

  onImageUpload(handler: (file: File) => Promise<string>): this {
    this.config.onImageUpload = handler
    return this
  }

  enableCodeBlocks(enable = true): this {
    this.config.enableCodeBlocks = enable
    return this
  }

  enableTables(enable = true): this {
    this.config.enableTables = enable
    return this
  }

  enableLists(enable = true): this {
    this.config.enableLists = enable
    return this
  }

  enableLinks(enable = true): this {
    this.config.enableLinks = enable
    return this
  }

  enableImages(enable = true): this {
    this.config.enableImages = enable
    return this
  }

  theme(theme: 'light' | 'dark'): this {
    this.config.theme = theme
    return this
  }

  build(): RichTextFieldConfig {
    if (!this.config.name) {
      throw new Error('Field name is required')
    }
    return this.config as RichTextFieldConfig
  }
}

export const RichTextEditor = {
  make: (name: string) => new RichTextEditorBuilder(name),
}

/**
 * Preset toolbar configurations
 */
export const RichTextToolbars = {
  /** Minimal toolbar with basic formatting */
  minimal: ['bold', 'italic', 'link', '|', 'clear'] as RichTextToolbarOption[],

  /** Basic toolbar with common formatting */
  basic: [
    'bold',
    'italic',
    'underline',
    '|',
    'bulletList',
    'orderedList',
    '|',
    'link',
    '|',
    'clear',
  ] as RichTextToolbarOption[],

  /** Standard toolbar with headings and formatting */
  standard: [
    'bold',
    'italic',
    'underline',
    'strike',
    '|',
    'h1',
    'h2',
    'h3',
    '|',
    'bulletList',
    'orderedList',
    '|',
    'link',
    'image',
    '|',
    'blockquote',
    'codeBlock',
    '|',
    'clear',
  ] as RichTextToolbarOption[],

  /** Full toolbar with all options */
  full: [
    'bold',
    'italic',
    'underline',
    'strike',
    'code',
    '|',
    'h1',
    'h2',
    'h3',
    '|',
    'bulletList',
    'orderedList',
    '|',
    'link',
    'image',
    '|',
    'blockquote',
    'codeBlock',
    'table',
    'hr',
    '|',
    'clear',
  ] as RichTextToolbarOption[],

  /** Comment/discussion toolbar */
  comment: [
    'bold',
    'italic',
    '|',
    'link',
    'code',
    '|',
    'blockquote',
    '|',
    'clear',
  ] as RichTextToolbarOption[],

  /** Documentation toolbar */
  documentation: [
    'bold',
    'italic',
    'code',
    '|',
    'h1',
    'h2',
    'h3',
    '|',
    'bulletList',
    'orderedList',
    '|',
    'link',
    'image',
    '|',
    'blockquote',
    'codeBlock',
    'table',
    '|',
    'clear',
  ] as RichTextToolbarOption[],
}
