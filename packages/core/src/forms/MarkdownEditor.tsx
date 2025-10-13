/**
 * Markdown Editor Field Builder
 * Builder for markdown editing fields with preview
 */

import type { z } from 'zod'

export interface MarkdownFieldConfig {
  type: 'markdown'
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

  // Markdown specific
  showPreview?: boolean
  previewMode?: 'side' | 'tab' | 'bottom'
  height?: number
  maxHeight?: number
  enableToolbar?: boolean
  toolbar?: MarkdownToolbarOption[]
  syntaxHighlighting?: boolean
  lineNumbers?: boolean
  enableTables?: boolean
  enableCheckboxes?: boolean
  enableFootnotes?: boolean
  enableEmoji?: boolean
  onImageUpload?: (file: File) => Promise<string>
  theme?: 'light' | 'dark'
}

export type MarkdownToolbarOption =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'heading'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'quote'
  | 'code'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'table'
  | 'bulletList'
  | 'orderedList'
  | 'checkbox'
  | 'hr'
  | 'preview'
  | 'fullscreen'
  | 'help'
  | '|' // Separator

/**
 * Markdown Editor Builder
 */
export class MarkdownEditorBuilder {
  private config: Partial<MarkdownFieldConfig> = {
    type: 'markdown',
    name: '',
    showPreview: true,
    previewMode: 'side',
    height: 300,
    enableToolbar: true,
    toolbar: [
      'bold',
      'italic',
      'strikethrough',
      '|',
      'heading',
      'quote',
      '|',
      'code',
      'codeBlock',
      '|',
      'bulletList',
      'orderedList',
      'checkbox',
      '|',
      'link',
      'image',
      '|',
      'table',
      'hr',
      '|',
      'preview',
      'fullscreen',
      '|',
      'help',
    ],
    syntaxHighlighting: true,
    enableTables: true,
    enableCheckboxes: true,
    enableFootnotes: false,
    enableEmoji: true,
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

  showPreview(show = true): this {
    this.config.showPreview = show
    return this
  }

  previewMode(mode: 'side' | 'tab' | 'bottom'): this {
    this.config.previewMode = mode
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

  enableToolbar(enable = true): this {
    this.config.enableToolbar = enable
    return this
  }

  toolbar(options: MarkdownToolbarOption[]): this {
    this.config.toolbar = options
    return this
  }

  syntaxHighlighting(enable = true): this {
    this.config.syntaxHighlighting = enable
    return this
  }

  lineNumbers(enable = true): this {
    this.config.lineNumbers = enable
    return this
  }

  enableTables(enable = true): this {
    this.config.enableTables = enable
    return this
  }

  enableCheckboxes(enable = true): this {
    this.config.enableCheckboxes = enable
    return this
  }

  enableFootnotes(enable = true): this {
    this.config.enableFootnotes = enable
    return this
  }

  enableEmoji(enable = true): this {
    this.config.enableEmoji = enable
    return this
  }

  onImageUpload(handler: (file: File) => Promise<string>): this {
    this.config.onImageUpload = handler
    return this
  }

  theme(theme: 'light' | 'dark'): this {
    this.config.theme = theme
    return this
  }

  build(): MarkdownFieldConfig {
    if (!this.config.name) {
      throw new Error('Field name is required')
    }
    return this.config as MarkdownFieldConfig
  }
}

export const MarkdownEditor = {
  make: (name: string) => new MarkdownEditorBuilder(name),
}

/**
 * Preset toolbar configurations
 */
export const MarkdownToolbars = {
  /** Minimal toolbar for simple markdown */
  minimal: ['bold', 'italic', 'link', '|', 'preview'] as MarkdownToolbarOption[],

  /** Basic toolbar for common markdown */
  basic: [
    'bold',
    'italic',
    'strikethrough',
    '|',
    'heading',
    'quote',
    '|',
    'bulletList',
    'orderedList',
    '|',
    'link',
    'image',
    '|',
    'preview',
    'help',
  ] as MarkdownToolbarOption[],

  /** Standard toolbar with code support */
  standard: [
    'bold',
    'italic',
    'strikethrough',
    '|',
    'heading',
    'quote',
    '|',
    'code',
    'codeBlock',
    '|',
    'bulletList',
    'orderedList',
    'checkbox',
    '|',
    'link',
    'image',
    '|',
    'preview',
    'fullscreen',
    '|',
    'help',
  ] as MarkdownToolbarOption[],

  /** Full toolbar with all options */
  full: [
    'bold',
    'italic',
    'strikethrough',
    '|',
    'h1',
    'h2',
    'h3',
    '|',
    'quote',
    'code',
    'codeBlock',
    '|',
    'bulletList',
    'orderedList',
    'checkbox',
    '|',
    'link',
    'image',
    'table',
    'hr',
    '|',
    'preview',
    'fullscreen',
    '|',
    'help',
  ] as MarkdownToolbarOption[],

  /** Comment/discussion toolbar */
  comment: [
    'bold',
    'italic',
    '|',
    'link',
    'code',
    '|',
    'quote',
    '|',
    'preview',
  ] as MarkdownToolbarOption[],

  /** Documentation toolbar */
  documentation: [
    'bold',
    'italic',
    '|',
    'heading',
    'quote',
    '|',
    'code',
    'codeBlock',
    '|',
    'bulletList',
    'orderedList',
    '|',
    'link',
    'image',
    'table',
    '|',
    'preview',
    'fullscreen',
    '|',
    'help',
  ] as MarkdownToolbarOption[],

  /** GitHub-style markdown toolbar */
  github: [
    'bold',
    'italic',
    'strikethrough',
    '|',
    'heading',
    'quote',
    'code',
    'codeBlock',
    '|',
    'bulletList',
    'orderedList',
    'checkbox',
    '|',
    'link',
    'image',
    '|',
    'preview',
  ] as MarkdownToolbarOption[],
}
