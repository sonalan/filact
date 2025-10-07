import { describe, it, expect } from 'vitest'
import {
  TextFilter,
  SelectFilter,
  DateFilter,
  DateRangeFilter,
  NumberFilter,
  BooleanFilter,
  CustomFilter,
} from './filters'

describe('Filter Builders', () => {
  describe('TextFilter', () => {
    it('should create text filter', () => {
      const filter = TextFilter.make('search').label('Search').build()

      expect(filter.type).toBe('text')
      expect(filter.name).toBe('search')
      expect(filter.label).toBe('Search')
    })

    it('should set default value', () => {
      const filter = TextFilter.make('search').label('Search').default('test').build()

      expect(filter.default).toBe('test')
    })

    it('should use name as label if not set', () => {
      const filter = TextFilter.make('search').build()

      expect(filter.label).toBe('search')
    })
  })

  describe('SelectFilter', () => {
    it('should create select filter', () => {
      const filter = SelectFilter.make('status').label('Status').build()

      expect(filter.type).toBe('select')
      expect(filter.name).toBe('status')
      expect(filter.label).toBe('Status')
    })

    it('should set options', () => {
      const options = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ]
      const filter = SelectFilter.make('status').label('Status').options(options).build()

      expect(filter.options).toEqual(options)
    })

    it('should enable multiple selection', () => {
      const filter = SelectFilter.make('tags').label('Tags').multiple().build()

      expect(filter.multiple).toBe(true)
      expect(filter.type).toBe('multiselect')
    })

    it('should set default value', () => {
      const filter = SelectFilter.make('status').label('Status').default('active').build()

      expect(filter.default).toBe('active')
    })

    it('should chain methods', () => {
      const filter = SelectFilter.make('status')
        .label('Status')
        .options([
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ])
        .default('active')
        .build()

      expect(filter.label).toBe('Status')
      expect(filter.options).toHaveLength(2)
      expect(filter.default).toBe('active')
    })
  })

  describe('DateFilter', () => {
    it('should create date filter', () => {
      const filter = DateFilter.make('createdAt').label('Created Date').build()

      expect(filter.type).toBe('date')
      expect(filter.name).toBe('createdAt')
      expect(filter.label).toBe('Created Date')
    })

    it('should set default value', () => {
      const date = '2024-01-01'
      const filter = DateFilter.make('createdAt').label('Created').default(date).build()

      expect(filter.default).toBe(date)
    })
  })

  describe('DateRangeFilter', () => {
    it('should create date range filter', () => {
      const filter = DateRangeFilter.make('dateRange').label('Date Range').build()

      expect(filter.type).toBe('daterange')
      expect(filter.name).toBe('dateRange')
      expect(filter.label).toBe('Date Range')
    })

    it('should set default value', () => {
      const range = { start: '2024-01-01', end: '2024-12-31' }
      const filter = DateRangeFilter.make('range').label('Range').default(range).build()

      expect(filter.default).toEqual(range)
    })
  })

  describe('NumberFilter', () => {
    it('should create number filter', () => {
      const filter = NumberFilter.make('age').label('Age').build()

      expect(filter.type).toBe('number')
      expect(filter.name).toBe('age')
      expect(filter.label).toBe('Age')
    })

    it('should set default value', () => {
      const filter = NumberFilter.make('age').label('Age').default(18).build()

      expect(filter.default).toBe(18)
    })
  })

  describe('BooleanFilter', () => {
    it('should create boolean filter', () => {
      const filter = BooleanFilter.make('active').label('Active').build()

      expect(filter.type).toBe('boolean')
      expect(filter.name).toBe('active')
      expect(filter.label).toBe('Active')
    })

    it('should set default value', () => {
      const filter = BooleanFilter.make('verified').label('Verified').default(true).build()

      expect(filter.default).toBe(true)
    })
  })

  describe('CustomFilter', () => {
    it('should create custom filter', () => {
      const CustomComponent = ({ value, onChange }: any) => null
      const filter = CustomFilter.make('custom', CustomComponent).label('Custom').build()

      expect(filter.type).toBe('custom')
      expect(filter.name).toBe('custom')
      expect(filter.label).toBe('Custom')
      expect(filter.component).toBe(CustomComponent)
    })
  })
})
