/**
 * String Utilities
 * Helper functions for string manipulation
 */

/**
 * Truncate a string to a specified length
 *
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 *
 * @example
 * ```ts
 * truncate('Hello World', 8) // 'Hello...'
 * truncate('Hello World', 8, '…') // 'Hello…'
 * ```
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}

/**
 * Capitalize first letter of a string
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 *
 * @example
 * ```ts
 * capitalize('hello world') // 'Hello world'
 * capitalize('HELLO') // 'HELLO'
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Capitalize first letter of each word
 *
 * @param str - String to capitalize
 * @returns Title-cased string
 *
 * @example
 * ```ts
 * titleCase('hello world') // 'Hello World'
 * titleCase('the quick brown fox') // 'The Quick Brown Fox'
 * ```
 */
export function titleCase(str: string): string {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ')
}

/**
 * Convert string to camelCase
 *
 * @param str - String to convert
 * @returns camelCase string
 *
 * @example
 * ```ts
 * camelCase('hello world') // 'helloWorld'
 * camelCase('hello-world') // 'helloWorld'
 * camelCase('hello_world') // 'helloWorld'
 * ```
 */
export function camelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase())
}

/**
 * Convert string to PascalCase
 *
 * @param str - String to convert
 * @returns PascalCase string
 *
 * @example
 * ```ts
 * pascalCase('hello world') // 'HelloWorld'
 * pascalCase('hello-world') // 'HelloWorld'
 * ```
 */
export function pascalCase(str: string): string {
  const camel = camelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Convert string to snake_case
 *
 * @param str - String to convert
 * @returns snake_case string
 *
 * @example
 * ```ts
 * snakeCase('helloWorld') // 'hello_world'
 * snakeCase('HelloWorld') // 'hello_world'
 * ```
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_/, '')
    .toLowerCase()
}

/**
 * Convert string to kebab-case
 *
 * @param str - String to convert
 * @returns kebab-case string
 *
 * @example
 * ```ts
 * kebabCase('helloWorld') // 'hello-world'
 * kebabCase('HelloWorld') // 'hello-world'
 * ```
 */
export function kebabCase(str: string): string {
  return snakeCase(str).replace(/_/g, '-')
}

/**
 * Create a URL-friendly slug from a string
 *
 * @param str - String to slugify
 * @returns Slug string
 *
 * @example
 * ```ts
 * slugify('Hello World!') // 'hello-world'
 * slugify('The Quick Brown Fox') // 'the-quick-brown-fox'
 * ```
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Remove extra whitespace from a string
 *
 * @param str - String to clean
 * @returns Cleaned string
 *
 * @example
 * ```ts
 * cleanWhitespace('  hello   world  ') // 'hello world'
 * ```
 */
export function cleanWhitespace(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}

/**
 * Escape HTML characters in a string
 *
 * @param str - String to escape
 * @returns Escaped string
 *
 * @example
 * ```ts
 * escapeHtml('<div>Hello</div>') // '&lt;div&gt;Hello&lt;/div&gt;'
 * ```
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char])
}

/**
 * Unescape HTML entities in a string
 *
 * @param str - String to unescape
 * @returns Unescaped string
 *
 * @example
 * ```ts
 * unescapeHtml('&lt;div&gt;Hello&lt;/div&gt;') // '<div>Hello</div>'
 * ```
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  }

  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => htmlUnescapes[entity])
}

/**
 * Generate a random string
 *
 * @param length - Length of the string
 * @param chars - Characters to use (default: alphanumeric)
 * @returns Random string
 *
 * @example
 * ```ts
 * randomString(10) // 'aB3dE5gH7j'
 * randomString(6, '0123456789') // '123456'
 * ```
 */
export function randomString(
  length: number,
  chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Pluralize a word based on count
 *
 * @param word - Word to pluralize
 * @param count - Count to determine plural
 * @param plural - Custom plural form
 * @returns Pluralized word
 *
 * @example
 * ```ts
 * pluralize('item', 1) // 'item'
 * pluralize('item', 5) // 'items'
 * pluralize('person', 5, 'people') // 'people'
 * ```
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word
  return plural || `${word}s`
}

/**
 * Extract initials from a name
 *
 * @param name - Name string
 * @param maxLength - Maximum number of initials (default: 2)
 * @returns Initials string
 *
 * @example
 * ```ts
 * getInitials('John Doe') // 'JD'
 * getInitials('John Middle Doe', 3) // 'JMD'
 * ```
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, maxLength)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

/**
 * Mask a string (e.g., for sensitive data)
 *
 * @param str - String to mask
 * @param visibleStart - Number of visible characters at start
 * @param visibleEnd - Number of visible characters at end
 * @param maskChar - Character to use for masking (default: '*')
 * @returns Masked string
 *
 * @example
 * ```ts
 * maskString('1234567890', 2, 2) // '12******90'
 * maskString('email@example.com', 2, 4) // 'em*********com'
 * ```
 */
export function maskString(
  str: string,
  visibleStart: number = 0,
  visibleEnd: number = 0,
  maskChar: string = '*'
): string {
  if (str.length <= visibleStart + visibleEnd) return str

  const start = str.slice(0, visibleStart)
  const end = visibleEnd > 0 ? str.slice(-visibleEnd) : ''
  const masked = maskChar.repeat(str.length - visibleStart - visibleEnd)

  return start + masked + end
}
