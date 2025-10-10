import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ModalStackProvider, useModalStack } from './ModalStackManager'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <ModalStackProvider>{children}</ModalStackProvider>
}

describe('ModalStackManager', () => {
  describe('push and pop', () => {
    it('should push modal to stack', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('modal1')
      })

      expect(result.current.stack).toHaveLength(1)
      expect(result.current.stack[0].id).toBe('modal1')
    })

    it('should pop modal from stack', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('modal1')
        result.current.pop('modal1')
      })

      expect(result.current.stack).toHaveLength(0)
    })

    it('should assign incremental levels', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('modal1')
        result.current.push('modal2')
      })

      expect(result.current.stack[0].level).toBe(0)
      expect(result.current.stack[1].level).toBe(1)
    })

    it('should handle parent-child relationship', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('parent')
        result.current.push('child', 'parent')
      })

      expect(result.current.stack[1].parentId).toBe('parent')
      expect(result.current.stack[1].level).toBe(1)
    })

    it('should remove children when parent is popped', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('parent')
        result.current.push('child1', 'parent')
        result.current.push('child2', 'parent')
        result.current.pop('parent')
      })

      expect(result.current.stack).toHaveLength(0)
    })

    it('should remove nested children recursively', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('level1')
        result.current.push('level2', 'level1')
        result.current.push('level3', 'level2')
        result.current.pop('level1')
      })

      expect(result.current.stack).toHaveLength(0)
    })
  })

  describe('getZIndex', () => {
    it('should return base z-index for level 0', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('modal1')
      })

      expect(result.current.getZIndex('modal1')).toBe(50) // BASE_Z_INDEX
    })

    it('should increment z-index for each level', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('modal1')
        result.current.push('modal2')
        result.current.push('modal3')
      })

      expect(result.current.getZIndex('modal1')).toBe(50)
      expect(result.current.getZIndex('modal2')).toBe(60)
      expect(result.current.getZIndex('modal3')).toBe(70)
    })

    it('should return base z-index for unknown modal', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      expect(result.current.getZIndex('unknown')).toBe(50)
    })

    it('should calculate z-index for nested modals', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('parent')
        result.current.push('child', 'parent')
      })

      expect(result.current.getZIndex('child')).toBe(60)
    })
  })

  describe('isTop', () => {
    it('should return true for top-most modal', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('modal1')
        result.current.push('modal2')
      })

      expect(result.current.isTop('modal2')).toBe(true)
      expect(result.current.isTop('modal1')).toBe(false)
    })

    it('should return false when stack is empty', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      expect(result.current.isTop('modal1')).toBe(false)
    })

    it('should return false for unknown modal', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('modal1')
      })

      expect(result.current.isTop('unknown')).toBe(false)
    })

    it('should update when modal is popped', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('modal1')
        result.current.push('modal2')
        result.current.pop('modal2')
      })

      expect(result.current.isTop('modal1')).toBe(true)
    })
  })

  describe('custom baseZIndex', () => {
    it('should use custom base z-index', () => {
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <ModalStackProvider baseZIndex={100}>{children}</ModalStackProvider>
      )

      const { result } = renderHook(() => useModalStack(), {
        wrapper: customWrapper,
      })

      act(() => {
        result.current.push('modal1')
      })

      expect(result.current.getZIndex('modal1')).toBe(100)
    })

    it('should increment from custom base', () => {
      const customWrapper = ({ children }: { children: ReactNode }) => (
        <ModalStackProvider baseZIndex={200}>{children}</ModalStackProvider>
      )

      const { result } = renderHook(() => useModalStack(), {
        wrapper: customWrapper,
      })

      act(() => {
        result.current.push('modal1')
        result.current.push('modal2')
      })

      expect(result.current.getZIndex('modal2')).toBe(210)
    })
  })

  describe('push return value', () => {
    it('should return z-index when pushing', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      let zIndex: number = 0
      act(() => {
        zIndex = result.current.push('modal1')
      })

      expect(zIndex).toBe(50)
    })

    it('should return correct z-index for nested modal', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('parent')
        result.current.push('child', 'parent')
      })

      // Verify the child modal has correct z-index via getZIndex
      expect(result.current.getZIndex('child')).toBe(60)
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple independent modal stacks', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('stack1-modal1') // level 0
        result.current.push('stack1-modal2', 'stack1-modal1') // level 1
        result.current.push('stack2-modal1') // level 2 (independent, finds max level + 1)
      })

      expect(result.current.stack).toHaveLength(3)
      // stack2-modal1 is level 2 since it's independent and gets max level + 1
      expect(result.current.getZIndex('stack2-modal1')).toBe(70)
    })

    it('should maintain correct levels after partial pop', () => {
      const { result } = renderHook(() => useModalStack(), { wrapper })

      act(() => {
        result.current.push('modal1')
        result.current.push('modal2')
        result.current.push('modal3')
        result.current.pop('modal2')
      })

      expect(result.current.stack).toHaveLength(2)
      expect(result.current.isTop('modal3')).toBe(true)
    })
  })
})
