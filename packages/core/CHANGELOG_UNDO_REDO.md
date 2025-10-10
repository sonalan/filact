# Undo/Redo Action History System

## Overview

This PR implements a comprehensive undo/redo action history management system using the `useUndoRedo` hook. The system allows users to execute actions that can be undone and redone, with full support for async operations, configurable history limits, and lifecycle callbacks.

## Features Implemented

### Core Functionality
- **Action Execution**: Execute actions with automatic history tracking
- **Undo/Redo**: Navigate through action history with undo and redo operations
- **Action History**: Maintain a stack of executed actions with current position tracking
- **Async Support**: Full support for async execute and undo functions
- **History Limits**: Configurable maximum history size with automatic trimming

### State Management
- **Action Queue**: Actions are stored in a sequential history array
- **Position Tracking**: Current position in history is tracked for undo/redo navigation
- **Redo Clearing**: Executing a new action clears any redo history
- **Concurrent Prevention**: Built-in locking prevents concurrent action execution

### Callbacks
- **onExecute**: Called when an action is executed
- **onUndo**: Called when an action is undone
- **onRedo**: Called when an action is redone

## API Reference

### `useUndoRedo<TData>(options)`

Hook for managing undo/redo action history.

**Options:**
- `maxHistorySize?: number` - Maximum number of actions to store (default: 50)
- `onExecute?: (action: UndoableAction) => void` - Execute callback
- `onUndo?: (action: UndoableAction) => void` - Undo callback
- `onRedo?: (action: UndoableAction) => void` - Redo callback

**Returns:**
- `execute: (action: UndoableAction<TData>) => Promise<void>` - Execute an action
- `undo: () => Promise<void>` - Undo the last action
- `redo: () => Promise<void>` - Redo the next action
- `clear: () => void` - Clear all history
- `getUndoAction: () => UndoableAction<TData> | null` - Get the action that would be undone
- `getRedoAction: () => UndoableAction<TData> | null` - Get the action that would be redone
- `canUndo: boolean` - Whether undo is available
- `canRedo: boolean` - Whether redo is available
- `history: UndoableAction<TData>[]` - Full action history
- `historySize: number` - Current history size
- `historyPosition: number` - Current position in history (1-based)

### `UndoableAction<TData>`

Interface for defining undoable actions.

**Properties:**
- `id: string` - Unique action identifier
- `description: string` - Human-readable description
- `execute: () => void | Promise<void>` - Function to execute the action
- `undo: () => void | Promise<void>` - Function to undo the action
- `data?: TData` - Optional action data
- `timestamp?: number` - Auto-generated execution timestamp

## Usage Examples

### Basic Usage

```typescript
import { useUndoRedo, type UndoableAction } from '@filact/core'

function MyComponent() {
  const { execute, undo, redo, canUndo, canRedo } = useUndoRedo()

  const handleAction = async () => {
    const action: UndoableAction = {
      id: '1',
      description: 'Update value',
      execute: async () => {
        // Perform action
        await updateValue(newValue)
      },
      undo: async () => {
        // Revert action
        await updateValue(oldValue)
      },
    }

    await execute(action)
  }

  return (
    <div>
      <button onClick={handleAction}>Do Action</button>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </div>
  )
}
```

### With Action Data

```typescript
interface MoveData {
  from: { x: number; y: number }
  to: { x: number; y: number }
}

const { execute } = useUndoRedo<MoveData>()

const moveObject = async (to: { x: number; y: number }) => {
  const action: UndoableAction<MoveData> = {
    id: crypto.randomUUID(),
    description: 'Move object',
    data: { from: currentPosition, to },
    execute: async () => {
      await setPosition(to)
    },
    undo: async () => {
      await setPosition(currentPosition)
    },
  }

  await execute(action)
}
```

### With Callbacks

```typescript
const { execute } = useUndoRedo({
  maxHistorySize: 100,
  onExecute: (action) => {
    console.log('Executed:', action.description)
    showNotification(`${action.description} completed`)
  },
  onUndo: (action) => {
    console.log('Undid:', action.description)
    showNotification(`Undid ${action.description}`)
  },
  onRedo: (action) => {
    console.log('Redid:', action.description)
    showNotification(`Redid ${action.description}`)
  },
})
```

### Text Editor Example

```typescript
function TextEditor() {
  const [text, setText] = useState('')
  const { execute, undo, redo, canUndo, canRedo, getUndoAction } = useUndoRedo()

  const handleChange = (newText: string) => {
    const oldText = text

    const action: UndoableAction = {
      id: crypto.randomUUID(),
      description: 'Edit text',
      execute: () => setText(newText),
      undo: () => setText(oldText),
    }

    execute(action)
  }

  const undoAction = getUndoAction()

  return (
    <div>
      <textarea value={text} onChange={(e) => handleChange(e.target.value)} />
      <div>
        <button onClick={undo} disabled={!canUndo}>
          Undo {undoAction ? `(${undoAction.description})` : ''}
        </button>
        <button onClick={redo} disabled={!canRedo}>
          Redo
        </button>
      </div>
    </div>
  )
}
```

## Test Coverage

**21 comprehensive tests** covering:

- ✅ Basic action execution and history tracking
- ✅ Undo/redo operations
- ✅ Multiple actions handling
- ✅ Redo history clearing on new action
- ✅ History size limits and trimming
- ✅ Clear all history
- ✅ Get undo/redo actions
- ✅ Async execute and undo functions
- ✅ Action data support
- ✅ Timestamp generation
- ✅ Concurrent execution prevention
- ✅ Boundary conditions (undo/redo at limits)
- ✅ Lifecycle callbacks (onExecute, onUndo, onRedo)

## Technical Implementation

### Refs for State Consistency
The hook uses refs (`historyRef`, `currentIndexRef`) to maintain consistent access to the current state in callbacks, preventing stale closure issues.

### Concurrent Execution Prevention
An `isExecutingRef` flag prevents multiple actions from executing simultaneously, ensuring history integrity.

### History Management
- Actions are added to history array
- Current index tracks position for undo/redo
- New actions clear redo history (actions after current index)
- History is automatically trimmed when it exceeds `maxHistorySize`

### Timestamps
Each action automatically receives a `timestamp` property when executed, useful for debugging and analytics.

## Files Changed

- `packages/core/src/notifications/useUndoRedo.ts` - Hook implementation
- `packages/core/src/notifications/useUndoRedo.test.ts` - Test suite (21 tests)

## Breaking Changes

None - This is a new feature addition.

## Future Enhancements

Potential future improvements:
- Action grouping/batching
- Action serialization for persistence
- Action replay functionality
- History branching
- Undo/redo keyboard shortcuts hook
- Integration with notification actions
