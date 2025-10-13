import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { RichTextEditor, RichTextToolbars } from './RichTextEditor'

describe('RichTextEditor', () => {
  describe('Basic Configuration', () => {
    it('should create rich text field', () => {
      const field = RichTextEditor.make('content')
        .label('Content')
        .build()

      expect(field.type).toBe('richtext')
      expect(field.name).toBe('content')
      expect(field.label).toBe('Content')
    })

    it('should set placeholder', () => {
      const field = RichTextEditor.make('content')
        .placeholder('Enter content...')
        .build()

      expect(field.placeholder).toBe('Enter content...')
    })

    it('should set required', () => {
      const field = RichTextEditor.make('content')
        .required()
        .build()

      expect(field.required).toBe(true)
    })

    it('should set helper text', () => {
      const field = RichTextEditor.make('content')
        .helperText('Enter your article content')
        .build()

      expect(field.helperText).toBe('Enter your article content')
    })

    it('should set default value', () => {
      const field = RichTextEditor.make('content')
        .default('<p>Default content</p>')
        .build()

      expect(field.default).toBe('<p>Default content</p>')
    })

    it('should set column span', () => {
      const field = RichTextEditor.make('content')
        .columnSpan(12)
        .build()

      expect(field.columnSpan).toBe(12)
    })

    it('should set custom className', () => {
      const field = RichTextEditor.make('content')
        .className('custom-editor')
        .build()

      expect(field.className).toBe('custom-editor')
    })
  })

  describe('State Configuration', () => {
    it('should set disabled', () => {
      const field = RichTextEditor.make('content')
        .disabled(true)
        .build()

      expect(field.disabled).toBe(true)
    })

    it('should set conditional disabled', () => {
      const disabledFn = (values: Record<string, unknown>) => values.published === true
      const field = RichTextEditor.make('content')
        .disabled(disabledFn)
        .build()

      expect(field.disabled).toBe(disabledFn)
    })

    it('should set readonly', () => {
      const field = RichTextEditor.make('content')
        .readonly(true)
        .build()

      expect(field.readonly).toBe(true)
    })

    it('should set conditional readonly', () => {
      const readonlyFn = (values: Record<string, unknown>) => values.locked === true
      const field = RichTextEditor.make('content')
        .readonly(readonlyFn)
        .build()

      expect(field.readonly).toBe(readonlyFn)
    })

    it('should set visible', () => {
      const field = RichTextEditor.make('content')
        .visible(false)
        .build()

      expect(field.visible).toBe(false)
    })

    it('should set conditional visible', () => {
      const visibleFn = (values: Record<string, unknown>) => values.type === 'article'
      const field = RichTextEditor.make('content')
        .visible(visibleFn)
        .build()

      expect(field.visible).toBe(visibleFn)
    })
  })

  describe('Validation', () => {
    it('should set validation schema', () => {
      const schema = z.string().min(10)
      const field = RichTextEditor.make('content')
        .validate(schema)
        .build()

      expect(field.validation).toBe(schema)
    })

    it('should set min length', () => {
      const field = RichTextEditor.make('content')
        .minLength(100)
        .build()

      expect(field.minLength).toBe(100)
    })

    it('should set max length', () => {
      const field = RichTextEditor.make('content')
        .maxLength(5000)
        .build()

      expect(field.maxLength).toBe(5000)
    })
  })

  describe('Rich Text Specific Configuration', () => {
    it('should set custom toolbar', () => {
      const toolbar = ['bold', 'italic', 'link']
      const field = RichTextEditor.make('content')
        .toolbar(toolbar)
        .build()

      expect(field.toolbar).toEqual(toolbar)
    })

    it('should have default toolbar', () => {
      const field = RichTextEditor.make('content').build()

      expect(field.toolbar).toBeDefined()
      expect(field.toolbar?.length).toBeGreaterThan(0)
    })

    it('should set height', () => {
      const field = RichTextEditor.make('content')
        .height(500)
        .build()

      expect(field.height).toBe(500)
    })

    it('should set max height', () => {
      const field = RichTextEditor.make('content')
        .maxHeight(800)
        .build()

      expect(field.maxHeight).toBe(800)
    })

    it('should set allowed formats', () => {
      const formats = ['bold', 'italic', 'heading']
      const field = RichTextEditor.make('content')
        .allowedFormats(formats)
        .build()

      expect(field.allowedFormats).toEqual(formats)
    })

    it('should set image upload handler', () => {
      const handler = vi.fn().mockResolvedValue('https://example.com/image.jpg')
      const field = RichTextEditor.make('content')
        .onImageUpload(handler)
        .build()

      expect(field.onImageUpload).toBe(handler)
    })

    it('should enable code blocks', () => {
      const field = RichTextEditor.make('content')
        .enableCodeBlocks(true)
        .build()

      expect(field.enableCodeBlocks).toBe(true)
    })

    it('should disable code blocks', () => {
      const field = RichTextEditor.make('content')
        .enableCodeBlocks(false)
        .build()

      expect(field.enableCodeBlocks).toBe(false)
    })

    it('should enable tables', () => {
      const field = RichTextEditor.make('content')
        .enableTables(true)
        .build()

      expect(field.enableTables).toBe(true)
    })

    it('should enable lists', () => {
      const field = RichTextEditor.make('content')
        .enableLists(true)
        .build()

      expect(field.enableLists).toBe(true)
    })

    it('should enable links', () => {
      const field = RichTextEditor.make('content')
        .enableLinks(true)
        .build()

      expect(field.enableLinks).toBe(true)
    })

    it('should enable images', () => {
      const field = RichTextEditor.make('content')
        .enableImages(true)
        .build()

      expect(field.enableImages).toBe(true)
    })

    it('should set theme', () => {
      const field = RichTextEditor.make('content')
        .theme('dark')
        .build()

      expect(field.theme).toBe('dark')
    })
  })

  describe('Builder Validation', () => {
    it('should throw error if name is missing', () => {
      const builder = RichTextEditor.make('')
      expect(() => builder.build()).toThrow('Field name is required')
    })
  })

  describe('Chaining', () => {
    it('should chain all configuration methods', () => {
      const handler = vi.fn()
      const field = RichTextEditor.make('content')
        .label('Article Content')
        .placeholder('Write your article...')
        .required(true)
        .helperText('Rich text content')
        .default('<p>Start here</p>')
        .columnSpan(12)
        .className('custom')
        .disabled(false)
        .readonly(false)
        .visible(true)
        .minLength(10)
        .maxLength(10000)
        .toolbar(['bold', 'italic'])
        .height(400)
        .maxHeight(600)
        .onImageUpload(handler)
        .enableCodeBlocks(true)
        .enableTables(true)
        .enableLists(true)
        .enableLinks(true)
        .enableImages(true)
        .theme('light')
        .build()

      expect(field.label).toBe('Article Content')
      expect(field.placeholder).toBe('Write your article...')
      expect(field.required).toBe(true)
      expect(field.height).toBe(400)
      expect(field.theme).toBe('light')
    })
  })
})

describe('RichTextToolbars', () => {
  it('should have minimal toolbar preset', () => {
    expect(RichTextToolbars.minimal).toBeDefined()
    expect(RichTextToolbars.minimal).toContain('bold')
    expect(RichTextToolbars.minimal).toContain('italic')
  })

  it('should have basic toolbar preset', () => {
    expect(RichTextToolbars.basic).toBeDefined()
    expect(RichTextToolbars.basic).toContain('bulletList')
  })

  it('should have standard toolbar preset', () => {
    expect(RichTextToolbars.standard).toBeDefined()
    expect(RichTextToolbars.standard).toContain('h1')
    expect(RichTextToolbars.standard).toContain('blockquote')
  })

  it('should have full toolbar preset', () => {
    expect(RichTextToolbars.full).toBeDefined()
    expect(RichTextToolbars.full).toContain('table')
  })

  it('should have comment toolbar preset', () => {
    expect(RichTextToolbars.comment).toBeDefined()
    expect(RichTextToolbars.comment.length).toBeLessThan(RichTextToolbars.standard.length)
  })

  it('should have documentation toolbar preset', () => {
    expect(RichTextToolbars.documentation).toBeDefined()
    expect(RichTextToolbars.documentation).toContain('codeBlock')
  })

  it('should work with builder', () => {
    const field = RichTextEditor.make('content')
      .toolbar(RichTextToolbars.minimal)
      .build()

    expect(field.toolbar).toEqual(RichTextToolbars.minimal)
  })
})
