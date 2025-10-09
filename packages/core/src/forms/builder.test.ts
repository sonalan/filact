import { describe, it, expect } from 'vitest'
import { FormBuilder, createFormBuilder } from './builder'
import { TextInput, NumberInput, Select, Checkbox } from './fields'

describe('FormBuilder', () => {
  it('should create a form builder instance', () => {
    const builder = new FormBuilder()
    expect(builder).toBeInstanceOf(FormBuilder)
  })

  it('should create builder with factory function', () => {
    const builder = createFormBuilder()
    expect(builder).toBeInstanceOf(FormBuilder)
  })

  it('should build form with fields', () => {
    const builder = createFormBuilder()
    const schema = builder
      .schema([
        TextInput.make('name').label('Name').build(),
        TextInput.make('email').label('Email').build(),
      ])
      .build()

    expect(schema.fields).toHaveLength(2)
    expect(schema.fields[0].name).toBe('name')
    expect(schema.fields[1].name).toBe('email')
  })

  it('should set grid columns', () => {
    const builder = createFormBuilder()
    const schema = builder
      .schema([])
      .grid(2)
      .build()

    expect(schema.columns).toBe(2)
  })

  it('should set submit label', () => {
    const builder = createFormBuilder()
    const schema = builder
      .schema([])
      .submit('Save Changes')
      .build()

    expect(schema.submitLabel).toBe('Save Changes')
  })

  it('should set cancel label', () => {
    const builder = createFormBuilder()
    const schema = builder
      .schema([])
      .cancel('Discard')
      .build()

    expect(schema.cancelLabel).toBe('Discard')
  })

  it('should add sections', () => {
    const builder = createFormBuilder()
    const schema = builder
      .schema([])
      .withSections([
        {
          title: 'Personal Info',
          fields: [TextInput.make('name').build()],
        },
        {
          title: 'Contact',
          fields: [TextInput.make('email').build()],
        },
      ])
      .build()

    expect(schema.sections).toHaveLength(2)
    expect(schema.sections?.[0].title).toBe('Personal Info')
  })

  it('should add tabs', () => {
    const builder = createFormBuilder()
    const schema = builder
      .schema([])
      .withTabs([
        {
          id: 'profile',
          label: 'Profile',
          fields: [TextInput.make('name').build()],
        },
        {
          id: 'settings',
          label: 'Settings',
          fields: [Checkbox.make('notifications', 'Enable Notifications').build()],
        },
      ])
      .build()

    expect(schema.tabs).toHaveLength(2)
    expect(schema.tabs?.[0].id).toBe('profile')
  })

  it('should add wizard steps', () => {
    const builder = createFormBuilder()
    const schema = builder
      .schema([])
      .withWizard([
        {
          id: 'step1',
          label: 'Basic Info',
          fields: [TextInput.make('name').build()],
        },
        {
          id: 'step2',
          label: 'Contact',
          fields: [TextInput.make('email').build()],
        },
      ])
      .build()

    expect(schema.wizard).toHaveLength(2)
    expect(schema.wizard?.[0].id).toBe('step1')
  })

  it('should chain multiple methods', () => {
    const builder = createFormBuilder()
    const schema = builder
      .schema([
        TextInput.make('username').label('Username').required().build(),
        NumberInput.make('age').label('Age').min(18).build(),
      ])
      .grid(2)
      .submit('Create Account')
      .cancel('Cancel')
      .build()

    expect(schema.fields).toHaveLength(2)
    expect(schema.columns).toBe(2)
    expect(schema.submitLabel).toBe('Create Account')
    expect(schema.cancelLabel).toBe('Cancel')
  })

  describe('field helper methods', () => {
    it('should add fields incrementally', () => {
      const builder = createFormBuilder()
      builder
        .addFields(TextInput.make('name').build())
        .addFields(TextInput.make('email').build(), NumberInput.make('age').build())

      const schema = builder.build()

      expect(schema.fields).toHaveLength(3)
      expect(schema.fields[0].name).toBe('name')
      expect(schema.fields[1].name).toBe('email')
      expect(schema.fields[2].name).toBe('age')
    })

    it('should remove a field by name', () => {
      const builder = createFormBuilder()
      builder.schema([
        TextInput.make('name').build(),
        TextInput.make('email').build(),
        NumberInput.make('age').build(),
      ])

      builder.removeField('email')

      const schema = builder.build()

      expect(schema.fields).toHaveLength(2)
      expect(schema.fields[0].name).toBe('name')
      expect(schema.fields[1].name).toBe('age')
    })

    it('should get a field by name', () => {
      const builder = createFormBuilder()
      builder.schema([
        TextInput.make('name').label('Name').build(),
        TextInput.make('email').label('Email').build(),
      ])

      const field = builder.getField('email')

      expect(field).toBeDefined()
      expect(field?.name).toBe('email')
      expect(field?.label).toBe('Email')
    })

    it('should return undefined when field is not found', () => {
      const builder = createFormBuilder()
      builder.schema([TextInput.make('name').build()])

      const field = builder.getField('nonexistent')

      expect(field).toBeUndefined()
    })

    it('should clear all fields', () => {
      const builder = createFormBuilder()
      builder.schema([
        TextInput.make('name').build(),
        TextInput.make('email').build(),
      ])

      builder.clearFields()

      const schema = builder.build()

      expect(schema.fields).toHaveLength(0)
    })
  })

  describe('section helper methods', () => {
    it('should add a section incrementally', () => {
      const builder = createFormBuilder()
      builder
        .addSection({
          title: 'Personal Info',
          fields: [TextInput.make('name').build()],
        })
        .addSection({
          title: 'Contact',
          fields: [TextInput.make('email').build()],
        })

      const schema = builder.build()

      expect(schema.sections).toHaveLength(2)
      expect(schema.sections?.[0].title).toBe('Personal Info')
      expect(schema.sections?.[1].title).toBe('Contact')
    })

    it('should remove a section by title', () => {
      const builder = createFormBuilder()
      builder.withSections([
        {
          title: 'Personal Info',
          fields: [TextInput.make('name').build()],
        },
        {
          title: 'Contact',
          fields: [TextInput.make('email').build()],
        },
        {
          title: 'Settings',
          fields: [Checkbox.make('notifications', 'Enable Notifications').build()],
        },
      ])

      builder.removeSection('Contact')

      const schema = builder.build()

      expect(schema.sections).toHaveLength(2)
      expect(schema.sections?.[0].title).toBe('Personal Info')
      expect(schema.sections?.[1].title).toBe('Settings')
    })

    it('should get a section by title', () => {
      const builder = createFormBuilder()
      builder.withSections([
        {
          title: 'Personal Info',
          description: 'Your personal information',
          fields: [TextInput.make('name').build()],
        },
        {
          title: 'Contact',
          fields: [TextInput.make('email').build()],
        },
      ])

      const section = builder.getSection('Personal Info')

      expect(section).toBeDefined()
      expect(section?.title).toBe('Personal Info')
      expect(section?.description).toBe('Your personal information')
    })

    it('should return undefined when section is not found', () => {
      const builder = createFormBuilder()
      builder.withSections([
        {
          title: 'Personal Info',
          fields: [TextInput.make('name').build()],
        },
      ])

      const section = builder.getSection('Nonexistent')

      expect(section).toBeUndefined()
    })

    it('should handle remove on empty sections', () => {
      const builder = createFormBuilder()

      builder.removeSection('Nonexistent')

      const schema = builder.build()

      expect(schema.sections).toBeUndefined()
    })
  })
})
