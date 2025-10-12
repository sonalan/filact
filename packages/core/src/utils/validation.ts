/**
 * Validation Utilities
 * Helper functions for validating various data types
 */

/**
 * Check if a value is empty
 *
 * @param value - Value to check
 * @returns True if value is empty
 *
 * @example
 * ```ts
 * isEmpty('') // true
 * isEmpty(null) // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('hello') // false
 * ```
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Validate email address
 *
 * @param email - Email to validate
 * @returns True if email is valid
 *
 * @example
 * ```ts
 * isEmail('user@example.com') // true
 * isEmail('invalid') // false
 * ```
 */
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL
 *
 * @param url - URL to validate
 * @returns True if URL is valid
 *
 * @example
 * ```ts
 * isUrl('https://example.com') // true
 * isUrl('invalid') // false
 * ```
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate phone number (US format)
 *
 * @param phone - Phone number to validate
 * @returns True if phone is valid
 *
 * @example
 * ```ts
 * isPhone('(123) 456-7890') // true
 * isPhone('123-456-7890') // true
 * isPhone('1234567890') // true
 * isPhone('invalid') // false
 * ```
 */
export function isPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

/**
 * Validate credit card number (Luhn algorithm)
 *
 * @param cardNumber - Card number to validate
 * @returns True if card number is valid
 *
 * @example
 * ```ts
 * isCreditCard('4532015112830366') // true
 * isCreditCard('1234567890123456') // false
 * ```
 */
export function isCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '')

  if (cleaned.length < 13 || cleaned.length > 19) {
    return false
  }

  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Validate hex color code
 *
 * @param color - Color code to validate
 * @returns True if color is valid
 *
 * @example
 * ```ts
 * isHexColor('#fff') // true
 * isHexColor('#ffffff') // true
 * isHexColor('invalid') // false
 * ```
 */
export function isHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

/**
 * Validate IPv4 address
 *
 * @param ip - IP address to validate
 * @returns True if IP is valid
 *
 * @example
 * ```ts
 * isIPv4('192.168.1.1') // true
 * isIPv4('256.1.1.1') // false
 * ```
 */
export function isIPv4(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false

  return parts.every((part) => {
    const num = parseInt(part, 10)
    return num >= 0 && num <= 255 && part === num.toString()
  })
}

/**
 * Validate UUID
 *
 * @param uuid - UUID to validate
 * @returns True if UUID is valid
 *
 * @example
 * ```ts
 * isUUID('123e4567-e89b-12d3-a456-426614174000') // true
 * isUUID('invalid') // false
 * ```
 */
export function isUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate JSON string
 *
 * @param json - JSON string to validate
 * @returns True if JSON is valid
 *
 * @example
 * ```ts
 * isJSON('{"key": "value"}') // true
 * isJSON('invalid') // false
 * ```
 */
export function isJSON(json: string): boolean {
  try {
    JSON.parse(json)
    return true
  } catch {
    return false
  }
}

/**
 * Check if string contains only numbers
 *
 * @param str - String to check
 * @returns True if string is numeric
 *
 * @example
 * ```ts
 * isNumeric('123') // true
 * isNumeric('12.34') // true
 * isNumeric('abc') // false
 * ```
 */
export function isNumeric(str: string): boolean {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str))
}

/**
 * Check if string contains only alphabetic characters
 *
 * @param str - String to check
 * @returns True if string is alphabetic
 *
 * @example
 * ```ts
 * isAlpha('hello') // true
 * isAlpha('hello123') // false
 * ```
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str)
}

/**
 * Check if string contains only alphanumeric characters
 *
 * @param str - String to check
 * @returns True if string is alphanumeric
 *
 * @example
 * ```ts
 * isAlphanumeric('hello123') // true
 * isAlphanumeric('hello-123') // false
 * ```
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str)
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @param minLength - Minimum length (default: 8)
 * @returns Object with validation result and requirements met
 *
 * @example
 * ```ts
 * isStrongPassword('Pass123!') // { valid: true, requirements: {...} }
 * isStrongPassword('weak') // { valid: false, requirements: {...} }
 * ```
 */
export function isStrongPassword(
  password: string,
  minLength: number = 8
): {
  valid: boolean
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
} {
  const requirements = {
    minLength: password.length >= minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const valid = Object.values(requirements).every((req) => req)

  return { valid, requirements }
}

/**
 * Check if value is within range
 *
 * @param value - Value to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if value is in range
 *
 * @example
 * ```ts
 * inRange(5, 1, 10) // true
 * inRange(15, 1, 10) // false
 * ```
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Validate length of string or array
 *
 * @param value - Value to check
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns True if length is valid
 *
 * @example
 * ```ts
 * isLength('hello', 1, 10) // true
 * isLength([1, 2, 3], 1, 5) // true
 * isLength('hello', 10, 20) // false
 * ```
 */
export function isLength(
  value: string | any[],
  min: number,
  max: number
): boolean {
  return value.length >= min && value.length <= max
}

/**
 * Check if date is in the past
 *
 * @param date - Date to check
 * @returns True if date is in the past
 *
 * @example
 * ```ts
 * isPast(new Date('2020-01-01')) // true
 * isPast(new Date('2030-01-01')) // false
 * ```
 */
export function isPast(date: Date | string | number): boolean {
  return new Date(date).getTime() < Date.now()
}

/**
 * Check if date is in the future
 *
 * @param date - Date to check
 * @returns True if date is in the future
 *
 * @example
 * ```ts
 * isFuture(new Date('2030-01-01')) // true
 * isFuture(new Date('2020-01-01')) // false
 * ```
 */
export function isFuture(date: Date | string | number): boolean {
  return new Date(date).getTime() > Date.now()
}

/**
 * Check if two dates are on the same day
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are on the same day
 *
 * @example
 * ```ts
 * isSameDay(new Date('2024-01-01'), new Date('2024-01-01')) // true
 * isSameDay(new Date('2024-01-01'), new Date('2024-01-02')) // false
 * ```
 */
export function isSameDay(
  date1: Date | string | number,
  date2: Date | string | number
): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}
