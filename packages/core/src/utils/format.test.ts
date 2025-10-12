import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatFileSize,
  formatPhone,
  formatCompactNumber,
} from './format'

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('should format EUR currency', () => {
      expect(formatCurrency(1234.56, 'EUR', 'de-DE')).toMatch(/1\.234,56\s*€/)
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with default decimals', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,567.89')
    })

    it('should format numbers with no decimals', () => {
      expect(formatNumber(1234567.89, 0)).toBe('1,234,568')
    })

    it('should format numbers with specific decimals', () => {
      expect(formatNumber(1234.5, 2)).toBe('1,234.50')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0')
    })
  })

  describe('formatPercent', () => {
    it('should format percentage with no decimals', () => {
      expect(formatPercent(0.1234)).toBe('12%')
    })

    it('should format percentage with decimals', () => {
      expect(formatPercent(0.1234, 2)).toBe('12.34%')
    })

    it('should handle 100%', () => {
      expect(formatPercent(1)).toBe('100%')
    })

    it('should handle 0%', () => {
      expect(formatPercent(0)).toBe('0%')
    })
  })

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T12:30:00Z')

    it('should format date in short format', () => {
      const formatted = formatDate(testDate, 'short')
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
    })

    it('should accept string dates', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toBeTruthy()
    })

    it('should accept timestamp', () => {
      const formatted = formatDate(testDate.getTime())
      expect(formatted).toBeTruthy()
    })
  })

  describe('formatDateTime', () => {
    const testDate = new Date('2024-01-15T12:30:00Z')

    it('should format date and time', () => {
      const formatted = formatDateTime(testDate)
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('formatTime', () => {
    const testDate = new Date('2024-01-15T15:30:00Z')

    it('should format time', () => {
      const formatted = formatTime(testDate)
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('formatRelativeTime', () => {
    it('should format future dates', () => {
      const future = new Date(Date.now() + 3600000) // 1 hour from now
      const formatted = formatRelativeTime(future)
      expect(formatted).toMatch(/in 1 hour/)
    })

    it('should format past dates', () => {
      const past = new Date(Date.now() - 3600000) // 1 hour ago
      const formatted = formatRelativeTime(past)
      expect(formatted).toMatch(/1 hour ago/)
    })

    it('should handle seconds', () => {
      const past = new Date(Date.now() - 30000) // 30 seconds ago
      const formatted = formatRelativeTime(past)
      expect(formatted).toMatch(/30 seconds ago/)
    })

    it('should handle days', () => {
      const past = new Date(Date.now() - 86400000 * 2) // 2 days ago
      const formatted = formatRelativeTime(past)
      expect(formatted).toMatch(/2 days ago/)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(100)).toBe('100.00 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB')
      expect(formatFileSize(2048)).toBe('2.00 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB')
      expect(formatFileSize(5242880)).toBe('5.00 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB')
    })

    it('should respect decimal places', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB')
      expect(formatFileSize(1536, 1)).toBe('1.5 KB')
    })
  })

  describe('formatPhone', () => {
    it('should format US phone number with default format', () => {
      expect(formatPhone('1234567890')).toBe('(123) 456-7890')
    })

    it('should format with custom format', () => {
      expect(formatPhone('1234567890', 'XXX-XXX-XXXX')).toBe('123-456-7890')
    })

    it('should handle numbers with existing formatting', () => {
      expect(formatPhone('(123) 456-7890')).toBe('(123) 456-7890')
    })

    it('should handle partial numbers', () => {
      expect(formatPhone('123')).toBe('(123)')
    })
  })

  describe('formatCompactNumber', () => {
    it('should not compact numbers below 1000', () => {
      expect(formatCompactNumber(999)).toBe('999')
    })

    it('should format thousands', () => {
      expect(formatCompactNumber(1234)).toBe('1.2K')
      expect(formatCompactNumber(5000)).toBe('5.0K')
    })

    it('should format millions', () => {
      expect(formatCompactNumber(1500000)).toBe('1.5M')
      expect(formatCompactNumber(10000000)).toBe('10.0M')
    })

    it('should format billions', () => {
      expect(formatCompactNumber(1500000000)).toBe('1.5B')
    })

    it('should format trillions', () => {
      expect(formatCompactNumber(1500000000000)).toBe('1.5T')
    })

    it('should respect decimal places', () => {
      expect(formatCompactNumber(1234, 0)).toBe('1K')
      expect(formatCompactNumber(1234, 2)).toBe('1.23K')
    })
  })
})
