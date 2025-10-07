import { describe, it, expect } from 'vitest'
import {
  TextColumn,
  NumberColumn,
  DateColumn,
  DateTimeColumn,
  BooleanColumn,
  BadgeColumn,
  IconColumn,
  ImageColumn,
  ColorColumn,
  CustomColumn,
} from './columns'

describe('Column Builders', () => {
  describe('TextColumn', () => {
    it('should create text column', () => {
      const column = TextColumn.make('name').label('Name').build()

      expect(column.type).toBe('text')
      expect(column.accessor).toBe('name')
      expect(column.label).toBe('Name')
    })

    it('should set truncate', () => {
      const column = TextColumn.make('description').truncate().build()

      expect(column.truncate).toBe(true)
    })

    it('should set max length', () => {
      const column = TextColumn.make('description').maxLength(100).build()

      expect(column.maxLength).toBe(100)
    })

    it('should set copyable', () => {
      const column = TextColumn.make('id').copyable().build()

      expect(column.copyable).toBe(true)
    })

    it('should set prefix and suffix', () => {
      const column = TextColumn.make('username').prefix('@').suffix('.com').build()

      expect(column.prefix).toBe('@')
      expect(column.suffix).toBe('.com')
    })

    it('should set transform function', () => {
      const transform = (value: string) => value.toUpperCase()
      const column = TextColumn.make('code').transform(transform).build()

      expect(column.transform).toBe(transform)
    })

    it('should set sortable', () => {
      const column = TextColumn.make('name').sortable().build()

      expect(column.sortable).toBe(true)
    })

    it('should set searchable', () => {
      const column = TextColumn.make('email').searchable().build()

      expect(column.searchable).toBe(true)
    })

    it('should set alignment', () => {
      const column = TextColumn.make('name').align('center').build()

      expect(column.align).toBe('center')
    })

    it('should set width', () => {
      const column = TextColumn.make('id').width(100).build()

      expect(column.width).toBe(100)
    })

    it('should chain methods', () => {
      const column = TextColumn.make('description')
        .label('Description')
        .truncate()
        .maxLength(200)
        .sortable()
        .searchable()
        .align('left')
        .width('300px')
        .build()

      expect(column.label).toBe('Description')
      expect(column.truncate).toBe(true)
      expect(column.maxLength).toBe(200)
      expect(column.sortable).toBe(true)
      expect(column.searchable).toBe(true)
      expect(column.align).toBe('left')
      expect(column.width).toBe('300px')
    })
  })

  describe('NumberColumn', () => {
    it('should create number column', () => {
      const column = NumberColumn.make('age').label('Age').build()

      expect(column.type).toBe('number')
      expect(column.accessor).toBe('age')
      expect(column.label).toBe('Age')
    })

    it('should set format', () => {
      const column = NumberColumn.make('price').format('currency').build()

      expect(column.format).toBe('currency')
    })

    it('should set decimals', () => {
      const column = NumberColumn.make('price').decimals(2).build()

      expect(column.decimals).toBe(2)
    })

    it('should set currency', () => {
      const column = NumberColumn.make('price').currency('USD').build()

      expect(column.currency).toBe('USD')
    })

    it('should set locale', () => {
      const column = NumberColumn.make('price').locale('en-US').build()

      expect(column.locale).toBe('en-US')
    })

    it('should set prefix and suffix', () => {
      const column = NumberColumn.make('discount').prefix('$').suffix(' off').build()

      expect(column.prefix).toBe('$')
      expect(column.suffix).toBe(' off')
    })

    it('should chain methods', () => {
      const column = NumberColumn.make('price')
        .label('Price')
        .format('currency')
        .decimals(2)
        .currency('USD')
        .locale('en-US')
        .sortable()
        .align('right')
        .build()

      expect(column.label).toBe('Price')
      expect(column.format).toBe('currency')
      expect(column.decimals).toBe(2)
      expect(column.currency).toBe('USD')
      expect(column.locale).toBe('en-US')
      expect(column.sortable).toBe(true)
      expect(column.align).toBe('right')
    })
  })

  describe('DateColumn', () => {
    it('should create date column', () => {
      const column = DateColumn.make('birthdate').label('Birth Date').build()

      expect(column.type).toBe('date')
      expect(column.accessor).toBe('birthdate')
      expect(column.label).toBe('Birth Date')
    })

    it('should set format', () => {
      const column = DateColumn.make('createdAt').format('MM/DD/YYYY').build()

      expect(column.format).toBe('MM/DD/YYYY')
    })

    it('should set relative', () => {
      const column = DateColumn.make('lastSeen').relative().build()

      expect(column.relative).toBe(true)
    })

    it('should set timezone', () => {
      const column = DateColumn.make('timestamp').timezone('America/New_York').build()

      expect(column.timezone).toBe('America/New_York')
    })

    it('should chain methods', () => {
      const column = DateColumn.make('createdAt')
        .label('Created')
        .format('YYYY-MM-DD')
        .sortable()
        .align('center')
        .build()

      expect(column.label).toBe('Created')
      expect(column.format).toBe('YYYY-MM-DD')
      expect(column.sortable).toBe(true)
      expect(column.align).toBe('center')
    })
  })

  describe('DateTimeColumn', () => {
    it('should create datetime column', () => {
      const column = DateTimeColumn.make('createdAt').label('Created At').build()

      expect(column.type).toBe('datetime')
      expect(column.accessor).toBe('createdAt')
      expect(column.label).toBe('Created At')
    })
  })

  describe('BooleanColumn', () => {
    it('should create boolean column', () => {
      const column = BooleanColumn.make('active').label('Active').build()

      expect(column.type).toBe('boolean')
      expect(column.accessor).toBe('active')
      expect(column.label).toBe('Active')
    })

    it('should set true and false labels', () => {
      const column = BooleanColumn.make('active').trueLabel('Yes').falseLabel('No').build()

      expect(column.trueLabel).toBe('Yes')
      expect(column.falseLabel).toBe('No')
    })

    it('should set show label', () => {
      const column = BooleanColumn.make('verified').showLabel(false).build()

      expect(column.showLabel).toBe(false)
    })

    it('should chain methods', () => {
      const column = BooleanColumn.make('active')
        .label('Active')
        .trueLabel('Active')
        .falseLabel('Inactive')
        .showLabel(true)
        .sortable()
        .build()

      expect(column.label).toBe('Active')
      expect(column.trueLabel).toBe('Active')
      expect(column.falseLabel).toBe('Inactive')
      expect(column.showLabel).toBe(true)
      expect(column.sortable).toBe(true)
    })
  })

  describe('BadgeColumn', () => {
    it('should create badge column', () => {
      const column = BadgeColumn.make('status').label('Status').build()

      expect(column.type).toBe('badge')
      expect(column.accessor).toBe('status')
      expect(column.label).toBe('Status')
    })

    it('should set colors', () => {
      const colors = {
        active: 'green',
        inactive: 'red',
      }
      const column = BadgeColumn.make('status').colors(colors).build()

      expect(column.colors).toEqual(colors)
    })

    it('should set variant', () => {
      const column = BadgeColumn.make('status').variant('outline').build()

      expect(column.variant).toBe('outline')
    })

    it('should chain methods', () => {
      const column = BadgeColumn.make('status')
        .label('Status')
        .colors({
          active: 'green',
          pending: 'yellow',
          inactive: 'gray',
        })
        .variant('default')
        .sortable()
        .build()

      expect(column.label).toBe('Status')
      expect(column.colors).toBeDefined()
      expect(column.variant).toBe('default')
      expect(column.sortable).toBe(true)
    })
  })

  describe('IconColumn', () => {
    it('should create icon column', () => {
      const icons = {
        success: '<CheckIcon />',
        error: '<XIcon />',
      }
      const column = IconColumn.make('result', icons).label('Result').build()

      expect(column.type).toBe('icon')
      expect(column.accessor).toBe('result')
      expect(column.label).toBe('Result')
      expect(column.icons).toEqual(icons)
    })

    it('should set size', () => {
      const column = IconColumn.make('icon', {}).size(24).build()

      expect(column.size).toBe(24)
    })

    it('should set tooltip', () => {
      const column = IconColumn.make('icon', {}).tooltip().build()

      expect(column.tooltip).toBe(true)
    })
  })

  describe('ImageColumn', () => {
    it('should create image column', () => {
      const column = ImageColumn.make('avatar').label('Avatar').build()

      expect(column.type).toBe('image')
      expect(column.accessor).toBe('avatar')
      expect(column.label).toBe('Avatar')
    })

    it('should set size', () => {
      const column = ImageColumn.make('thumbnail').size(50).build()

      expect(column.size).toBe(50)
    })

    it('should set rounded', () => {
      const column = ImageColumn.make('avatar').rounded().build()

      expect(column.rounded).toBe(true)
    })

    it('should set fallback', () => {
      const column = ImageColumn.make('photo').fallback('No image').build()

      expect(column.fallback).toBe('No image')
    })

    it('should set preview', () => {
      const column = ImageColumn.make('photo').preview().build()

      expect(column.preview).toBe(true)
    })

    it('should chain methods', () => {
      const column = ImageColumn.make('avatar')
        .label('Avatar')
        .size(40)
        .rounded()
        .fallback('N/A')
        .preview(false)
        .build()

      expect(column.label).toBe('Avatar')
      expect(column.size).toBe(40)
      expect(column.rounded).toBe(true)
      expect(column.fallback).toBe('N/A')
      expect(column.preview).toBe(false)
    })
  })

  describe('ColorColumn', () => {
    it('should create color column', () => {
      const column = ColorColumn.make('themeColor').label('Theme').build()

      expect(column.type).toBe('color')
      expect(column.accessor).toBe('themeColor')
      expect(column.label).toBe('Theme')
    })

    it('should set show label', () => {
      const column = ColorColumn.make('color').showLabel(false).build()

      expect(column.showLabel).toBe(false)
    })
  })

  describe('CustomColumn', () => {
    it('should create custom column', () => {
      const render = (record: any) => `Custom: ${record.name}`
      const column = CustomColumn.make('custom', render).label('Custom').build()

      expect(column.type).toBe('custom')
      expect(column.accessor).toBe('custom')
      expect(column.label).toBe('Custom')
      expect(column.render).toBe(render)
    })
  })

  describe('Base Column Properties', () => {
    it('should set visible', () => {
      const column = TextColumn.make('name').visible(false).build()

      expect(column.visible).toBe(false)
    })

    it('should set hideable', () => {
      const column = TextColumn.make('email').hideable().build()

      expect(column.hideable).toBe(true)
    })

    it('should set className', () => {
      const column = TextColumn.make('name').className('font-bold').build()

      expect(column.className).toBe('font-bold')
    })

    it('should set headerClassName', () => {
      const column = TextColumn.make('name').headerClassName('text-gray-700').build()

      expect(column.headerClassName).toBe('text-gray-700')
    })
  })
})
