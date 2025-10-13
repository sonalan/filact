import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { MarkdownEditor, MarkdownToolbars } from './MarkdownEditor'

describe('MarkdownEditor', () => {
  describe('Basic Configuration', () => {
    it('should create markdown field', () => {
      const field = MarkdownEditor.make('content')
        .label('Content')
        .build()

      expect(field.type).toBe('markdown')
      expect(field.name).toBe('content')
      expect(field.label).toBe('Content')
    })

    it('should set placeholder', () => {
      const field = MarkdownEditor.make('content')
        .placeholder('Enter markdown...')
        .build()

      expect(field.placeholder).toBe('Enter markdown...')
    })

    it('should set required', () => {
      const field = MarkdownEditor.make('content')
        .required()
        .build()

      expect(field.required).toBe(true)
    })

    it('should set helper text', () => {
      const field = MarkdownEditor.make('content')
        .helperText('Markdown syntax supported')
        .build()

      expect(field.helperText).toBe('Markdown syntax supported')
    })

    it('should set default value', () => {
      const field = MarkdownEditor.make('content')
        .default('# Default heading')
        .build()

      expect(field.default).toBe('# Default heading')
    })

    it('should set column span', () => {
      const field = MarkdownEditor.make('content')
        .columnSpan(12)
        .build()

      expect(field.columnSpan).toBe(12)
    })

    it('should set custom className', () => {
      const field = MarkdownEditor.make('content')
        .className('custom-markdown')
        .build()

      expect(field.className).toBe('custom-markdown')
    })
  })

  describe('State Configuration', () => {
    it('should set disabled', () => {
      const field = MarkdownEditor.make('content')
        .disabled(true)
        .build()

      expect(field.disabled).toBe(true)
    })

    it('should set conditional disabled', () => {
      const disabledFn = (values: Record<string, unknown>) => values.published === true
      const field = MarkdownEditor.make('content')
        .disabled(disabledFn)
        .build()

      expect(field.disabled).toBe(disabledFn)
    })

    it('should set readonly', () => {
      const field = MarkdownEditor.make('content')
        .readonly(true)
        .build()

      expect(field.readonly).toBe(true)
    })

    it('should set conditional readonly', () => {
      const readonlyFn = (values: Record<string, unknown>) => values.locked === true
      const field = MarkdownEditor.make('content')
        .readonly(readonlyFn)
        .build()

      expect(field.readonly).toBe(readonlyFn)
    })

    it('should set visible', () => {
      const field = MarkdownEditor.make('content')
        .visible(false)
        .build()

      expect(field.visible).toBe(false)
    })

    it('should set conditional visible', () => {
      const visibleFn = (values: Record<string, unknown>) => values.type === 'documentation'
      const field = MarkdownEditor.make('content')
        .visible(visibleFn)
        .build()

      expect(field.visible).toBe(visibleFn)
    })
  })

  describe('Validation', () => {
    it('should set validation schema', () => {
      const schema = z.string().min(10)
      const field = MarkdownEditor.make('content')
        .validate(schema)
        .build()

      expect(field.validation).toBe(schema)
    })

    it('should set min length', () => {
      const field = MarkdownEditor.make('content')
        .minLength(50)
        .build()

      expect(field.minLength).toBe(50)
    })

    it('should set max length', () => {
      const field = MarkdownEditor.make('content')
        .maxLength(10000)
        .build()

      expect(field.maxLength).toBe(10000)
    })
  })

  describe('Markdown Specific Configuration', () => {
    it('should show preview by default', () => {
      const field = MarkdownEditor.make('content').build()

      expect(field.showPreview).toBe(true)
    })

    it('should hide preview', () => {
      const field = MarkdownEditor.make('content')
        .showPreview(false)
        .build()

      expect(field.showPreview).toBe(false)
    })

    it('should set preview mode to side', () => {
      const field = MarkdownEditor.make('content')
        .previewMode('side')
        .build()

      expect(field.previewMode).toBe('side')
    })

    it('should set preview mode to tab', () => {
      const field = MarkdownEditor.make('content')
        .previewMode('tab')
        .build()

      expect(field.previewMode).toBe('tab')
    })

    it('should set preview mode to bottom', () => {
      const field = MarkdownEditor.make('content')
        .previewMode('bottom')
        .build()

      expect(field.previewMode).toBe('bottom')
    })

    it('should set height', () => {
      const field = MarkdownEditor.make('content')
        .height(400)
        .build()

      expect(field.height).toBe(400)
    })

    it('should set max height', () => {
      const field = MarkdownEditor.make('content')
        .maxHeight(600)
        .build()

      expect(field.maxHeight).toBe(600)
    })

    it('should enable toolbar by default', () => {
      const field = MarkdownEditor.make('content').build()

      expect(field.enableToolbar).toBe(true)
    })

    it('should disable toolbar', () => {
      const field = MarkdownEditor.make('content')
        .enableToolbar(false)
        .build()

      expect(field.enableToolbar).toBe(false)
    })

    it('should set custom toolbar', () => {
      const toolbar = ['bold', 'italic', 'link', 'preview']
      const field = MarkdownEditor.make('content')
        .toolbar(toolbar)
        .build()

      expect(field.toolbar).toEqual(toolbar)
    })

    it('should have default toolbar', () => {
      const field = MarkdownEditor.make('content').build()

      expect(field.toolbar).toBeDefined()
      expect(field.toolbar?.length).toBeGreaterThan(0)
    })

    it('should enable syntax highlighting', () => {
      const field = MarkdownEditor.make('content')
        .syntaxHighlighting(true)
        .build()

      expect(field.syntaxHighlighting).toBe(true)
    })

    it('should enable line numbers', () => {
      const field = MarkdownEditor.make('content')
        .lineNumbers(true)
        .build()

      expect(field.lineNumbers).toBe(true)
    })

    it('should enable tables', () => {
      const field = MarkdownEditor.make('content')
        .enableTables(true)
        .build()

      expect(field.enableTables).toBe(true)
    })

    it('should enable checkboxes', () => {
      const field = MarkdownEditor.make('content')
        .enableCheckboxes(true)
        .build()

      expect(field.enableCheckboxes).toBe(true)
    })

    it('should enable footnotes', () => {
      const field = MarkdownEditor.make('content')
        .enableFootnotes(true)
        .build()

      expect(field.enableFootnotes).toBe(true)
    })

    it('should enable emoji', () => {
      const field = MarkdownEditor.make('content')
        .enableEmoji(true)
        .build()

      expect(field.enableEmoji).toBe(true)
    })

    it('should set image upload handler', () => {
      const handler = vi.fn().mockResolvedValue('https://example.com/image.jpg')
      const field = MarkdownEditor.make('content')
        .onImageUpload(handler)
        .build()

      expect(field.onImageUpload).toBe(handler)
    })

    it('should set theme', () => {
      const field = MarkdownEditor.make('content')
        .theme('dark')
        .build()

      expect(field.theme).toBe('dark')
    })
  })

  describe('Builder Validation', () => {
    it('should throw error if name is missing', () => {
      const builder = MarkdownEditor.make('')
      expect(() => builder.build()).toThrow('Field name is required')
    })
  })

  describe('Chaining', () => {
    it('should chain all configuration methods', () => {
      const handler = vi.fn()
      const field = MarkdownEditor.make('content')
        .label('Documentation')
        .placeholder('Write docs...')
        .required(true)
        .helperText('Markdown supported')
        .default('# Getting Started')
        .columnSpan(12)
        .className('custom')
        .disabled(false)
        .readonly(false)
        .visible(true)
        .minLength(10)
        .maxLength(20000)
        .showPreview(true)
        .previewMode('side')
        .height(500)
        .maxHeight(800)
        .enableToolbar(true)
        .toolbar(['bold', 'italic'])
        .syntaxHighlighting(true)
        .lineNumbers(true)
        .enableTables(true)
        .enableCheckboxes(true)
        .enableFootnotes(true)
        .enableEmoji(true)
        .onImageUpload(handler)
        .theme('light')
        .build()

      expect(field.label).toBe('Documentation')
      expect(field.showPreview).toBe(true)
      expect(field.previewMode).toBe('side')
      expect(field.height).toBe(500)
      expect(field.syntaxHighlighting).toBe(true)
    })
  })
})

describe('MarkdownToolbars', () => {
  it('should have minimal toolbar preset', () => {
    expect(MarkdownToolbars.minimal).toBeDefined()
    expect(MarkdownToolbars.minimal).toContain('bold')
    expect(MarkdownToolbars.minimal).toContain('italic')
    expect(MarkdownToolbars.minimal).toContain('preview')
  })

  it('should have basic toolbar preset', () => {
    expect(MarkdownToolbars.basic).toBeDefined()
    expect(MarkdownToolbars.basic).toContain('bulletList')
    expect(MarkdownToolbars.basic).toContain('heading')
  })

  it('should have standard toolbar preset', () => {
    expect(MarkdownToolbars.standard).toBeDefined()
    expect(MarkdownToolbars.standard).toContain('code')
    expect(MarkdownToolbars.standard).toContain('codeBlock')
    expect(MarkdownToolbars.standard).toContain('checkbox')
  })

  it('should have full toolbar preset', () => {
    expect(MarkdownToolbars.full).toBeDefined()
    expect(MarkdownToolbars.full).toContain('table')
    expect(MarkdownToolbars.full).toContain('hr')
  })

  it('should have comment toolbar preset', () => {
    expect(MarkdownToolbars.comment).toBeDefined()
    expect(MarkdownToolbars.comment.length).toBeLessThan(MarkdownToolbars.standard.length)
  })

  it('should have documentation toolbar preset', () => {
    expect(MarkdownToolbars.documentation).toBeDefined()
    expect(MarkdownToolbars.documentation).toContain('codeBlock')
    expect(MarkdownToolbars.documentation).toContain('table')
  })

  it('should have github toolbar preset', () => {
    expect(MarkdownToolbars.github).toBeDefined()
    expect(MarkdownToolbars.github).toContain('strikethrough')
    expect(MarkdownToolbars.github).toContain('checkbox')
  })

  it('should work with builder', () => {
    const field = MarkdownEditor.make('content')
      .toolbar(MarkdownToolbars.github)
      .build()

    expect(field.toolbar).toEqual(MarkdownToolbars.github)
  })
})
