# User Profile, Language Selector, and Preferences Management

## Overview

This PR implements a complete user profile and preferences management system with three major components:

1. **ProfilePage** - Customizable user profile display and editing
2. **LanguageSelector** - Multi-variant language selection component
3. **useUserPreferences** - Comprehensive preferences management hook

**Total: 74 passing tests** (25 + 24 + 25)

## Components Implemented

### 1. ProfilePage Component (25 tests)

A flexible profile page component for displaying and editing user information.

#### Features
- **Display & Edit Modes**: Toggle between view and edit modes
- **Custom Fields**: Support for text, email, tel, textarea, select, and date fields
- **Field Validation**: Built-in and custom validation
- **Avatar Support**: Optional avatar display and upload
- **Editable/Non-Editable Fields**: Control which fields can be edited
- **Custom Components**: Override avatar and form rendering
- **Error Handling**: Field-level error display
- **Loading States**: Submit button loading state

#### API Reference

```typescript
interface ProfilePageProps {
  user?: any
  onUpdate?: (data: any) => void | Promise<void>
  fields?: ProfileField[]
  showAvatar?: boolean
  editable?: boolean
  avatarComponent?: React.ComponentType<{
    user: any
    onUpload?: (file: File) => void
  }>
  formComponent?: React.ComponentType<{
    user: any
    fields: ProfileField[]
    onSubmit: (data: any) => void
  }>
}

interface ProfileField {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'date'
  editable?: boolean
  required?: boolean
  options?: Array<{ value: string; label: string }>
  validate?: (value: any) => string | undefined
  format?: (value: any) => string
}
```

#### Usage Examples

**Basic Profile:**
```typescript
<ProfilePage
  user={{
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
  }}
  onUpdate={async (data) => {
    await updateUserProfile(data)
  }}
/>
```

**Custom Fields:**
```typescript
<ProfilePage
  user={user}
  fields={[
    {
      name: 'company',
      label: 'Company',
      type: 'text',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
      ],
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
    },
  ]}
  onUpdate={updateProfile}
/>
```

**With Custom Validation:**
```typescript
<ProfilePage
  user={user}
  fields={[
    {
      name: 'username',
      label: 'Username',
      required: true,
      validate: (value) => {
        if (value.length < 3) {
          return 'Username must be at least 3 characters'
        }
      },
    },
  ]}
/>
```

**Read-Only Fields:**
```typescript
<ProfilePage
  user={user}
  fields={[
    {
      name: 'id',
      label: 'User ID',
      editable: false, // Cannot be edited
    },
    {
      name: 'email',
      label: 'Email',
      editable: true,
    },
  ]}
/>
```

### 2. LanguageSelector Component (24 tests)

A flexible language selection component with multiple display variants.

#### Features
- **Multiple Variants**: dropdown, list, inline
- **Native Names**: Display languages in their native script
- **Flag Support**: Show flag emojis for visual identification
- **12 Pre-defined Languages**: English, Turkish, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic
- **RTL Support**: Built-in RTL flag for languages like Arabic
- **Custom Rendering**: Override language item rendering
- **Accessibility**: ARIA attributes and keyboard navigation

#### API Reference

```typescript
interface LanguageSelectorProps {
  languages: Language[]
  currentLanguage?: string
  onLanguageChange?: (language: Language) => void | Promise<void>
  showNativeNames?: boolean
  showFlags?: boolean
  variant?: 'dropdown' | 'list' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  renderLanguage?: (language: Language, isSelected: boolean) => ReactNode
}

interface Language {
  code: string
  name: string
  nativeName?: string
  flag?: string
  rtl?: boolean
}
```

#### Usage Examples

**Dropdown Variant:**
```typescript
<LanguageSelector
  languages={commonLanguages}
  currentLanguage="en"
  variant="dropdown"
  onLanguageChange={(lang) => {
    i18n.changeLanguage(lang.code)
  }}
/>
```

**List Variant:**
```typescript
<LanguageSelector
  languages={[
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  ]}
  currentLanguage="en"
  variant="list"
  onLanguageChange={handleLanguageChange}
/>
```

**Inline Variant (Compact):**
```typescript
<LanguageSelector
  languages={commonLanguages}
  currentLanguage="en"
  variant="inline"
  showFlags={true}
/>
```

**Without Flags:**
```typescript
<LanguageSelector
  languages={languages}
  variant="inline"
  showFlags={false}
  // Shows language codes: EN, TR, ES
/>
```

**Custom Rendering:**
```typescript
<LanguageSelector
  languages={languages}
  renderLanguage={(lang, isSelected) => (
    <div>
      {lang.flag} {lang.nativeName}
      {isSelected && ' ✓'}
    </div>
  )}
/>
```

#### Pre-defined Languages

```typescript
import { commonLanguages } from '@filact/core'

// Contains:
// English, Turkish, Spanish, French, German, Italian,
// Portuguese, Russian, Chinese, Japanese, Korean, Arabic
```

### 3. useUserPreferences Hook (25 tests)

A comprehensive hook for managing user preferences with persistence.

#### Features
- **Local Storage**: Automatic persistence to localStorage/sessionStorage
- **Server Sync**: Optional server synchronization
- **Built-in Preferences**: Theme, language, timezone, sidebar state, table density, etc.
- **Custom Preferences**: Support any custom preference keys
- **Loading States**: Track loading and saving states
- **Callbacks**: onChange callback for reactive updates
- **Operations**: Set, update, get, remove, clear, reset

#### API Reference

```typescript
interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  sidebarCollapsed?: boolean
  tableDensity?: 'compact' | 'comfortable' | 'spacious'
  itemsPerPage?: number
  notifications?: {
    email?: boolean
    push?: boolean
    inApp?: boolean
  }
  [key: string]: any // Custom preferences
}

interface UseUserPreferencesOptions {
  initialPreferences?: UserPreferences
  storageKey?: string
  storageType?: 'localStorage' | 'sessionStorage' | 'none'
  onChange?: (preferences: UserPreferences) => void
  syncWithServer?: boolean
  saveToServer?: (preferences: UserPreferences) => Promise<void>
  loadFromServer?: () => Promise<UserPreferences>
}

function useUserPreferences(options?: UseUserPreferencesOptions): {
  preferences: UserPreferences
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
  getPreference: <K extends keyof UserPreferences>(
    key: K,
    defaultValue?: UserPreferences[K]
  ) => UserPreferences[K] | undefined
  hasPreference: (key: keyof UserPreferences) => boolean
  removePreference: (key: keyof UserPreferences) => Promise<void>
  clearPreferences: () => Promise<void>
  resetPreferences: () => Promise<void>
  isLoading: boolean
  isSaving: boolean
}
```

#### Usage Examples

**Basic Usage:**
```typescript
const {
  preferences,
  setPreference,
  getPreference,
} = useUserPreferences()

// Set a preference
await setPreference('theme', 'dark')

// Get a preference
const theme = getPreference('theme', 'light') // default: 'light'
```

**With Initial Preferences:**
```typescript
const { preferences } = useUserPreferences({
  initialPreferences: {
    theme: 'dark',
    language: 'en',
    tableDensity: 'comfortable',
  },
})
```

**With Server Sync:**
```typescript
const { preferences, isLoading, isSaving } = useUserPreferences({
  syncWithServer: true,
  loadFromServer: async () => {
    const response = await fetch('/api/user/preferences')
    return response.json()
  },
  saveToServer: async (prefs) => {
    await fetch('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    })
  },
})
```

**Update Multiple Preferences:**
```typescript
const { updatePreferences } = useUserPreferences()

await updatePreferences({
  theme: 'dark',
  language: 'tr',
  notifications: {
    email: true,
    push: false,
    inApp: true,
  },
})
```

**With Change Callback:**
```typescript
useUserPreferences({
  onChange: (prefs) => {
    console.log('Preferences changed:', prefs)
    // React to changes
    if (prefs.theme) {
      applyTheme(prefs.theme)
    }
  },
})
```

**Custom Preferences:**
```typescript
const { setPreference, getPreference } = useUserPreferences()

// Set custom preference
await setPreference('editorFontSize', 14)
await setPreference('customDashboard', {
  layout: 'grid',
  widgets: ['stats', 'chart', 'table'],
})

// Get custom preference
const fontSize = getPreference('editorFontSize')
const dashboard = getPreference('customDashboard')
```

**Session Storage:**
```typescript
useUserPreferences({
  storageType: 'sessionStorage', // Cleared on tab close
})
```

**No Persistence:**
```typescript
useUserPreferences({
  storageType: 'none', // In-memory only
})
```

## Test Coverage

### ProfilePage Tests (25)
- ✅ Display mode rendering
- ✅ Edit mode functionality
- ✅ Field validation (required, email format, custom)
- ✅ Custom fields (text, email, select, textarea)
- ✅ Avatar display and upload
- ✅ Non-editable fields
- ✅ Error handling and clearing
- ✅ Custom components (avatar, form)
- ✅ Loading states
- ✅ Format field values for display

### LanguageSelector Tests (24)
- ✅ Dropdown variant
- ✅ List variant
- ✅ Inline variant
- ✅ Native names display
- ✅ Flag display
- ✅ Language selection
- ✅ Current language marking
- ✅ Menu open/close
- ✅ Custom rendering
- ✅ Async language change
- ✅ Size variants
- ✅ Common languages export

### useUserPreferences Tests (25)
- ✅ Initial state (empty, with initial prefs)
- ✅ localStorage persistence
- ✅ sessionStorage support
- ✅ Set single preference
- ✅ Update multiple preferences
- ✅ Get preference with default
- ✅ Check preference existence
- ✅ Remove preference
- ✅ Clear all preferences
- ✅ Reset to initial
- ✅ Server sync (load/save)
- ✅ Loading/saving states
- ✅ Error handling (server errors)
- ✅ Custom storage keys
- ✅ Nested preference objects
- ✅ onChange callback

## Integration Example

```typescript
import {
  ProfilePage,
  LanguageSelector,
  useUserPreferences,
  commonLanguages,
} from '@filact/core'

function UserSettingsPage() {
  const {
    preferences,
    setPreference,
    updatePreferences,
  } = useUserPreferences({
    syncWithServer: true,
    loadFromServer: fetchUserPreferences,
    saveToServer: saveUserPreferences,
  })

  return (
    <div>
      {/* Profile Section */}
      <ProfilePage
        user={currentUser}
        onUpdate={updateUserProfile}
      />

      {/* Language Selection */}
      <div className="mt-6">
        <h3>Language</h3>
        <LanguageSelector
          languages={commonLanguages}
          currentLanguage={preferences.language}
          variant="list"
          onLanguageChange={async (lang) => {
            await setPreference('language', lang.code)
            i18n.changeLanguage(lang.code)
          }}
        />
      </div>

      {/* Other Preferences */}
      <div className="mt-6">
        <label>
          Theme:
          <select
            value={preferences.theme || 'system'}
            onChange={(e) => setPreference('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>
      </div>
    </div>
  )
}
```

## Files Changed

### ProfilePage
- `packages/core/src/panel/ProfilePage.tsx` - Component implementation
- `packages/core/src/panel/ProfilePage.test.tsx` - Test suite (25 tests)

### LanguageSelector
- `packages/core/src/panel/LanguageSelector.tsx` - Component implementation
- `packages/core/src/panel/LanguageSelector.test.tsx` - Test suite (24 tests)

### useUserPreferences
- `packages/core/src/panel/useUserPreferences.ts` - Hook implementation
- `packages/core/src/panel/useUserPreferences.test.ts` - Test suite (25 tests)

### Exports
- `packages/core/src/panel/index.ts` - Added exports for all three features

## Breaking Changes

None - These are new feature additions.

## Future Enhancements

### ProfilePage
- Password change functionality
- Two-factor authentication settings
- Account deletion option
- Profile completion percentage
- Social media links

### LanguageSelector
- Language search/filter
- Recently used languages
- Automatic language detection
- Language fallback chain

### useUserPreferences
- Preference categories/namespacing
- Preference encryption for sensitive data
- Preference import/export
- Preference sharing between devices
- Preference versioning/migration
- Offline queue for server sync
- Conflict resolution strategies
