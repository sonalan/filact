import { describe, it, expect } from 'vitest'
import { TableBuilder, createTableBuilder } from './builder'
import { TextColumn, NumberColumn, BadgeColumn } from './columns'
import { TextFilter, SelectFilter } from './filters'

describe('TableBuilder', () => {
  it('should create a table builder instance', () => {
    const builder = new TableBuilder()
    expect(builder).toBeInstanceOf(TableBuilder)
  })

  it('should create builder with factory function', () => {
    const builder = createTableBuilder()
    expect(builder).toBeInstanceOf(TableBuilder)
  })

  it('should build table with columns', () => {
    const builder = createTableBuilder()
    const schema = builder
      .columns([
        TextColumn.make('name').label('Name').build(),
        TextColumn.make('email').label('Email').build(),
      ])
      .build()

    expect(schema.columns).toHaveLength(2)
    expect(schema.columns[0].accessor).toBe('name')
    expect(schema.columns[1].accessor).toBe('email')
  })

  it('should add filters', () => {
    const builder = createTableBuilder()
    const schema = builder
      .columns([])
      .withFilters([
        TextFilter.make('search').label('Search').build(),
        SelectFilter.make('status')
          .label('Status')
          .options([
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ])
          .build(),
      ])
      .build()

    expect(schema.filters).toHaveLength(2)
    expect(schema.filters?.[0].type).toBe('text')
    expect(schema.filters?.[1].type).toBe('select')
  })

  it('should set default sort', () => {
    const builder = createTableBuilder()
    const schema = builder.columns([]).sort('createdAt', 'desc').build()

    expect(schema.defaultSort).toEqual({
      field: 'createdAt',
      direction: 'desc',
    })
  })

  it('should set default sort direction to asc', () => {
    const builder = createTableBuilder()
    const schema = builder.columns([]).sort('name').build()

    expect(schema.defaultSort).toEqual({
      field: 'name',
      direction: 'asc',
    })
  })

  it('should configure pagination', () => {
    const builder = createTableBuilder()
    const schema = builder
      .columns([])
      .paginate({
        type: 'offset',
        defaultPageSize: 25,
        pageSizeOptions: [25, 50, 100],
        showPageSize: true,
        showPageInfo: true,
      })
      .build()

    expect(schema.pagination?.type).toBe('offset')
    expect(schema.pagination?.defaultPageSize).toBe(25)
    expect(schema.pagination?.pageSizeOptions).toEqual([25, 50, 100])
  })

  it('should configure pagination with defaults', () => {
    const builder = createTableBuilder()
    const schema = builder.columns([]).paginate().build()

    expect(schema.pagination?.type).toBe('offset')
    expect(schema.pagination?.defaultPageSize).toBe(10)
    expect(schema.pagination?.pageSizeOptions).toEqual([10, 25, 50, 100])
  })

  it('should enable row selection', () => {
    const builder = createTableBuilder()
    const schema = builder.columns([]).selectable().build()

    expect(schema.selectable).toBe(true)
  })

  it('should enable table search', () => {
    const builder = createTableBuilder()
    const schema = builder.columns([]).searchable().build()

    expect(schema.searchable).toBe(true)
  })

  it('should set search placeholder', () => {
    const builder = createTableBuilder()
    const schema = builder.columns([]).searchable().searchPlaceholder('Search users...').build()

    expect(schema.searchPlaceholder).toBe('Search users...')
  })

  it('should set empty state', () => {
    const builder = createTableBuilder()
    const schema = builder.columns([]).emptyState('No records found').build()

    expect(schema.emptyState).toBe('No records found')
  })

  it('should set loading state', () => {
    const builder = createTableBuilder()
    const schema = builder.columns([]).loadingState('Loading...').build()

    expect(schema.loadingState).toBe('Loading...')
  })

  it('should chain multiple methods', () => {
    const builder = createTableBuilder()
    const schema = builder
      .columns([
        TextColumn.make('name').label('Name').sortable().build(),
        NumberColumn.make('age').label('Age').sortable().build(),
        BadgeColumn.make('status').label('Status').build(),
      ])
      .withFilters([
        TextFilter.make('search').label('Search').build(),
        SelectFilter.make('status')
          .label('Status')
          .options([
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ])
          .build(),
      ])
      .sort('createdAt', 'desc')
      .paginate({
        defaultPageSize: 20,
        pageSizeOptions: [10, 20, 50],
      })
      .selectable()
      .searchable()
      .searchPlaceholder('Search...')
      .build()

    expect(schema.columns).toHaveLength(3)
    expect(schema.filters).toHaveLength(2)
    expect(schema.defaultSort?.field).toBe('createdAt')
    expect(schema.pagination?.defaultPageSize).toBe(20)
    expect(schema.selectable).toBe(true)
    expect(schema.searchable).toBe(true)
    expect(schema.searchPlaceholder).toBe('Search...')
  })

  it('should add columns to existing column list', () => {
    const builder = createTableBuilder()
    const schema = builder
      .columns([TextColumn.make('name').label('Name').build()])
      .addColumns(
        TextColumn.make('email').label('Email').build(),
        NumberColumn.make('age').label('Age').build()
      )
      .build()

    expect(schema.columns).toHaveLength(3)
    expect(schema.columns[0].accessor).toBe('name')
    expect(schema.columns[1].accessor).toBe('email')
    expect(schema.columns[2].accessor).toBe('age')
  })

  it('should remove column by accessor', () => {
    const builder = createTableBuilder()
    const schema = builder
      .columns([
        TextColumn.make('name').label('Name').build(),
        TextColumn.make('email').label('Email').build(),
        NumberColumn.make('age').label('Age').build(),
      ])
      .removeColumn('email')
      .build()

    expect(schema.columns).toHaveLength(2)
    expect(schema.columns[0].accessor).toBe('name')
    expect(schema.columns[1].accessor).toBe('age')
  })

  it('should get column by accessor', () => {
    const builder = createTableBuilder()
    builder.columns([
      TextColumn.make('name').label('Name').build(),
      TextColumn.make('email').label('Email').build(),
    ])

    const column = builder.getColumn('email')

    expect(column).toBeDefined()
    expect(column?.accessor).toBe('email')
    expect(column?.label).toBe('Email')
  })

  it('should return undefined when getting non-existent column', () => {
    const builder = createTableBuilder()
    builder.columns([TextColumn.make('name').label('Name').build()])

    const column = builder.getColumn('nonexistent')

    expect(column).toBeUndefined()
  })
})
