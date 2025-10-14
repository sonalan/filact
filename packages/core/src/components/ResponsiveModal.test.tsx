import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResponsiveModal } from './ResponsiveModal'
import * as useMediaQuery from '../hooks/useMediaQuery'

describe('ResponsiveModal', () => {
  beforeEach(() => {
    // Reset body overflow before each test
    document.body.style.overflow = ''

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.style.overflow = ''
  })

  it('should not render when closed', () => {
    render(
      <ResponsiveModal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </ResponsiveModal>
    )

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('should render when open', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Modal Content</div>
      </ResponsiveModal>
    )

    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('should render title when provided', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </ResponsiveModal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toHaveAttribute('id', 'modal-title')
  })

  it('should render footer when provided', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveModal
        isOpen={true}
        onClose={() => {}}
        footer={<button>Save</button>}
      >
        <div>Content</div>
      </ResponsiveModal>
    )

    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('should be fullscreen on mobile', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </ResponsiveModal>
    )

    const modal = screen.getByTestId('modal')
    expect(modal).toHaveClass('w-full')
    expect(modal).toHaveClass('h-full')
    expect(modal.style.width).toBe('100%')
  })

  it('should be centered on desktop', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </ResponsiveModal>
    )

    const modal = screen.getByTestId('modal')
    expect(modal).toHaveClass('rounded-lg')
    expect(modal).toHaveClass('max-w-2xl')
  })

  it('should call onClose when backdrop is clicked', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)
    const onClose = vi.fn()

    render(
      <ResponsiveModal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </ResponsiveModal>
    )

    // Click the backdrop (the previous sibling of the modal container)
    const backdrop = screen.getByTestId('modal').parentElement?.previousElementSibling
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalled()
    }
  })

  it('should not close on backdrop click when preventBackdropClose is true', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)
    const onClose = vi.fn()

    render(
      <ResponsiveModal isOpen={true} onClose={onClose} preventBackdropClose={true}>
        <div>Content</div>
      </ResponsiveModal>
    )

    const backdrop = screen.getByTestId('modal').parentElement?.previousElementSibling
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(onClose).not.toHaveBeenCalled()
    }
  })

  it('should call onClose when escape key is pressed', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)
    const onClose = vi.fn()

    render(
      <ResponsiveModal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </ResponsiveModal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('should not close on escape when preventEscapeClose is true', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)
    const onClose = vi.fn()

    render(
      <ResponsiveModal isOpen={true} onClose={onClose} preventEscapeClose={true}>
        <div>Content</div>
      </ResponsiveModal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should call onClose when close button is clicked', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)
    const onClose = vi.fn()

    render(
      <ResponsiveModal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </ResponsiveModal>
    )

    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('should prevent body scroll when open', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    const { unmount } = render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </ResponsiveModal>
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('should restore body scroll when closed', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    const { rerender } = render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </ResponsiveModal>
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <ResponsiveModal isOpen={false} onClose={() => {}}>
        <div>Content</div>
      </ResponsiveModal>
    )

    expect(document.body.style.overflow).toBe('')
  })

  it('should apply custom className', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}} className="custom-modal">
        <div>Content</div>
      </ResponsiveModal>
    )

    const modal = screen.getByTestId('modal')
    expect(modal).toHaveClass('custom-modal')
  })

  it('should have proper ARIA attributes', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </ResponsiveModal>
    )

    const modalContainer = screen.getByTestId('modal').parentElement
    expect(modalContainer).toHaveAttribute('role', 'dialog')
    expect(modalContainer).toHaveAttribute('aria-modal', 'true')
    expect(modalContainer).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('should have touch-friendly close button (44px minimum)', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}} title="Test">
        <div>Content</div>
      </ResponsiveModal>
    )

    const closeButton = screen.getByLabelText('Close modal')
    expect(closeButton).toHaveStyle({ minWidth: '44px', minHeight: '44px' })
  })

  it('should cleanup event listeners on unmount', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </ResponsiveModal>
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('should not close on content click', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)
    const onClose = vi.fn()

    render(
      <ResponsiveModal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </ResponsiveModal>
    )

    const modal = screen.getByTestId('modal')
    fireEvent.click(modal)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should render without title', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Content without title</div>
      </ResponsiveModal>
    )

    expect(screen.getByText('Content without title')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('should render without footer', () => {
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Content without footer</div>
      </ResponsiveModal>
    )

    expect(screen.getByText('Content without footer')).toBeInTheDocument()
  })

  it('should switch between mobile and desktop layouts', () => {
    // Start with desktop
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(false)

    const { unmount } = render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </ResponsiveModal>
    )

    let modal = screen.getByTestId('modal')
    expect(modal).toHaveClass('rounded-lg', 'max-w-2xl')

    // Cleanup and render as mobile
    unmount()
    vi.spyOn(useMediaQuery, 'useIsMobile').mockReturnValue(true)

    render(
      <ResponsiveModal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </ResponsiveModal>
    )

    modal = screen.getByTestId('modal')
    expect(modal).toHaveClass('w-full', 'h-full')
  })
})
