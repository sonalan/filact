import { describe, it, expect, vi } from 'vitest'
import { ButtonAction, ActionGroup, ActionSeparator } from './builders'

describe('Nested Action Groups', () => {
  describe('Single level nesting', () => {
    it('should create action group with nested group', () => {
      const onClick = vi.fn()

      const nestedGroup = ActionGroup.make('nested', 'Nested Actions')
        .actions([
          ButtonAction.make('action1', 'Action 1', onClick).build(),
          ButtonAction.make('action2', 'Action 2', onClick).build(),
        ])
        .build()

      const parentGroup = ActionGroup.make('parent', 'Parent Actions')
        .actions([
          ButtonAction.make('top-action', 'Top Action', onClick).build(),
          nestedGroup,
        ])
        .build()

      expect(parentGroup.id).toBe('parent')
      expect(parentGroup.actions).toHaveLength(2)
      expect(parentGroup.actions[1]).toBe(nestedGroup)
    })

    it('should preserve nested group properties', () => {
      const onClick = vi.fn()

      const nestedGroup = ActionGroup.make('nested', 'Nested Actions')
        .icon('<NestedIcon />')
        .actions([ButtonAction.make('action1', 'Action 1', onClick).build()])
        .visible(true)
        .build()

      const parentGroup = ActionGroup.make('parent', 'Parent')
        .actions([nestedGroup])
        .build()

      const nested = parentGroup.actions[0] as any
      expect(nested.id).toBe('nested')
      expect(nested.label).toBe('Nested Actions')
      expect(nested.icon).toBe('<NestedIcon />')
      expect(nested.visible).toBe(true)
    })
  })

  describe('Multiple levels of nesting', () => {
    it('should support 3 levels of nesting', () => {
      const onClick = vi.fn()

      const level3 = ActionGroup.make('level3', 'Level 3')
        .actions([
          ButtonAction.make('deep-action', 'Deep Action', onClick).build(),
        ])
        .build()

      const level2 = ActionGroup.make('level2', 'Level 2')
        .actions([
          ButtonAction.make('mid-action', 'Mid Action', onClick).build(),
          level3,
        ])
        .build()

      const level1 = ActionGroup.make('level1', 'Level 1')
        .actions([
          ButtonAction.make('top-action', 'Top Action', onClick).build(),
          level2,
        ])
        .build()

      expect(level1.actions).toHaveLength(2)
      expect((level1.actions[1] as any).actions).toHaveLength(2)
      expect(((level1.actions[1] as any).actions[1] as any).actions).toHaveLength(1)
    })

    it('should maintain type safety across nested levels', () => {
      const onClick = vi.fn()

      const deepGroup = ActionGroup.make('deep', 'Deep')
        .actions([ButtonAction.make('action', 'Action', onClick).build()])
        .build()

      const midGroup = ActionGroup.make('mid', 'Mid')
        .actions([deepGroup])
        .build()

      const topGroup = ActionGroup.make('top', 'Top')
        .actions([midGroup])
        .build()

      expect(topGroup.id).toBe('top')
      expect((topGroup.actions[0] as any).id).toBe('mid')
      expect(((topGroup.actions[0] as any).actions[0] as any).id).toBe('deep')
    })
  })

  describe('Mixed content in nested groups', () => {
    it('should support actions, groups, and separators together', () => {
      const onClick = vi.fn()

      const nestedGroup = ActionGroup.make('nested', 'Nested')
        .actions([
          ButtonAction.make('nested-action', 'Nested Action', onClick).build(),
        ])
        .build()

      const parentGroup = ActionGroup.make('parent', 'Parent')
        .actions([
          ButtonAction.make('action1', 'Action 1', onClick).build(),
          ActionSeparator.make('sep1').build(),
          nestedGroup,
          ActionSeparator.make('sep2').build(),
          ButtonAction.make('action2', 'Action 2', onClick).build(),
        ])
        .build()

      expect(parentGroup.actions).toHaveLength(5)
      expect(parentGroup.actions[0]).toHaveProperty('type', 'button')
      expect(parentGroup.actions[1]).toHaveProperty('type', 'separator')
      expect(parentGroup.actions[2]).toHaveProperty('id', 'nested')
      expect(parentGroup.actions[3]).toHaveProperty('type', 'separator')
      expect(parentGroup.actions[4]).toHaveProperty('type', 'button')
    })

    it('should support multiple nested groups at same level', () => {
      const onClick = vi.fn()

      const group1 = ActionGroup.make('group1', 'Group 1')
        .actions([ButtonAction.make('a1', 'A1', onClick).build()])
        .build()

      const group2 = ActionGroup.make('group2', 'Group 2')
        .actions([ButtonAction.make('a2', 'A2', onClick).build()])
        .build()

      const parent = ActionGroup.make('parent', 'Parent')
        .actions([
          group1,
          ActionSeparator.make('sep').build(),
          group2,
        ])
        .build()

      expect(parent.actions).toHaveLength(3)
      expect((parent.actions[0] as any).id).toBe('group1')
      expect((parent.actions[2] as any).id).toBe('group2')
    })
  })

  describe('Conditional visibility in nested groups', () => {
    it('should support visible condition on nested groups', () => {
      const onClick = vi.fn()
      const visibleFn = vi.fn().mockReturnValue(true)

      const nestedGroup = ActionGroup.make('nested', 'Nested')
        .actions([ButtonAction.make('action', 'Action', onClick).build()])
        .visible(visibleFn)
        .build()

      const parentGroup = ActionGroup.make('parent', 'Parent')
        .actions([nestedGroup])
        .build()

      const nested = parentGroup.actions[0] as any
      expect(nested.visible).toBe(visibleFn)
    })

    it('should support static visibility on nested groups', () => {
      const onClick = vi.fn()

      const hiddenGroup = ActionGroup.make('hidden', 'Hidden')
        .actions([ButtonAction.make('action', 'Action', onClick).build()])
        .visible(false)
        .build()

      const visibleGroup = ActionGroup.make('visible', 'Visible')
        .actions([ButtonAction.make('action', 'Action', onClick).build()])
        .visible(true)
        .build()

      const parent = ActionGroup.make('parent', 'Parent')
        .actions([hiddenGroup, visibleGroup])
        .build()

      expect((parent.actions[0] as any).visible).toBe(false)
      expect((parent.actions[1] as any).visible).toBe(true)
    })
  })

  describe('Complex nested structures', () => {
    it('should handle complex real-world scenario', () => {
      const onClick = vi.fn()

      // File operations submenu
      const fileOps = ActionGroup.make('file-ops', 'File Operations')
        .icon('<FileIcon />')
        .actions([
          ButtonAction.make('download', 'Download', onClick).build(),
          ButtonAction.make('upload', 'Upload', onClick).build(),
          ActionSeparator.make('file-sep').build(),
          ActionGroup.make('export', 'Export As')
            .actions([
              ButtonAction.make('export-pdf', 'PDF', onClick).build(),
              ButtonAction.make('export-csv', 'CSV', onClick).build(),
              ButtonAction.make('export-json', 'JSON', onClick).build(),
            ])
            .build(),
        ])
        .build()

      // Edit operations submenu
      const editOps = ActionGroup.make('edit-ops', 'Edit Operations')
        .icon('<EditIcon />')
        .actions([
          ButtonAction.make('copy', 'Copy', onClick).build(),
          ButtonAction.make('paste', 'Paste', onClick).build(),
          ButtonAction.make('duplicate', 'Duplicate', onClick).build(),
        ])
        .build()

      // Main menu
      const mainMenu = ActionGroup.make('main', 'Actions')
        .actions([
          ButtonAction.make('view', 'View', onClick).build(),
          ActionSeparator.make('main-sep-1').build(),
          fileOps,
          editOps,
          ActionSeparator.make('main-sep-2').build(),
          ButtonAction.make('delete', 'Delete', onClick)
            .variant('destructive')
            .build(),
        ])
        .build()

      expect(mainMenu.actions).toHaveLength(6)

      // Verify file operations group
      const fileGroup = mainMenu.actions[2] as any
      expect(fileGroup.id).toBe('file-ops')
      expect(fileGroup.actions).toHaveLength(4)

      // Verify nested export group
      const exportGroup = fileGroup.actions[3] as any
      expect(exportGroup.id).toBe('export')
      expect(exportGroup.actions).toHaveLength(3)
    })

    it('should validate that groups must have actions', () => {
      expect(() => {
        ActionGroup.make('empty', 'Empty Group')
          .actions([])
          .build()
      }).toThrow('Action group must have at least one action')
    })
  })
})
