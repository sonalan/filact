import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LanguageSelector, type Language, commonLanguages } from './LanguageSelector'

describe('LanguageSelector', () => {
  const testLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  ]

  describe('Dropdown Variant', () => {
    it('should render dropdown with selected language', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="dropdown"
        />
      )

      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('🇬🇧')).toBeInTheDocument()
    })

    it('should show placeholder when no language selected', () => {
      render(<LanguageSelector languages={testLanguages} variant="dropdown" />)

      expect(screen.getByText('Select Language')).toBeInTheDocument()
    })

    it('should open menu on trigger click', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="dropdown"
        />
      )

      const trigger = screen.getByRole('button', { expanded: false })
      fireEvent.click(trigger)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })

    it('should close menu on language selection', () => {
      const onLanguageChange = vi.fn()
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="dropdown"
          onLanguageChange={onLanguageChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { expanded: false }))
      fireEvent.click(screen.getByText('Türkçe'))

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should call onLanguageChange when selecting a language', () => {
      const onLanguageChange = vi.fn()
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="dropdown"
          onLanguageChange={onLanguageChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { expanded: false }))
      fireEvent.click(screen.getByText('Türkçe'))

      expect(onLanguageChange).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'tr',
          name: 'Turkish',
        })
      )
    })

    it('should show checkmark on selected language in menu', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="tr"
          variant="dropdown"
        />
      )

      fireEvent.click(screen.getByRole('button', { expanded: false }))

      const selectedOption = screen.getByRole('option', { selected: true })
      expect(selectedOption.textContent).toContain('✓')
      expect(selectedOption.textContent).toContain('Türkçe')
    })

    it('should toggle menu on trigger click', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="dropdown"
        />
      )

      const trigger = screen.getByRole('button', { expanded: false })

      // Open
      fireEvent.click(trigger)
      expect(screen.getByRole('listbox')).toBeInTheDocument()

      // Close
      fireEvent.click(trigger)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('List Variant', () => {
    it('should render all languages as buttons', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="list"
        />
      )

      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('Türkçe')).toBeInTheDocument()
      expect(screen.getByText('Español')).toBeInTheDocument()
    })

    it('should mark selected language', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="tr"
          variant="list"
        />
      )

      const turkishButton = screen.getByText('Türkçe').closest('button')
      expect(turkishButton).toHaveAttribute('aria-current', 'true')
      expect(turkishButton?.textContent).toContain('✓')
    })

    it('should call onLanguageChange when clicking language', () => {
      const onLanguageChange = vi.fn()
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="list"
          onLanguageChange={onLanguageChange}
        />
      )

      fireEvent.click(screen.getByText('Español'))

      expect(onLanguageChange).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'es',
          name: 'Spanish',
        })
      )
    })
  })

  describe('Inline Variant', () => {
    it('should render compact language buttons', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="inline"
        />
      )

      expect(screen.getByText('🇬🇧')).toBeInTheDocument()
      expect(screen.getByText('🇹🇷')).toBeInTheDocument()
      expect(screen.getByText('🇪🇸')).toBeInTheDocument()
    })

    it('should show language codes when flags are disabled', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="inline"
          showFlags={false}
        />
      )

      expect(screen.getByText('EN')).toBeInTheDocument()
      expect(screen.getByText('TR')).toBeInTheDocument()
      expect(screen.getByText('ES')).toBeInTheDocument()
    })

    it('should mark selected language button', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="tr"
          variant="inline"
        />
      )

      const turkishButton = screen.getByText('🇹🇷').closest('button')
      expect(turkishButton).toHaveAttribute('aria-current', 'true')
    })

    it('should have title attribute with language name', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="inline"
        />
      )

      const englishButton = screen.getByText('🇬🇧').closest('button')
      expect(englishButton).toHaveAttribute('title', 'English')
    })
  })

  describe('Display Options', () => {
    it('should show native names by default', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="tr"
          variant="list"
        />
      )

      expect(screen.getByText('Türkçe')).toBeInTheDocument()
    })

    it('should show English names when showNativeNames is false', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="tr"
          variant="list"
          showNativeNames={false}
        />
      )

      expect(screen.getByText('Turkish')).toBeInTheDocument()
      expect(screen.queryByText('Türkçe')).not.toBeInTheDocument()
    })

    it('should hide flags when showFlags is false', () => {
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="dropdown"
          showFlags={false}
        />
      )

      expect(screen.queryByText('🇬🇧')).not.toBeInTheDocument()
    })

    it('should support different sizes', () => {
      const { container } = render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="dropdown"
          size="lg"
        />
      )

      expect(container.querySelector('.language-selector-lg')).toBeInTheDocument()
    })
  })

  describe('Custom Rendering', () => {
    it('should use custom render function', () => {
      const renderLanguage = (language: Language, isSelected: boolean) => (
        <span>
          Custom: {language.code} {isSelected ? '✓' : ''}
        </span>
      )

      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="tr"
          variant="list"
          renderLanguage={renderLanguage}
        />
      )

      expect(screen.getByText(/Custom: tr/)).toBeInTheDocument()
    })
  })

  describe('Async Language Change', () => {
    it('should support async onLanguageChange', async () => {
      const onLanguageChange = vi.fn().mockResolvedValue(undefined)
      render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="list"
          onLanguageChange={onLanguageChange}
        />
      )

      fireEvent.click(screen.getByText('Türkçe'))

      await waitFor(() => {
        expect(onLanguageChange).toHaveBeenCalled()
      })
    })
  })

  describe('Current Language Update', () => {
    it('should update selected language when currentLanguage prop changes', () => {
      const { rerender } = render(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="en"
          variant="dropdown"
        />
      )

      expect(screen.getByText('English')).toBeInTheDocument()

      rerender(
        <LanguageSelector
          languages={testLanguages}
          currentLanguage="tr"
          variant="dropdown"
        />
      )

      expect(screen.getByText('Türkçe')).toBeInTheDocument()
    })
  })

  describe('Common Languages', () => {
    it('should export commonLanguages array', () => {
      expect(commonLanguages).toBeDefined()
      expect(commonLanguages.length).toBeGreaterThan(0)
    })

    it('should have English in commonLanguages', () => {
      const english = commonLanguages.find((lang) => lang.code === 'en')
      expect(english).toBeDefined()
      expect(english?.name).toBe('English')
    })

    it('should have RTL flag for Arabic', () => {
      const arabic = commonLanguages.find((lang) => lang.code === 'ar')
      expect(arabic).toBeDefined()
      expect(arabic?.rtl).toBe(true)
    })
  })
})
