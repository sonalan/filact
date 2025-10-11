import { describe, it, expect } from 'vitest'
import { Slider, SliderBuilder } from './fields'
import { z } from 'zod'

describe('SliderBuilder', () => {
  describe('Basic Configuration', () => {
    it('should create a basic slider field', () => {
      const field = Slider.make('volume').build()

      expect(field).toEqual({
        type: 'slider',
        name: 'volume',
        min: 0,
        max: 100,
        step: 1,
      })
    })

    it('should set label', () => {
      const field = Slider.make('volume').label('Volume').build()

      expect(field.label).toBe('Volume')
    })

    it('should set min value', () => {
      const field = Slider.make('temperature').min(-10).build()

      expect(field.min).toBe(-10)
    })

    it('should set max value', () => {
      const field = Slider.make('temperature').max(50).build()

      expect(field.max).toBe(50)
    })

    it('should set step value', () => {
      const field = Slider.make('price').step(0.5).build()

      expect(field.step).toBe(0.5)
    })

    it('should set range (min, max, step)', () => {
      const field = Slider.make('score').min(0).max(10).step(0.1).build()

      expect(field.min).toBe(0)
      expect(field.max).toBe(10)
      expect(field.step).toBe(0.1)
    })
  })

  describe('Display Options', () => {
    it('should show value', () => {
      const field = Slider.make('volume').showValue().build()

      expect(field.showValue).toBe(true)
    })

    it('should show value with explicit true', () => {
      const field = Slider.make('volume').showValue(true).build()

      expect(field.showValue).toBe(true)
    })

    it('should hide value', () => {
      const field = Slider.make('volume').showValue(false).build()

      expect(field.showValue).toBe(false)
    })

    it('should show marks', () => {
      const field = Slider.make('rating').showMarks().build()

      expect(field.showMarks).toBe(true)
    })

    it('should set custom marks', () => {
      const marks = [
        { value: 0, label: 'Min' },
        { value: 50, label: 'Mid' },
        { value: 100, label: 'Max' },
      ]

      const field = Slider.make('level').marks(marks).build()

      expect(field.marks).toEqual(marks)
    })

    it('should set marks without labels', () => {
      const marks = [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }]

      const field = Slider.make('percentage').marks(marks).build()

      expect(field.marks).toEqual(marks)
    })

    it('should set prefix', () => {
      const field = Slider.make('price').prefix('$').build()

      expect(field.prefix).toBe('$')
    })

    it('should set suffix', () => {
      const field = Slider.make('temperature').suffix('°C').build()

      expect(field.suffix).toBe('°C')
    })

    it('should set both prefix and suffix', () => {
      const field = Slider.make('discount').prefix('Save ').suffix('%').build()

      expect(field.prefix).toBe('Save ')
      expect(field.suffix).toBe('%')
    })
  })

  describe('Field States', () => {
    it('should set required', () => {
      const field = Slider.make('volume').required().build()

      expect(field.required).toBe(true)
    })

    it('should set required with explicit value', () => {
      const field = Slider.make('volume').required(false).build()

      expect(field.required).toBe(false)
    })

    it('should set disabled', () => {
      const field = Slider.make('volume').disabled(true).build()

      expect(field.disabled).toBe(true)
    })

    it('should set disabled with function', () => {
      const disabledFn = (values: Record<string, unknown>) => values.isAdmin === false
      const field = Slider.make('volume').disabled(disabledFn).build()

      expect(field.disabled).toBe(disabledFn)
    })

    it('should set readonly', () => {
      const field = Slider.make('volume').readonly(true).build()

      expect(field.readonly).toBe(true)
    })

    it('should set readonly with function', () => {
      const readonlyFn = (values: Record<string, unknown>) => values.locked === true
      const field = Slider.make('volume').readonly(readonlyFn).build()

      expect(field.readonly).toBe(readonlyFn)
    })

    it('should set visible', () => {
      const field = Slider.make('volume').visible(false).build()

      expect(field.visible).toBe(false)
    })

    it('should set visible with function', () => {
      const visibleFn = (values: Record<string, unknown>) => values.showAdvanced === true
      const field = Slider.make('volume').visible(visibleFn).build()

      expect(field.visible).toBe(visibleFn)
    })
  })

  describe('Additional Configuration', () => {
    it('should set helper text', () => {
      const field = Slider.make('volume').helperText('Adjust the volume level').build()

      expect(field.helperText).toBe('Adjust the volume level')
    })

    it('should set default value', () => {
      const field = Slider.make('volume').default(50).build()

      expect(field.default).toBe(50)
    })

    it('should set column span', () => {
      const field = Slider.make('volume').columnSpan(2).build()

      expect(field.columnSpan).toBe(2)
    })

    it('should set validation schema', () => {
      const schema = z.number().min(0).max(100)
      const field = Slider.make('volume').validate(schema).build()

      expect(field.validation).toBe(schema)
    })
  })

  describe('Chaining Methods', () => {
    it('should support method chaining', () => {
      const field = Slider.make('brightness')
        .label('Brightness')
        .min(0)
        .max(100)
        .step(5)
        .showValue()
        .showMarks()
        .marks([
          { value: 0, label: 'Off' },
          { value: 50, label: 'Medium' },
          { value: 100, label: 'Full' },
        ])
        .prefix('💡 ')
        .default(75)
        .helperText('Adjust screen brightness')
        .required()
        .build()

      expect(field).toEqual({
        type: 'slider',
        name: 'brightness',
        label: 'Brightness',
        min: 0,
        max: 100,
        step: 5,
        showValue: true,
        showMarks: true,
        marks: [
          { value: 0, label: 'Off' },
          { value: 50, label: 'Medium' },
          { value: 100, label: 'Full' },
        ],
        prefix: '💡 ',
        default: 75,
        helperText: 'Adjust screen brightness',
        required: true,
      })
    })

    it('should create a percentage slider', () => {
      const field = Slider.make('completion')
        .label('Completion')
        .min(0)
        .max(100)
        .step(1)
        .suffix('%')
        .showValue()
        .default(0)
        .build()

      expect(field.min).toBe(0)
      expect(field.max).toBe(100)
      expect(field.suffix).toBe('%')
      expect(field.showValue).toBe(true)
    })

    it('should create a temperature slider', () => {
      const field = Slider.make('temperature')
        .label('Temperature')
        .min(-20)
        .max(40)
        .step(0.5)
        .suffix('°C')
        .showValue()
        .showMarks()
        .marks([
          { value: -20, label: 'Cold' },
          { value: 0, label: 'Zero' },
          { value: 20, label: 'Room' },
          { value: 40, label: 'Hot' },
        ])
        .build()

      expect(field.min).toBe(-20)
      expect(field.max).toBe(40)
      expect(field.step).toBe(0.5)
      expect(field.marks).toHaveLength(4)
    })

    it('should create a price range slider', () => {
      const field = Slider.make('price')
        .label('Max Price')
        .min(0)
        .max(1000)
        .step(10)
        .prefix('$')
        .showValue()
        .default(500)
        .build()

      expect(field.prefix).toBe('$')
      expect(field.max).toBe(1000)
      expect(field.default).toBe(500)
    })
  })

  describe('Error Handling', () => {
    it('should throw error when name is missing', () => {
      const builder = new SliderBuilder('')

      expect(() => builder.build()).toThrow('Field name is required')
    })
  })

  describe('Factory Method', () => {
    it('should create builder via factory', () => {
      const builder = Slider.make('volume')

      expect(builder).toBeInstanceOf(SliderBuilder)
    })

    it('should return builder from factory', () => {
      const field = Slider.make('volume').label('Volume').build()

      expect(field.name).toBe('volume')
      expect(field.label).toBe('Volume')
    })
  })
})
