import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterPresets, type FilterPreset } from './FilterPresets'

const mockPresets: FilterPreset[] = [
  {
    id: '1',
    name: 'Active Users',
    filters: { status: 'active' },
    description: 'Show only active users',
  },
  {
    id: '2',
    name: 'Admins',
    filters: { role: 'admin' },
  },
  {
    id: '3',
    name: 'Default',
    filters: {},
    isDefault: true,
  },
]

describe('FilterPresets', () => {
  it('should render presets list', () => {
    render(
      <FilterPresets
        presets={mockPresets}
        onApplyPreset={vi.fn()}
      />
    )

    expect(screen.getByText('Active Users')).toBeInTheDocument()
    expect(screen.getByText('Admins')).toBeInTheDocument()
    expect(screen.getByText('Default')).toBeInTheDocument()
  })

  it('should display preset descriptions', () => {
    render(
      <FilterPresets
        presets={mockPresets}
        onApplyPreset={vi.fn()}
      />
    )

    expect(screen.getByText('Show only active users')).toBeInTheDocument()
  })

  it('should mark default preset', () => {
    render(
      <FilterPresets
        presets={mockPresets}
        onApplyPreset={vi.fn()}
      />
    )

    expect(screen.getByText('(Default)')).toBeInTheDocument()
  })

  it('should call onApplyPreset when preset clicked', async () => {
    const onApplyPreset = vi.fn()
    const user = userEvent.setup()

    render(
      <FilterPresets
        presets={mockPresets}
        onApplyPreset={onApplyPreset}
      />
    )

    await user.click(screen.getByText('Active Users'))

    expect(onApplyPreset).toHaveBeenCalledWith(mockPresets[0])
  })

  it('should show "Save as preset" button when filters are active', () => {
    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{ status: 'active' }}
        onApplyPreset={vi.fn()}
        onSavePreset={vi.fn()}
      />
    )

    expect(screen.getByText('Save as preset')).toBeInTheDocument()
  })

  it('should not show "Save as preset" button when no active filters', () => {
    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{}}
        onApplyPreset={vi.fn()}
        onSavePreset={vi.fn()}
      />
    )

    expect(screen.queryByText('Save as preset')).not.toBeInTheDocument()
  })

  it('should not show "Save as preset" when showSave is false', () => {
    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{ status: 'active' }}
        onApplyPreset={vi.fn()}
        onSavePreset={vi.fn()}
        showSave={false}
      />
    )

    expect(screen.queryByText('Save as preset')).not.toBeInTheDocument()
  })

  it('should open save dialog when "Save as preset" clicked', async () => {
    const user = userEvent.setup()

    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{ status: 'active' }}
        onApplyPreset={vi.fn()}
        onSavePreset={vi.fn()}
      />
    )

    await user.click(screen.getByText('Save as preset'))

    expect(screen.getByText('Save Filter Preset')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('My Filters')).toBeInTheDocument()
  })

  it('should save preset with name and description', async () => {
    const onSavePreset = vi.fn()
    const user = userEvent.setup()

    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{ status: 'active', role: 'admin' }}
        onApplyPreset={vi.fn()}
        onSavePreset={onSavePreset}
      />
    )

    await user.click(screen.getByText('Save as preset'))
    await user.type(screen.getByPlaceholderText('My Filters'), 'Custom Preset')
    await user.type(
      screen.getByPlaceholderText('Description of this filter preset'),
      'My description'
    )
    await user.click(screen.getByText('Save Preset'))

    expect(onSavePreset).toHaveBeenCalledWith(
      'Custom Preset',
      { status: 'active', role: 'admin' },
      'My description'
    )
  })

  it('should save preset without description', async () => {
    const onSavePreset = vi.fn()
    const user = userEvent.setup()

    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{ status: 'active' }}
        onApplyPreset={vi.fn()}
        onSavePreset={onSavePreset}
      />
    )

    await user.click(screen.getByText('Save as preset'))
    await user.type(screen.getByPlaceholderText('My Filters'), 'No Desc')
    await user.click(screen.getByText('Save Preset'))

    expect(onSavePreset).toHaveBeenCalledWith('No Desc', { status: 'active' }, undefined)
  })

  it('should disable save button when name is empty', async () => {
    const user = userEvent.setup()

    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{ status: 'active' }}
        onApplyPreset={vi.fn()}
        onSavePreset={vi.fn()}
      />
    )

    await user.click(screen.getByText('Save as preset'))

    const saveButton = screen.getByText('Save Preset')
    expect(saveButton).toBeDisabled()
  })

  it('should close dialog when cancel clicked', async () => {
    const user = userEvent.setup()

    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{ status: 'active' }}
        onApplyPreset={vi.fn()}
        onSavePreset={vi.fn()}
      />
    )

    await user.click(screen.getByText('Save as preset'))
    expect(screen.getByText('Save Filter Preset')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Save Filter Preset')).not.toBeInTheDocument()
  })

  it('should show delete button for non-default presets', () => {
    render(
      <FilterPresets
        presets={mockPresets}
        onApplyPreset={vi.fn()}
        onDeletePreset={vi.fn()}
      />
    )

    const deleteButtons = screen.getAllByTitle('Delete preset')
    expect(deleteButtons).toHaveLength(2) // Not for default preset
  })

  it('should not show delete button for default preset', () => {
    render(
      <FilterPresets
        presets={[mockPresets[2]]}
        onApplyPreset={vi.fn()}
        onDeletePreset={vi.fn()}
      />
    )

    expect(screen.queryByTitle('Delete preset')).not.toBeInTheDocument()
  })

  it('should call onDeletePreset when delete clicked', async () => {
    const onDeletePreset = vi.fn()
    const user = userEvent.setup()

    render(
      <FilterPresets
        presets={mockPresets}
        onApplyPreset={vi.fn()}
        onDeletePreset={onDeletePreset}
      />
    )

    const deleteButtons = screen.getAllByTitle('Delete preset')
    await user.click(deleteButtons[0])

    expect(onDeletePreset).toHaveBeenCalledWith('1')
  })

  it('should show update button when filters are active', () => {
    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{ status: 'active' }}
        onApplyPreset={vi.fn()}
        onUpdatePreset={vi.fn()}
      />
    )

    expect(screen.getAllByTitle('Update preset with current filters')).toHaveLength(3)
  })

  it('should call onUpdatePreset when update clicked', async () => {
    const onUpdatePreset = vi.fn()
    const user = userEvent.setup()

    render(
      <FilterPresets
        presets={mockPresets}
        currentFilters={{ status: 'inactive' }}
        onApplyPreset={vi.fn()}
        onUpdatePreset={onUpdatePreset}
      />
    )

    const updateButtons = screen.getAllByTitle('Update preset with current filters')
    await user.click(updateButtons[0])

    expect(onUpdatePreset).toHaveBeenCalledWith('1', { status: 'inactive' })
  })

  it('should show "No saved presets" when empty', () => {
    render(
      <FilterPresets
        presets={[]}
        onApplyPreset={vi.fn()}
      />
    )

    expect(screen.getByText('No saved presets')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <FilterPresets
        presets={mockPresets}
        onApplyPreset={vi.fn()}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })
})
