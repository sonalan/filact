/**
 * Format Utilities
 * Helper functions for formatting various data types
 */

/**
 * Format a number as currency
 *
 * @param value - The number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 *
 * @example
 * ```ts
 * formatCurrency(1234.56) // '$1,234.56'
 * formatCurrency(1234.56, 'EUR', 'de-DE') // '1.234,56 €'
 * ```
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

/**
 * Format a number with thousands separators
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted number string
 *
 * @example
 * ```ts
 * formatNumber(1234567.89) // '1,234,567.89'
 * formatNumber(1234567.89, 0) // '1,234,568'
 * ```
 */
export function formatNumber(
  value: number,
  decimals?: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a number as a percentage
 *
 * @param value - The number to format (0.5 = 50%)
 * @param decimals - Number of decimal places (default: 0)
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted percentage string
 *
 * @example
 * ```ts
 * formatPercent(0.1234) // '12%'
 * formatPercent(0.1234, 2) // '12.34%'
 * ```
 */
export function formatPercent(
  value: number,
  decimals: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a date
 *
 * @param date - Date to format
 * @param format - Format style ('short', 'medium', 'long', 'full')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate(new Date()) // '1/15/2024'
 * formatDate(new Date(), 'long') // 'January 15, 2024'
 * ```
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'short',
  locale: string = 'en-US'
): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat(locale, {
    dateStyle: format,
  }).format(d)
}

/**
 * Format a date and time
 *
 * @param date - Date to format
 * @param dateFormat - Date format style
 * @param timeFormat - Time format style
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date/time string
 *
 * @example
 * ```ts
 * formatDateTime(new Date()) // '1/15/2024, 3:30 PM'
 * formatDateTime(new Date(), 'long', 'short') // 'January 15, 2024, 3:30 PM'
 * ```
 */
export function formatDateTime(
  date: Date | string | number,
  dateFormat: 'short' | 'medium' | 'long' | 'full' = 'short',
  timeFormat: 'short' | 'medium' | 'long' | 'full' = 'short',
  locale: string = 'en-US'
): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat(locale, {
    dateStyle: dateFormat,
    timeStyle: timeFormat,
  }).format(d)
}

/**
 * Format a time
 *
 * @param date - Date to format
 * @param format - Format style ('short', 'medium', 'long', 'full')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted time string
 *
 * @example
 * ```ts
 * formatTime(new Date()) // '3:30 PM'
 * formatTime(new Date(), 'long') // '3:30:00 PM EST'
 * ```
 */
export function formatTime(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'full' = 'short',
  locale: string = 'en-US'
): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat(locale, {
    timeStyle: format,
  }).format(d)
}

/**
 * Format a relative time (e.g., "2 hours ago")
 *
 * @param date - Date to format
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Relative time string
 *
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 3600000)) // '1 hour ago'
 * formatRelativeTime(new Date(Date.now() + 86400000)) // 'in 1 day'
 * ```
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ]

  for (const { unit, seconds } of units) {
    const diff = diffInSeconds / seconds
    if (Math.abs(diff) >= 1) {
      return rtf.format(Math.round(diff), unit)
    }
  }

  return rtf.format(0, 'second')
}

/**
 * Format file size in human-readable format
 *
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted size string
 *
 * @example
 * ```ts
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 * formatFileSize(1073741824, 0) // '1 GB'
 * ```
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`
}

/**
 * Format a phone number
 *
 * @param phone - Phone number string
 * @param format - Format pattern (default: US format)
 * @returns Formatted phone number
 *
 * @example
 * ```ts
 * formatPhone('1234567890') // '(123) 456-7890'
 * formatPhone('1234567890', 'XXX-XXX-XXXX') // '123-456-7890'
 * ```
 */
export function formatPhone(
  phone: string,
  format: string = '(XXX) XXX-XXXX'
): string {
  const cleaned = phone.replace(/\D/g, '')
  let formatted = format

  for (const digit of cleaned) {
    formatted = formatted.replace('X', digit)
  }

  // Remove remaining X's and trailing separators
  return formatted.replace(/X/g, '').replace(/[-\s]+$/, '')
}

/**
 * Compact number formatting (1.2K, 1.5M, etc.)
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Compacted number string
 *
 * @example
 * ```ts
 * formatCompactNumber(1234) // '1.2K'
 * formatCompactNumber(1500000) // '1.5M'
 * formatCompactNumber(1500000000) // '1.5B'
 * ```
 */
export function formatCompactNumber(value: number, decimals: number = 1): string {
  if (value < 1000) return value.toString()

  const units = ['K', 'M', 'B', 'T']
  let unitIndex = -1
  let scaledValue = value

  while (scaledValue >= 1000 && unitIndex < units.length - 1) {
    scaledValue /= 1000
    unitIndex++
  }

  return `${scaledValue.toFixed(decimals)}${units[unitIndex]}`
}
