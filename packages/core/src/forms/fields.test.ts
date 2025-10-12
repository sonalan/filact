import { describe, it, expect } from 'vitest'
import { z } from 'zod'
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
  DatePicker,
  DateRangePicker,
  ColorPicker,
  FileUpload,
  ImageUpload,
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

  describe('Validation', () => {
    it('should set validation schema on TextInput', () => {
      const schema = z.string().min(3).max(20)
      const field = TextInput.make('username').validate(schema).build()

      expect(field.validation).toBe(schema)
    })

    it('should set validation schema on NumberInput', () => {
      const schema = z.number().min(0).max(100)
      const field = NumberInput.make('age').validate(schema).build()

      expect(field.validation).toBe(schema)
    })

    it('should set validation schema on Select', () => {
      const schema = z.string().min(1)
      const field = Select.make('role')
        .options([
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ])
        .validate(schema)
        .build()

      expect(field.validation).toBe(schema)
    })

    it('should set validation schema on Checkbox', () => {
      const schema = z.boolean().refine((val) => val === true)
      const field = Checkbox.make('terms', 'Accept Terms').validate(schema).build()

      expect(field.validation).toBe(schema)
    })

    it('should set validation schema on Radio', () => {
      const schema = z.string().min(1)
      const field = Radio.make('size')
        .options([
          { value: 's', label: 'Small' },
          { value: 'm', label: 'Medium' },
        ])
        .validate(schema)
        .build()

      expect(field.validation).toBe(schema)
    })

    it('should support async validation with Zod', () => {
      const asyncSchema = z.string().refine(
        async (val) => {
          // Simulate API call
          return val !== 'taken'
        },
        { message: 'Username is already taken' }
      )

      const field = TextInput.make('username').validate(asyncSchema).build()

      expect(field.validation).toBe(asyncSchema)
    })

    it('should chain validate with other methods', () => {
      const schema = z.string().email()
      const field = EmailInput.make('email')
        .label('Email Address')
        .required()
        .validate(schema)
        .placeholder('you@example.com')
        .build()

      expect(field.validation).toBe(schema)
      expect(field.label).toBe('Email Address')
      expect(field.required).toBe(true)
      expect(field.placeholder).toBe('you@example.com')
    })
  })

  describe('DatePicker', () => {
    it('should create date picker field', () => {
      const field = DatePicker.make('birthdate').label('Birth Date').build()

      expect(field.type).toBe('date')
      expect(field.name).toBe('birthdate')
      expect(field.label).toBe('Birth Date')
    })

    it('should set placeholder', () => {
      const field = DatePicker.make('birthdate')
        .placeholder('Select date')
        .build()

      expect(field.placeholder).toBe('Select date')
    })

    it('should set required', () => {
      const field = DatePicker.make('birthdate').required().build()

      expect(field.required).toBe(true)
    })

    it('should set min and max dates', () => {
      const minDate = new Date('2000-01-01')
      const maxDate = new Date('2024-12-31')
      const field = DatePicker.make('birthdate')
        .minDate(minDate)
        .maxDate(maxDate)
        .build()

      expect(field.minDate).toBe(minDate)
      expect(field.maxDate).toBe(maxDate)
    })

    it('should set date format', () => {
      const field = DatePicker.make('birthdate')
        .format('YYYY-MM-DD')
        .build()

      expect(field.format).toBe('YYYY-MM-DD')
    })

    it('should enable time picker', () => {
      const field = DatePicker.make('appointment').showTime().build()

      expect(field.showTime).toBe(true)
      expect(field.type).toBe('datetime')
    })

    it('should set timezone', () => {
      const field = DatePicker.make('event')
        .timeZone('America/New_York')
        .build()

      expect(field.timeZone).toBe('America/New_York')
    })

    it('should set disabled', () => {
      const field = DatePicker.make('birthdate').disabled(true).build()

      expect(field.disabled).toBe(true)
    })

    it('should set conditional disabled', () => {
      const condition = (values: Record<string, unknown>) => values.locked === true
      const field = DatePicker.make('birthdate').disabled(condition).build()

      expect(field.disabled).toBe(condition)
    })

    it('should set readonly', () => {
      const field = DatePicker.make('birthdate').readonly(true).build()

      expect(field.readonly).toBe(true)
    })

    it('should set visible', () => {
      const field = DatePicker.make('birthdate').visible(true).build()

      expect(field.visible).toBe(true)
    })

    it('should set helper text', () => {
      const field = DatePicker.make('birthdate')
        .helperText('Select your date of birth')
        .build()

      expect(field.helperText).toBe('Select your date of birth')
    })

    it('should set default value', () => {
      const defaultDate = new Date('2000-01-01')
      const field = DatePicker.make('birthdate').default(defaultDate).build()

      expect(field.default).toBe(defaultDate)
    })

    it('should set column span', () => {
      const field = DatePicker.make('birthdate').columnSpan(2).build()

      expect(field.columnSpan).toBe(2)
    })

    it('should set validation schema', () => {
      const schema = z.date().min(new Date('1900-01-01'))
      const field = DatePicker.make('birthdate').validate(schema).build()

      expect(field.validation).toBe(schema)
    })

    it('should throw error if name is missing', () => {
      const builder = DatePicker.make('')

      expect(() => builder.build()).toThrow('Field name is required')
    })

    it('should chain multiple methods', () => {
      const minDate = new Date('2000-01-01')
      const field = DatePicker.make('birthdate')
        .label('Birth Date')
        .required()
        .minDate(minDate)
        .format('MM/DD/YYYY')
        .helperText('Enter your birth date')
        .build()

      expect(field.label).toBe('Birth Date')
      expect(field.required).toBe(true)
      expect(field.minDate).toBe(minDate)
      expect(field.format).toBe('MM/DD/YYYY')
      expect(field.helperText).toBe('Enter your birth date')
    })
  })

  describe('DateRangePicker', () => {
    it('should create date range picker field', () => {
      const field = DateRangePicker.make('dateRange')
        .label('Date Range')
        .build()

      expect(field.type).toBe('daterange')
      expect(field.name).toBe('dateRange')
      expect(field.label).toBe('Date Range')
    })

    it('should set min and max dates', () => {
      const minDate = new Date('2024-01-01')
      const maxDate = new Date('2024-12-31')
      const field = DateRangePicker.make('dateRange')
        .minDate(minDate)
        .maxDate(maxDate)
        .build()

      expect(field.minDate).toBe(minDate)
      expect(field.maxDate).toBe(maxDate)
    })

    it('should set required', () => {
      const field = DateRangePicker.make('dateRange').required().build()

      expect(field.required).toBe(true)
    })

    it('should set format', () => {
      const field = DateRangePicker.make('dateRange')
        .format('YYYY-MM-DD')
        .build()

      expect(field.format).toBe('YYYY-MM-DD')
    })

    it('should set placeholder', () => {
      const field = DateRangePicker.make('dateRange')
        .placeholder('Select date range')
        .build()

      expect(field.placeholder).toBe('Select date range')
    })

    it('should throw error if name is missing', () => {
      const builder = DateRangePicker.make('')

      expect(() => builder.build()).toThrow('Field name is required')
    })
  })

  describe('ColorPicker', () => {
    it('should create color picker field', () => {
      const field = ColorPicker.make('color').label('Color').build()

      expect(field.type).toBe('color')
      expect(field.name).toBe('color')
      expect(field.label).toBe('Color')
    })

    it('should set placeholder', () => {
      const field = ColorPicker.make('color')
        .placeholder('Choose a color')
        .build()

      expect(field.placeholder).toBe('Choose a color')
    })

    it('should set required', () => {
      const field = ColorPicker.make('color').required().build()

      expect(field.required).toBe(true)
    })

    it('should set disabled', () => {
      const field = ColorPicker.make('color').disabled(true).build()

      expect(field.disabled).toBe(true)
    })

    it('should set conditional disabled', () => {
      const condition = (values: Record<string, unknown>) => values.locked === true
      const field = ColorPicker.make('color').disabled(condition).build()

      expect(field.disabled).toBe(condition)
    })

    it('should set readonly', () => {
      const field = ColorPicker.make('color').readonly(true).build()

      expect(field.readonly).toBe(true)
    })

    it('should set visible', () => {
      const field = ColorPicker.make('color').visible(true).build()

      expect(field.visible).toBe(true)
    })

    it('should set helper text', () => {
      const field = ColorPicker.make('color')
        .helperText('Choose your favorite color')
        .build()

      expect(field.helperText).toBe('Choose your favorite color')
    })

    it('should set default value', () => {
      const field = ColorPicker.make('color').default('#ff0000').build()

      expect(field.default).toBe('#ff0000')
    })

    it('should set column span', () => {
      const field = ColorPicker.make('color').columnSpan(2).build()

      expect(field.columnSpan).toBe(2)
    })

    it('should set validation schema', () => {
      const schema = z.string().regex(/^#[0-9A-Fa-f]{6}$/)
      const field = ColorPicker.make('color').validate(schema).build()

      expect(field.validation).toBe(schema)
    })

    it('should throw error if name is missing', () => {
      const builder = ColorPicker.make('')

      expect(() => builder.build()).toThrow('Field name is required')
    })

    it('should chain multiple methods', () => {
      const field = ColorPicker.make('color')
        .label('Theme Color')
        .required()
        .default('#3b82f6')
        .helperText('Select a theme color')
        .build()

      expect(field.label).toBe('Theme Color')
      expect(field.required).toBe(true)
      expect(field.default).toBe('#3b82f6')
      expect(field.helperText).toBe('Select a theme color')
    })
  })

  describe('FileUpload', () => {
    it('should create file upload field', () => {
      const field = FileUpload.make('document').label('Document').build()

      expect(field.type).toBe('file')
      expect(field.name).toBe('document')
      expect(field.label).toBe('Document')
    })

    it('should set placeholder', () => {
      const field = FileUpload.make('document')
        .placeholder('Upload file')
        .build()

      expect(field.placeholder).toBe('Upload file')
    })

    it('should set required', () => {
      const field = FileUpload.make('document').required().build()

      expect(field.required).toBe(true)
    })

    it('should set accepted file types', () => {
      const field = FileUpload.make('document')
        .accept(['.pdf', '.doc', '.docx'])
        .build()

      expect(field.accept).toEqual(['.pdf', '.doc', '.docx'])
    })

    it('should set max file size', () => {
      const field = FileUpload.make('document')
        .maxSize(5 * 1024 * 1024) // 5MB
        .build()

      expect(field.maxSize).toBe(5 * 1024 * 1024)
    })

    it('should enable multiple files', () => {
      const field = FileUpload.make('documents').multiple().build()

      expect(field.multiple).toBe(true)
    })

    it('should set max files limit', () => {
      const field = FileUpload.make('documents')
        .multiple()
        .maxFiles(5)
        .build()

      expect(field.maxFiles).toBe(5)
    })

    it('should enable preview', () => {
      const field = FileUpload.make('document').preview().build()

      expect(field.preview).toBe(true)
    })

    it('should set upload endpoint', () => {
      const field = FileUpload.make('document')
        .uploadEndpoint('/api/upload')
        .build()

      expect(field.uploadEndpoint).toBe('/api/upload')
    })

    it('should set disabled', () => {
      const field = FileUpload.make('document').disabled(true).build()

      expect(field.disabled).toBe(true)
    })

    it('should set conditional disabled', () => {
      const condition = (values: Record<string, unknown>) => values.locked === true
      const field = FileUpload.make('document').disabled(condition).build()

      expect(field.disabled).toBe(condition)
    })

    it('should set readonly', () => {
      const field = FileUpload.make('document').readonly(true).build()

      expect(field.readonly).toBe(true)
    })

    it('should set visible', () => {
      const field = FileUpload.make('document').visible(true).build()

      expect(field.visible).toBe(true)
    })

    it('should set helper text', () => {
      const field = FileUpload.make('document')
        .helperText('Upload your document')
        .build()

      expect(field.helperText).toBe('Upload your document')
    })

    it('should set default value', () => {
      const field = FileUpload.make('document').default(null).build()

      expect(field.default).toBe(null)
    })

    it('should set column span', () => {
      const field = FileUpload.make('document').columnSpan(2).build()

      expect(field.columnSpan).toBe(2)
    })

    it('should set validation schema', () => {
      const schema = z.instanceof(File)
      const field = FileUpload.make('document').validate(schema).build()

      expect(field.validation).toBe(schema)
    })

    it('should throw error if name is missing', () => {
      const builder = FileUpload.make('')

      expect(() => builder.build()).toThrow('Field name is required')
    })

    it('should chain multiple methods', () => {
      const field = FileUpload.make('document')
        .label('Upload Document')
        .required()
        .accept(['.pdf'])
        .maxSize(10 * 1024 * 1024)
        .preview()
        .helperText('Maximum file size: 10MB')
        .build()

      expect(field.label).toBe('Upload Document')
      expect(field.required).toBe(true)
      expect(field.accept).toEqual(['.pdf'])
      expect(field.maxSize).toBe(10 * 1024 * 1024)
      expect(field.preview).toBe(true)
      expect(field.helperText).toBe('Maximum file size: 10MB')
    })
  })

  describe('ImageUpload', () => {
    it('should create image upload field', () => {
      const field = ImageUpload.make('avatar').label('Avatar').build()

      expect(field.type).toBe('image')
      expect(field.name).toBe('avatar')
      expect(field.label).toBe('Avatar')
    })

    it('should default to image mime types', () => {
      const field = ImageUpload.make('avatar').build()

      expect(field.accept).toEqual(['image/*'])
    })

    it('should enable preview by default', () => {
      const field = ImageUpload.make('avatar').build()

      expect(field.preview).toBe(true)
    })

    it('should set required', () => {
      const field = ImageUpload.make('avatar').required().build()

      expect(field.required).toBe(true)
    })

    it('should set max file size', () => {
      const field = ImageUpload.make('avatar')
        .maxSize(2 * 1024 * 1024) // 2MB
        .build()

      expect(field.maxSize).toBe(2 * 1024 * 1024)
    })

    it('should enable multiple images', () => {
      const field = ImageUpload.make('gallery').multiple().build()

      expect(field.multiple).toBe(true)
    })

    it('should set max images limit', () => {
      const field = ImageUpload.make('gallery')
        .multiple()
        .maxFiles(10)
        .build()

      expect(field.maxFiles).toBe(10)
    })

    it('should set upload endpoint', () => {
      const field = ImageUpload.make('avatar')
        .uploadEndpoint('/api/upload/image')
        .build()

      expect(field.uploadEndpoint).toBe('/api/upload/image')
    })

    it('should throw error if name is missing', () => {
      const builder = ImageUpload.make('')

      expect(() => builder.build()).toThrow('Field name is required')
    })

    it('should chain multiple methods', () => {
      const field = ImageUpload.make('avatar')
        .label('Profile Picture')
        .required()
        .maxSize(5 * 1024 * 1024)
        .helperText('Upload a profile picture')
        .build()

      expect(field.label).toBe('Profile Picture')
      expect(field.required).toBe(true)
      expect(field.maxSize).toBe(5 * 1024 * 1024)
      expect(field.helperText).toBe('Upload a profile picture')
    })
  })
})
