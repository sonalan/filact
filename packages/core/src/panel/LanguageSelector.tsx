/**
 * Language Selector Component
 * Allows users to select their preferred language
 */

import { useState, useEffect } from 'react'

export interface Language {
  /** Language code (e.g., 'en', 'tr', 'es') */
  code: string

  /** Display name */
  name: string

  /** Native name (e.g., 'English', 'Türkçe') */
  nativeName?: string

  /** Flag emoji or icon */
  flag?: string

  /** Is RTL language */
  rtl?: boolean
}

export interface LanguageSelectorProps {
  /** Available languages */
  languages: Language[]

  /** Current language code */
  currentLanguage?: string

  /** Callback when language changes */
  onLanguageChange?: (language: Language) => void | Promise<void>

  /** Show native names instead of English names */
  showNativeNames?: boolean

  /** Show flags */
  showFlags?: boolean

  /** Display mode */
  variant?: 'dropdown' | 'list' | 'inline'

  /** Size */
  size?: 'sm' | 'md' | 'lg'

  /** Custom render function for language item */
  renderLanguage?: (language: Language, isSelected: boolean) => React.ReactNode
}

export function LanguageSelector({
  languages,
  currentLanguage,
  onLanguageChange,
  showNativeNames = true,
  showFlags = true,
  variant = 'dropdown',
  size = 'md',
  renderLanguage,
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(currentLanguage)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setSelectedLanguage(currentLanguage)
  }, [currentLanguage])

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language.code)
    setIsOpen(false)

    await onLanguageChange?.(language)
  }

  const getLanguageLabel = (language: Language) => {
    if (showNativeNames && language.nativeName) {
      return language.nativeName
    }
    return language.name
  }

  const selected = languages.find((lang) => lang.code === selectedLanguage)

  const renderLanguageItem = (language: Language, isSelected: boolean) => {
    if (renderLanguage) {
      return renderLanguage(language, isSelected)
    }

    return (
      <span className="language-item-content">
        {showFlags && language.flag && <span className="language-flag">{language.flag}</span>}
        <span className="language-name">{getLanguageLabel(language)}</span>
        {isSelected && <span className="language-check">✓</span>}
      </span>
    )
  }

  if (variant === 'list') {
    return (
      <div className={`language-selector language-selector-list language-selector-${size}`}>
        {languages.map((language) => {
          const isSelected = language.code === selectedLanguage

          return (
            <button
              key={language.code}
              type="button"
              onClick={() => handleLanguageSelect(language)}
              className={`language-item ${isSelected ? 'language-item-selected' : ''}`}
              aria-current={isSelected ? 'true' : undefined}
            >
              {renderLanguageItem(language, isSelected)}
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`language-selector language-selector-inline language-selector-${size}`}>
        {languages.map((language) => {
          const isSelected = language.code === selectedLanguage

          return (
            <button
              key={language.code}
              type="button"
              onClick={() => handleLanguageSelect(language)}
              className={`language-button ${isSelected ? 'language-button-selected' : ''}`}
              aria-current={isSelected ? 'true' : undefined}
              title={getLanguageLabel(language)}
            >
              {showFlags && language.flag ? language.flag : language.code.toUpperCase()}
            </button>
          )
        })}
      </div>
    )
  }

  // Dropdown variant (default)
  return (
    <div className={`language-selector language-selector-dropdown language-selector-${size}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="language-selector-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {selected ? (
          <>
            {showFlags && selected.flag && (
              <span className="language-flag">{selected.flag}</span>
            )}
            <span className="language-name">{getLanguageLabel(selected)}</span>
          </>
        ) : (
          <span>Select Language</span>
        )}
        <span className="language-selector-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="language-selector-menu" role="listbox">
          {languages.map((language) => {
            const isSelected = language.code === selectedLanguage

            return (
              <button
                key={language.code}
                type="button"
                role="option"
                onClick={() => handleLanguageSelect(language)}
                className={`language-menu-item ${isSelected ? 'language-menu-item-selected' : ''}`}
                aria-selected={isSelected}
              >
                {renderLanguageItem(language, isSelected)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Common languages with flags
 */
export const commonLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
]
