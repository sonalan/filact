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
})
