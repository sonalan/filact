import { describe, it, expect } from 'vitest'
import type {
  BaseColumnConfig,
  TextColumnConfig,
  NumberColumnConfig,
  DateColumnConfig,
  BooleanColumnConfig,
  BadgeColumnConfig,
  ImageColumnConfig,
  TableSchema,
  Filter,
  Sort,
  PaginationConfig,
} from './table'
import type { BaseModel } from './resource'

describe('Table Types', () => {
  interface User extends BaseModel {
    name: string
    email: string
    role: string
    status: string
    createdAt: Date
  }

  describe('BaseColumnConfig', () => {
    it('should accept complete column config', () => {
      const column: BaseColumnConfig<User> = {
        accessor: 'name',
        label: 'Name',
        align: 'left',
        width: 200,
        sortable: true,
        searchable: true,
        visible: true,
        hideable: false,
      }

      expect(column.accessor).toBe('name')
      expect(column.sortable).toBe(true)
    })
  })

  describe('TextColumnConfig', () => {
    it('should accept text column', () => {
      const column: TextColumnConfig<User> = {
        type: 'text',
        accessor: 'email',
        label: 'Email',
        copyable: true,
        truncate: true,
        maxLength: 30,
      }

      expect(column.type).toBe('text')
      expect(column.copyable).toBe(true)
    })

    it('should accept transform function', () => {
      const column: TextColumnConfig<User> = {
        type: 'text',
        accessor: 'name',
        transform: (value, record) => value.toUpperCase(),
      }

      expect(typeof column.transform).toBe('function')
    })
  })

  describe('NumberColumnConfig', () => {
    it('should accept number column', () => {
      const column: NumberColumnConfig<User> = {
        type: 'number',
        accessor: 'id',
        format: 'number',
        decimals: 0,
      }

      expect(column.type).toBe('number')
      expect(column.format).toBe('number')
    })

    it('should accept currency column', () => {
      const column: NumberColumnConfig<User> = {
        type: 'number',
        accessor: 'id',
        format: 'currency',
        currency: 'USD',
        locale: 'en-US',
      }

      expect(column.format).toBe('currency')
      expect(column.currency).toBe('USD')
    })

    it('should accept percentage column', () => {
      const column: NumberColumnConfig<User> = {
        type: 'number',
        accessor: 'id',
        format: 'percentage',
        decimals: 2,
      }

      expect(column.format).toBe('percentage')
    })
  })

  describe('DateColumnConfig', () => {
    it('should accept date column', () => {
      const column: DateColumnConfig<User> = {
        type: 'date',
        accessor: 'createdAt',
        format: 'YYYY-MM-DD',
        relative: false,
      }

      expect(column.type).toBe('date')
      expect(column.format).toBe('YYYY-MM-DD')
    })

    it('should accept datetime column with timezone', () => {
      const column: DateColumnConfig<User> = {
        type: 'datetime',
        accessor: 'createdAt',
        timezone: 'America/New_York',
        relative: true,
      }

      expect(column.relative).toBe(true)
    })
  })

  describe('BooleanColumnConfig', () => {
    it('should accept boolean column', () => {
      const column: BooleanColumnConfig<User> = {
        type: 'boolean',
        accessor: 'id',
        trueLabel: 'Yes',
        falseLabel: 'No',
        showLabel: true,
      }

      expect(column.type).toBe('boolean')
      expect(column.trueLabel).toBe('Yes')
    })
  })

  describe('BadgeColumnConfig', () => {
    it('should accept badge column with colors', () => {
      const column: BadgeColumnConfig<User> = {
        type: 'badge',
        accessor: 'status',
        colors: {
          active: 'green',
          inactive: 'gray',
          pending: 'yellow',
        },
        variant: 'default',
      }

      expect(column.type).toBe('badge')
      expect(column.colors?.active).toBe('green')
    })
  })

  describe('ImageColumnConfig', () => {
    it('should accept image column', () => {
      const column: ImageColumnConfig<User> = {
        type: 'image',
        accessor: 'id',
        size: 40,
        rounded: true,
        preview: true,
      }

      expect(column.type).toBe('image')
      expect(column.rounded).toBe(true)
    })
  })

  describe('Filter', () => {
    it('should accept text filter', () => {
      const filter: Filter = {
        name: 'search',
        label: 'Search',
        type: 'text',
      }

      expect(filter.type).toBe('text')
    })

    it('should accept select filter with options', () => {
      const filter: Filter = {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ],
        default: 'user',
      }

      expect(filter.options).toHaveLength(2)
    })

    it('should accept multiselect filter', () => {
      const filter: Filter = {
        name: 'tags',
        label: 'Tags',
        type: 'multiselect',
        options: [
          { value: 1, label: 'Tag 1' },
          { value: 2, label: 'Tag 2' },
        ],
        multiple: true,
      }

      expect(filter.multiple).toBe(true)
    })

    it('should accept date range filter', () => {
      const filter: Filter = {
        name: 'dateRange',
        label: 'Date Range',
        type: 'daterange',
      }

      expect(filter.type).toBe('daterange')
    })
  })

  describe('Sort', () => {
    it('should accept sort configuration', () => {
      const sort: Sort<User> = {
        field: 'createdAt',
        direction: 'desc',
      }

      expect(sort.field).toBe('createdAt')
      expect(sort.direction).toBe('desc')
    })

    it('should accept asc direction', () => {
      const sort: Sort<User> = {
        field: 'name',
        direction: 'asc',
      }

      expect(sort.direction).toBe('asc')
    })
  })

  describe('PaginationConfig', () => {
    it('should accept offset pagination', () => {
      const config: PaginationConfig = {
        type: 'offset',
        pageSizeOptions: [10, 25, 50, 100],
        defaultPageSize: 25,
        showPageSize: true,
        showPageInfo: true,
      }

      expect(config.type).toBe('offset')
      expect(config.defaultPageSize).toBe(25)
    })

    it('should accept cursor pagination', () => {
      const config: PaginationConfig = {
        type: 'cursor',
        defaultPageSize: 50,
      }

      expect(config.type).toBe('cursor')
    })
  })

  describe('TableSchema', () => {
    it('should accept complete table schema', () => {
      const schema: TableSchema<User> = {
        columns: [
          {
            type: 'text',
            accessor: 'name',
            label: 'Name',
            sortable: true,
            searchable: true,
          },
          {
            type: 'text',
            accessor: 'email',
            label: 'Email',
            copyable: true,
          },
          {
            type: 'badge',
            accessor: 'role',
            label: 'Role',
            colors: {
              admin: 'red',
              user: 'blue',
            },
          },
        ],
        filters: [
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'user', label: 'User' },
            ],
          },
        ],
        defaultSort: {
          field: 'createdAt',
          direction: 'desc',
        },
        pagination: {
          type: 'offset',
          defaultPageSize: 25,
        },
        selectable: true,
        searchable: true,
        searchPlaceholder: 'Search users...',
      }

      expect(schema.columns).toHaveLength(3)
      expect(schema.selectable).toBe(true)
      expect(schema.pagination?.type).toBe('offset')
    })
  })
})
