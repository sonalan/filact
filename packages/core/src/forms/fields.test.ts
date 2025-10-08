import { describe, it, expect } from 'vitest'
import {
  TextInput,
  EmailInput,
  PasswordInput,
  Textarea,
  NumberInput,
  Select,
  Checkbox,
  Switch,
  Radio,
} from './fields'

describe('Field Builders', () => {
  describe('TextInput', () => {
    it('should create text input field', () => {
      const field = TextInput.make('username').label('Username').build()

      expect(field.type).toBe('text')
      expect(field.name).toBe('username')
      expect(field.label).toBe('Username')
    })

    it('should set placeholder', () => {
      const field = TextInput.make('username')
        .placeholder('Enter username')
        .build()

      expect(field.placeholder).toBe('Enter username')
    })

    it('should set required', () => {
      const field = TextInput.make('username').required().build()

      expect(field.required).toBe(true)
    })

    it('should set min/max length', () => {
      const field = TextInput.make('username')
        .minLength(3)
        .maxLength(20)
        .build()

      expect(field.minLength).toBe(3)
      expect(field.maxLength).toBe(20)
    })

    it('should set pattern', () => {
      const field = TextInput.make('username')
        .pattern('^[a-zA-Z0-9]+$')
        .build()

      expect(field.pattern).toBe('^[a-zA-Z0-9]+$')
    })

    it('should set disabled', () => {
      const field = TextInput.make('username').disabled(true).build()

      expect(field.disabled).toBe(true)
    })

    it('should set disabled with function', () => {
      const field = TextInput.make('username')
        .disabled((values) => values.locked === true)
        .build()

      expect(typeof field.disabled).toBe('function')
    })

    it('should set readonly', () => {
      const field = TextInput.make('username').readonly(true).build()

      expect(field.readonly).toBe(true)
    })

    it('should set readonly with function', () => {
      const field = TextInput.make('username')
        .readonly((values) => values.isSubmitted === true)
        .build()

      expect(typeof field.readonly).toBe('function')
    })

    it('should set visible with function', () => {
      const field = TextInput.make('username')
        .visible((values) => values.showAdvanced === true)
        .build()

      expect(typeof field.visible).toBe('function')
    })

    it('should set helper text', () => {
      const field = TextInput.make('username')
        .helperText('Choose a unique username')
        .build()

      expect(field.helperText).toBe('Choose a unique username')
    })

    it('should set default value', () => {
      const field = TextInput.make('username').default('user123').build()

      expect(field.default).toBe('user123')
    })

    it('should set column span', () => {
      const field = TextInput.make('username').columnSpan(2).build()

      expect(field.columnSpan).toBe(2)
    })

    it('should throw error if name is missing', () => {
      const builder = TextInput.make('')
      expect(() => builder.build()).toThrow('Field name is required')
    })
  })

  describe('EmailInput', () => {
    it('should create email input field', () => {
      const field = EmailInput.make('email').label('Email').build()

      expect(field.type).toBe('email')
      expect(field.name).toBe('email')
    })
  })

  describe('PasswordInput', () => {
    it('should create password input field', () => {
      const field = PasswordInput.make('password').label('Password').build()

      expect(field.type).toBe('password')
      expect(field.name).toBe('password')
    })
  })

  describe('Textarea', () => {
    it('should create textarea field', () => {
      const field = Textarea.make('bio').label('Biography').build()

      expect(field.type).toBe('textarea')
      expect(field.name).toBe('bio')
    })
  })

  describe('NumberInput', () => {
    it('should create number input field', () => {
      const field = NumberInput.make('age').label('Age').build()

      expect(field.type).toBe('number')
      expect(field.name).toBe('age')
    })

    it('should set min/max/step', () => {
      const field = NumberInput.make('age').min(18).max(100).step(1).build()

      expect(field.min).toBe(18)
      expect(field.max).toBe(100)
      expect(field.step).toBe(1)
    })

    it('should set readonly', () => {
      const field = NumberInput.make('id').readonly(true).build()

      expect(field.readonly).toBe(true)
    })

    it('should chain methods', () => {
      const field = NumberInput.make('quantity')
        .label('Quantity')
        .required()
        .min(1)
        .max(10)
        .default(1)
        .build()

      expect(field.label).toBe('Quantity')
      expect(field.required).toBe(true)
      expect(field.min).toBe(1)
      expect(field.max).toBe(10)
      expect(field.default).toBe(1)
    })
  })

  describe('Select', () => {
    it('should create select field', () => {
      const field = Select.make('role').label('Role').build()

      expect(field.type).toBe('select')
      expect(field.name).toBe('role')
    })

    it('should set options', () => {
      const field = Select.make('role')
        .options([
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
        ])
        .build()

      expect(field.options).toHaveLength(2)
    })

    it('should set searchable', () => {
      const field = Select.make('country').searchable().build()

      expect(field.searchable).toBe(true)
    })

    it('should set clearable', () => {
      const field = Select.make('category').clearable().build()

      expect(field.clearable).toBe(true)
    })

    it('should set multiple', () => {
      const field = Select.make('tags').multiple().build()

      expect(field.multiple).toBe(true)
      expect(field.type).toBe('multiselect')
    })

    it('should accept function for options', () => {
      const field = Select.make('role')
        .options(async () => [
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ])
        .build()

      expect(typeof field.options).toBe('function')
    })

    it('should set readonly', () => {
      const field = Select.make('status').readonly(true).build()

      expect(field.readonly).toBe(true)
    })

    it('should chain methods', () => {
      const field = Select.make('country')
        .label('Country')
        .required()
        .searchable()
        .clearable()
        .options([
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
        ])
        .build()

      expect(field.label).toBe('Country')
      expect(field.required).toBe(true)
      expect(field.searchable).toBe(true)
      expect(field.clearable).toBe(true)
    })
  })

  describe('Checkbox', () => {
    it('should create checkbox field', () => {
      const field = Checkbox.make('terms', 'I agree to terms').build()

      expect(field.type).toBe('checkbox')
      expect(field.name).toBe('terms')
      expect(field.label).toBe('I agree to terms')
    })

    it('should set description', () => {
      const field = Checkbox.make('newsletter', 'Subscribe to newsletter')
        .description('Receive weekly updates')
        .build()

      expect(field.description).toBe('Receive weekly updates')
    })

    it('should set required', () => {
      const field = Checkbox.make('terms', 'Accept terms').required().build()

      expect(field.required).toBe(true)
    })

    it('should set readonly', () => {
      const field = Checkbox.make('terms', 'Accept terms').readonly(true).build()

      expect(field.readonly).toBe(true)
    })

    it('should chain methods', () => {
      const field = Checkbox.make('notifications', 'Enable notifications')
        .description('Get email notifications')
        .default(true)
        .build()

      expect(field.description).toBe('Get email notifications')
      expect(field.default).toBe(true)
    })
  })

  describe('Switch', () => {
    it('should create switch field', () => {
      const field = Switch.make('darkMode', 'Dark Mode').build()

      expect(field.type).toBe('switch')
      expect(field.name).toBe('darkMode')
      expect(field.label).toBe('Dark Mode')
    })

    it('should inherit checkbox builder methods', () => {
      const field = Switch.make('enabled', 'Enabled')
        .description('Toggle to enable')
        .default(false)
        .build()

      expect(field.description).toBe('Toggle to enable')
      expect(field.default).toBe(false)
    })
  })

  describe('Builder Pattern', () => {
    it('should support method chaining', () => {
      const field = TextInput.make('email')
        .label('Email Address')
        .placeholder('you@example.com')
        .required()
        .helperText('We will never share your email')
        .columnSpan(2)
        .build()

      expect(field.label).toBe('Email Address')
      expect(field.placeholder).toBe('you@example.com')
      expect(field.required).toBe(true)
      expect(field.helperText).toBe('We will never share your email')
      expect(field.columnSpan).toBe(2)
    })

    it('should maintain immutability', () => {
      const builder = TextInput.make('username')
      const field1 = builder.label('Username').build()
      const field2 = builder.label('User Name').build()

      expect(field1.label).toBe('User Name')
      expect(field2.label).toBe('User Name')
    })
  })

  describe('Radio', () => {
    it('should create radio field', () => {
      const field = Radio.make('status')
        .label('Status')
        .options([
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ])
        .build()

      expect(field.type).toBe('radio')
      expect(field.name).toBe('status')
      expect(field.label).toBe('Status')
      expect(field.options).toHaveLength(2)
    })

    it('should set inline layout', () => {
      const field = Radio.make('status')
        .options([
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ])
        .inline()
        .build()

      expect(field.inline).toBe(true)
    })

    it('should set required', () => {
      const field = Radio.make('status')
        .options([{ label: 'Option 1', value: '1' }])
        .required()
        .build()

      expect(field.required).toBe(true)
    })

    it('should set disabled', () => {
      const field = Radio.make('status')
        .options([{ label: 'Option 1', value: '1' }])
        .disabled(true)
        .build()

      expect(field.disabled).toBe(true)
    })

    it('should set conditional disabled', () => {
      const condition = (values: Record<string, unknown>) => values.locked === true
      const field = Radio.make('status')
        .options([{ label: 'Option 1', value: '1' }])
        .disabled(condition)
        .build()

      expect(field.disabled).toBe(condition)
    })

    it('should set readonly', () => {
      const field = Radio.make('status')
        .options([{ label: 'Option 1', value: '1' }])
        .readonly(true)
        .build()

      expect(field.readonly).toBe(true)
    })

    it('should set helper text', () => {
      const field = Radio.make('status')
        .options([{ label: 'Option 1', value: '1' }])
        .helperText('Select one option')
        .build()

      expect(field.helperText).toBe('Select one option')
    })

    it('should set default value', () => {
      const field = Radio.make('status')
        .options([
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ])
        .default('active')
        .build()

      expect(field.default).toBe('active')
    })

    it('should throw error if name is missing', () => {
      const builder = Radio.make('')
        .options([{ label: 'Option 1', value: '1' }])

      expect(() => builder.build()).toThrow('Field name is required')
    })

    it('should throw error if options are empty', () => {
      const builder = Radio.make('status')

      expect(() => builder.build()).toThrow('Radio field must have at least one option')
    })

    it('should throw error if options array is empty', () => {
      const builder = Radio.make('status').options([])

      expect(() => builder.build()).toThrow('Radio field must have at least one option')
    })
  })
})
