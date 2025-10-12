import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useClickOutside } from './useClickOutside'

describe('useClickOutside', () => {
  it('should call handler when clicking outside', () => {
    const handler = vi.fn()

    function TestComponent() {
      const ref = useClickOutside<HTMLDivElement>(handler)
      return (
        <div>
          <div ref={ref} data-testid="inside">
            Inside
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    fireEvent.mouseDown(getByTestId('outside'))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should not call handler when clicking inside', () => {
    const handler = vi.fn()

    function TestComponent() {
      const ref = useClickOutside<HTMLDivElement>(handler)
      return (
        <div>
          <div ref={ref} data-testid="inside">
            Inside
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    fireEvent.mouseDown(getByTestId('inside'))

    expect(handler).not.toHaveBeenCalled()
  })

  it('should call handler on touch events', () => {
    const handler = vi.fn()

    function TestComponent() {
      const ref = useClickOutside<HTMLDivElement>(handler)
      return (
        <div>
          <div ref={ref} data-testid="inside">
            Inside
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    fireEvent.touchStart(getByTestId('outside'))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should not call handler when disabled', () => {
    const handler = vi.fn()

    function TestComponent() {
      const ref = useClickOutside<HTMLDivElement>(handler, false)
      return (
        <div>
          <div ref={ref} data-testid="inside">
            Inside
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    fireEvent.mouseDown(getByTestId('outside'))

    expect(handler).not.toHaveBeenCalled()
  })

  it('should work with nested elements', () => {
    const handler = vi.fn()

    function TestComponent() {
      const ref = useClickOutside<HTMLDivElement>(handler)
      return (
        <div>
          <div ref={ref} data-testid="container">
            <div data-testid="nested">Nested</div>
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    // Click on nested element (inside)
    fireEvent.mouseDown(getByTestId('nested'))
    expect(handler).not.toHaveBeenCalled()

    // Click outside
    fireEvent.mouseDown(getByTestId('outside'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should update handler without causing re-renders', () => {
    let handlerCallCount = 0
    const handler1 = vi.fn(() => {
      handlerCallCount = 1
    })
    const handler2 = vi.fn(() => {
      handlerCallCount = 2
    })

    function TestComponent({ handler }: { handler: () => void }) {
      const ref = useClickOutside<HTMLDivElement>(handler)
      return (
        <div>
          <div ref={ref} data-testid="inside">
            Inside
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId, rerender } = render(<TestComponent handler={handler1} />)

    fireEvent.mouseDown(getByTestId('outside'))
    expect(handlerCallCount).toBe(1)

    // Change handler
    rerender(<TestComponent handler={handler2} />)

    fireEvent.mouseDown(getByTestId('outside'))
    expect(handlerCallCount).toBe(2)
  })

  it('should handle multiple instances', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    function TestComponent() {
      const ref1 = useClickOutside<HTMLDivElement>(handler1)
      const ref2 = useClickOutside<HTMLDivElement>(handler2)
      return (
        <div>
          <div ref={ref1} data-testid="box1">
            Box 1
          </div>
          <div ref={ref2} data-testid="box2">
            Box 2
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    // Click on box1 - handler2 should be called (outside of box2)
    fireEvent.mouseDown(getByTestId('box1'))
    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalledTimes(1)

    // Click on box2 - handler1 should be called (outside of box1)
    fireEvent.mouseDown(getByTestId('box2'))
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1) // Still 1

    // Click outside both
    fireEvent.mouseDown(getByTestId('outside'))
    expect(handler1).toHaveBeenCalledTimes(2)
    expect(handler2).toHaveBeenCalledTimes(2)
  })

  it('should cleanup event listeners on unmount', () => {
    const handler = vi.fn()
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    function TestComponent() {
      const ref = useClickOutside<HTMLDivElement>(handler)
      return (
        <div ref={ref} data-testid="inside">
          Inside
        </div>
      )
    }

    const { unmount } = render(<TestComponent />)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), true)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), true)
  })

  it('should handle enabled state changes', () => {
    const handler = vi.fn()

    function TestComponent({ enabled }: { enabled: boolean }) {
      const ref = useClickOutside<HTMLDivElement>(handler, enabled)
      return (
        <div>
          <div ref={ref} data-testid="inside">
            Inside
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId, rerender } = render(<TestComponent enabled={true} />)

    // Should work when enabled
    fireEvent.mouseDown(getByTestId('outside'))
    expect(handler).toHaveBeenCalledTimes(1)

    // Disable
    rerender(<TestComponent enabled={false} />)

    fireEvent.mouseDown(getByTestId('outside'))
    expect(handler).toHaveBeenCalledTimes(1) // Should not increase

    // Re-enable
    rerender(<TestComponent enabled={true} />)

    fireEvent.mouseDown(getByTestId('outside'))
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('should work with different element types', () => {
    const handler = vi.fn()

    function TestComponent() {
      const buttonRef = useClickOutside<HTMLButtonElement>(handler)
      return (
        <div>
          <button ref={buttonRef} data-testid="button">
            Button
          </button>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    fireEvent.mouseDown(getByTestId('button'))
    expect(handler).not.toHaveBeenCalled()

    fireEvent.mouseDown(getByTestId('outside'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should receive event object in handler', () => {
    let receivedEvent: MouseEvent | TouchEvent | null = null
    const handler = vi.fn((event) => {
      receivedEvent = event
    })

    function TestComponent() {
      const ref = useClickOutside<HTMLDivElement>(handler)
      return (
        <div>
          <div ref={ref} data-testid="inside">
            Inside
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    fireEvent.mouseDown(getByTestId('outside'))

    expect(handler).toHaveBeenCalledTimes(1)
    expect(receivedEvent).toBeTruthy()
    expect(receivedEvent).toBeInstanceOf(MouseEvent)
  })

  it('should handle rapid clicks', () => {
    const handler = vi.fn()

    function TestComponent() {
      const ref = useClickOutside<HTMLDivElement>(handler)
      return (
        <div>
          <div ref={ref} data-testid="inside">
            Inside
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    const outside = getByTestId('outside')

    fireEvent.mouseDown(outside)
    fireEvent.mouseDown(outside)
    fireEvent.mouseDown(outside)
    fireEvent.mouseDown(outside)

    expect(handler).toHaveBeenCalledTimes(4)
  })

  it('should work in practical dropdown example', () => {
    let isOpen = true
    const setIsOpen = vi.fn((value: boolean) => {
      isOpen = value
    })

    function TestComponent() {
      const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false))
      return (
        <div>
          <div ref={ref} data-testid="dropdown">
            {isOpen && <div data-testid="menu">Dropdown Menu</div>}
          </div>
          <div data-testid="outside">Outside</div>
        </div>
      )
    }

    const { getByTestId } = render(<TestComponent />)

    expect(isOpen).toBe(true)

    fireEvent.mouseDown(getByTestId('outside'))

    expect(setIsOpen).toHaveBeenCalledWith(false)
  })
})
