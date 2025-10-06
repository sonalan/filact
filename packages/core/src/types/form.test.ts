import { describe, it, expect } from 'vitest'
import type {
  BaseFieldConfig,
  TextFieldConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  SelectOption,
  CheckboxFieldConfig,
  DateFieldConfig,
  FileFieldConfig,
  RepeaterFieldConfig,
  FormSchema,
  FormSection,
  FormTab,
  WizardStep,
} from './form'

describe('Form Types', () => {
  describe('BaseFieldConfig', () => {
    it('should accept complete field config', () => {
      const field: BaseFieldConfig = {
        name: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        helperText: 'We will never share your email',
        required: true,
        disabled: false,
        readonly: false,
        visible: true,
        columnSpan: 2,
      }

      expect(field.name).toBe('email')
      expect(field.required).toBe(true)
    })

    it('should accept conditional functions', () => {
      const field: BaseFieldConfig = {
        name: 'confirmEmail',
        disabled: (values) => !values.email,
        visible: (values) => values.showEmail === true,
      }

      expect(typeof field.disabled).toBe('function')
      expect(typeof field.visible).toBe('function')
    })
  })

  describe('TextFieldConfig', () => {
    it('should accept text field configuration', () => {
      const field: TextFieldConfig = {
        type: 'text',
        name: 'username',
        label: 'Username',
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9]+$',
      }

      expect(field.type).toBe('text')
      expect(field.minLength).toBe(3)
    })

    it('should accept email field', () => {
      const field: TextFieldConfig = {
        type: 'email',
        name: 'email',
        autocomplete: 'email',
      }

      expect(field.type).toBe('email')
    })
  })

  describe('NumberFieldConfig', () => {
    it('should accept number field with constraints', () => {
      const field: NumberFieldConfig = {
        type: 'number',
        name: 'age',
        min: 0,
        max: 120,
        step: 1,
      }

      expect(field.type).toBe('number')
      expect(field.max).toBe(120)
    })
  })

  describe('SelectFieldConfig', () => {
    it('should accept static options', () => {
      const options: SelectOption[] = [
        { value: 'red', label: 'Red' },
        { value: 'blue', label: 'Blue' },
        { value: 'green', label: 'Green', disabled: true },
      ]

      const field: SelectFieldConfig = {
        type: 'select',
        name: 'color',
        options,
        searchable: true,
        clearable: true,
      }

      expect(field.options).toHaveLength(3)
    })

    it('should accept dynamic options', () => {
      const field: SelectFieldConfig = {
        type: 'multiselect',
        name: 'tags',
        options: async () => {
          return [
            { value: 1, label: 'Tag 1' },
            { value: 2, label: 'Tag 2' },
          ]
        },
        multiple: true,
      }

      expect(typeof field.options).toBe('function')
    })
  })

  describe('CheckboxFieldConfig', () => {
    it('should accept checkbox field', () => {
      const field: CheckboxFieldConfig = {
        type: 'checkbox',
        name: 'terms',
        label: 'I agree to terms',
        description: 'By checking this box...',
        required: true,
      }

      expect(field.type).toBe('checkbox')
      expect(field.label).toBe('I agree to terms')
    })

    it('should accept switch field', () => {
      const field: CheckboxFieldConfig = {
        type: 'switch',
        name: 'notifications',
        label: 'Enable notifications',
      }

      expect(field.type).toBe('switch')
    })
  })

  describe('DateFieldConfig', () => {
    it('should accept date field', () => {
      const field: DateFieldConfig = {
        type: 'date',
        name: 'birthdate',
        minDate: new Date('1900-01-01'),
        maxDate: new Date(),
        format: 'YYYY-MM-DD',
      }

      expect(field.type).toBe('date')
      expect(field.minDate).toBeInstanceOf(Date)
    })

    it('should accept datetime field', () => {
      const field: DateFieldConfig = {
        type: 'datetime',
        name: 'appointmentAt',
        showTime: true,
        timeZone: 'UTC',
      }

      expect(field.showTime).toBe(true)
    })
  })

  describe('FileFieldConfig', () => {
    it('should accept file upload field', () => {
      const field: FileFieldConfig = {
        type: 'file',
        name: 'document',
        accept: ['application/pdf', 'application/msword'],
        maxSize: 5242880, // 5MB
        multiple: false,
      }

      expect(field.type).toBe('file')
      expect(field.maxSize).toBe(5242880)
    })

    it('should accept image upload field', () => {
      const field: FileFieldConfig = {
        type: 'image',
        name: 'avatar',
        accept: ['image/jpeg', 'image/png'],
        preview: true,
        maxFiles: 1,
      }

      expect(field.preview).toBe(true)
    })
  })

  describe('RepeaterFieldConfig', () => {
    it('should accept repeater field with nested fields', () => {
      const field: RepeaterFieldConfig = {
        type: 'repeater',
        name: 'addresses',
        fields: [
          {
            type: 'text',
            name: 'street',
            label: 'Street',
          },
          {
            type: 'text',
            name: 'city',
            label: 'City',
          },
        ],
        min: 1,
        max: 5,
        collapsible: true,
        orderable: true,
      }

      expect(field.fields).toHaveLength(2)
      expect(field.max).toBe(5)
    })
  })

  describe('FormSchema', () => {
    it('should accept simple form schema', () => {
      const schema: FormSchema = {
        fields: [
          {
            type: 'text',
            name: 'name',
            label: 'Name',
          },
          {
            type: 'email',
            name: 'email',
            label: 'Email',
          },
        ],
        columns: 2,
        submitLabel: 'Save',
      }

      expect(schema.fields).toHaveLength(2)
      expect(schema.columns).toBe(2)
    })

    it('should accept form with sections', () => {
      const sections: FormSection[] = [
        {
          title: 'Personal Information',
          fields: [
            { type: 'text', name: 'firstName', label: 'First Name' },
            { type: 'text', name: 'lastName', label: 'Last Name' },
          ],
          columns: 2,
        },
        {
          title: 'Contact Information',
          fields: [
            { type: 'email', name: 'email', label: 'Email' },
            { type: 'text', name: 'phone', label: 'Phone' },
          ],
          collapsible: true,
        },
      ]

      const schema: FormSchema = {
        fields: [],
        sections,
      }

      expect(schema.sections).toHaveLength(2)
    })

    it('should accept form with tabs', () => {
      const tabs: FormTab[] = [
        {
          id: 'profile',
          label: 'Profile',
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
        },
        {
          id: 'settings',
          label: 'Settings',
          badge: 'New',
          fields: [{ type: 'checkbox', name: 'notifications', label: 'Notifications' }],
        },
      ]

      const schema: FormSchema = {
        fields: [],
        tabs,
      }

      expect(schema.tabs).toHaveLength(2)
    })

    it('should accept wizard form', () => {
      const wizard: WizardStep[] = [
        {
          id: 'step1',
          label: 'Basic Info',
          description: 'Enter basic information',
          fields: [{ type: 'text', name: 'name', label: 'Name' }],
          validate: true,
        },
        {
          id: 'step2',
          label: 'Contact',
          fields: [{ type: 'email', name: 'email', label: 'Email' }],
        },
      ]

      const schema: FormSchema = {
        fields: [],
        wizard,
      }

      expect(schema.wizard).toHaveLength(2)
    })
  })
})
