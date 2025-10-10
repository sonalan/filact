/**
 * Modal Stack Manager
 * Manages z-index and focus for nested modals
 */

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'

export interface ModalStackItem {
  id: string
  level: number
  parentId?: string
}

export interface ModalStackContextValue {
  /** Register a modal in the stack */
  push: (id: string, parentId?: string) => number

  /** Remove a modal from the stack */
  pop: (id: string) => void

  /** Get z-index for a modal */
  getZIndex: (id: string) => number

  /** Check if modal is the top-most */
  isTop: (id: string) => boolean

  /** Get current stack */
  stack: ModalStackItem[]
}

const ModalStackContext = createContext<ModalStackContextValue | null>(null)

const BASE_Z_INDEX = 50
const Z_INDEX_INCREMENT = 10

export interface ModalStackProviderProps {
  children: ReactNode
  baseZIndex?: number
}

/**
 * Modal Stack Provider
 * Provides modal stack management for nested modals
 */
export function ModalStackProvider({
  children,
  baseZIndex = BASE_Z_INDEX,
}: ModalStackProviderProps) {
  const [stack, setStack] = useState<ModalStackItem[]>([])
  const zIndexRef = useRef<number>(baseZIndex)

  const push = useCallback(
    (id: string, parentId?: string): number => {
      setStack((prev) => {
        let level = 0

        if (parentId) {
          const parent = prev.find((item) => item.id === parentId)
          if (parent) {
            level = parent.level + 1
          }
        } else {
          // Find the highest level in stack
          level = prev.length > 0 ? Math.max(...prev.map((item) => item.level)) + 1 : 0
        }

        const newItem: ModalStackItem = { id, level, parentId }
        zIndexRef.current = baseZIndex + level * Z_INDEX_INCREMENT

        return [...prev, newItem]
      })

      return zIndexRef.current
    },
    [baseZIndex]
  )

  const pop = useCallback((id: string) => {
    setStack((prev) => {
      // Remove the modal and all its children
      const removeIds = new Set<string>()
      const findChildren = (parentId: string) => {
        removeIds.add(parentId)
        prev.forEach((item) => {
          if (item.parentId === parentId) {
            findChildren(item.id)
          }
        })
      }

      findChildren(id)
      return prev.filter((item) => !removeIds.has(item.id))
    })
  }, [])

  const getZIndex = useCallback(
    (id: string): number => {
      const item = stack.find((modal) => modal.id === id)
      if (!item) {
        return baseZIndex
      }
      return baseZIndex + item.level * Z_INDEX_INCREMENT
    },
    [stack, baseZIndex]
  )

  const isTop = useCallback(
    (id: string): boolean => {
      if (stack.length === 0) {
        return false
      }
      const item = stack.find((modal) => modal.id === id)
      if (!item) {
        return false
      }
      const maxLevel = Math.max(...stack.map((modal) => modal.level))
      return item.level === maxLevel
    },
    [stack]
  )

  return (
    <ModalStackContext.Provider value={{ push, pop, getZIndex, isTop, stack }}>
      {children}
    </ModalStackContext.Provider>
  )
}

/**
 * Hook to access modal stack
 */
export function useModalStack(): ModalStackContextValue {
  const context = useContext(ModalStackContext)

  if (!context) {
    throw new Error('useModalStack must be used within ModalStackProvider')
  }

  return context
}

/**
 * Hook to register a modal in the stack
 */
export function useModalRegistration(
  modalId: string,
  parentId?: string,
  enabled: boolean = true
): number {
  const { push, pop, getZIndex } = useModalStack()
  const [zIndex, setZIndex] = useState<number>(BASE_Z_INDEX)

  // Register modal on mount
  if (enabled) {
    const z = push(modalId, parentId)
    setZIndex(z)
  }

  // Unregister on unmount
  if (!enabled) {
    pop(modalId)
  }

  return zIndex
}
