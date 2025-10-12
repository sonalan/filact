import { describe, it, expect } from 'vitest'
import {
  isEmpty,
  isEmail,
  isUrl,
  isPhone,
  isCreditCard,
  isHexColor,
  isIPv4,
  isUUID,
  isJSON,
  isNumeric,
  isAlpha,
  isAlphanumeric,
  isStrongPassword,
  inRange,
  isLength,
  isPast,
  isFuture,
  isSameDay,
} from './validation'

describe('validation utilities', () => {
  describe('isEmpty', () => {
    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
    })

    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('should return false for non-empty values', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty({ key: 'value' })).toBe(false)
      expect(isEmpty(0)).toBe(false)
    })
  })

  describe('isEmail', () => {
    it('should validate correct emails', () => {
      expect(isEmail('user@example.com')).toBe(true)
      expect(isEmail('test.user@example.co.uk')).toBe(true)
      expect(isEmail('user+tag@example.com')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isEmail('invalid')).toBe(false)
      expect(isEmail('@example.com')).toBe(false)
      expect(isEmail('user@')).toBe(false)
      expect(isEmail('user @example.com')).toBe(false)
    })
  })

  describe('isUrl', () => {
    it('should validate correct URLs', () => {
      expect(isUrl('https://example.com')).toBe(true)
      expect(isUrl('http://example.com')).toBe(true)
      expect(isUrl('https://example.com/path')).toBe(true)
      expect(isUrl('https://example.com:8080')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isUrl('invalid')).toBe(false)
      expect(isUrl('example.com')).toBe(false)
    })
  })

  describe('isPhone', () => {
    it('should validate US phone numbers', () => {
      expect(isPhone('1234567890')).toBe(true)
      expect(isPhone('(123) 456-7890')).toBe(true)
      expect(isPhone('123-456-7890')).toBe(true)
      expect(isPhone('11234567890')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(isPhone('123')).toBe(false)
      expect(isPhone('abcdefghij')).toBe(false)
      expect(isPhone('123456789012')).toBe(false)
    })
  })

  describe('isCreditCard', () => {
    it('should validate valid credit card numbers', () => {
      expect(isCreditCard('4532015112830366')).toBe(true) // Visa
      expect(isCreditCard('6011514433546201')).toBe(true) // Discover
      expect(isCreditCard('378282246310005')).toBe(true) // Amex
    })

    it('should reject invalid credit card numbers', () => {
      expect(isCreditCard('1234567890123456')).toBe(false)
      expect(isCreditCard('4532015112830367')).toBe(false)
      expect(isCreditCard('123')).toBe(false)
    })

    it('should handle formatted numbers', () => {
      expect(isCreditCard('4532-0151-1283-0366')).toBe(true)
      expect(isCreditCard('4532 0151 1283 0366')).toBe(true)
    })
  })

  describe('isHexColor', () => {
    it('should validate hex colors', () => {
      expect(isHexColor('#fff')).toBe(true)
      expect(isHexColor('#ffffff')).toBe(true)
      expect(isHexColor('#123456')).toBe(true)
      expect(isHexColor('#abc')).toBe(true)
    })

    it('should reject invalid hex colors', () => {
      expect(isHexColor('fff')).toBe(false)
      expect(isHexColor('#gg')).toBe(false)
      expect(isHexColor('#12345')).toBe(false)
      expect(isHexColor('#1234567')).toBe(false)
    })
  })

  describe('isIPv4', () => {
    it('should validate IPv4 addresses', () => {
      expect(isIPv4('192.168.1.1')).toBe(true)
      expect(isIPv4('0.0.0.0')).toBe(true)
      expect(isIPv4('255.255.255.255')).toBe(true)
    })

    it('should reject invalid IPv4 addresses', () => {
      expect(isIPv4('256.1.1.1')).toBe(false)
      expect(isIPv4('192.168.1')).toBe(false)
      expect(isIPv4('192.168.1.1.1')).toBe(false)
      expect(isIPv4('192.168.01.1')).toBe(false)
    })
  })

  describe('isUUID', () => {
    it('should validate UUIDs', () => {
      expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
      expect(isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })

    it('should reject invalid UUIDs', () => {
      expect(isUUID('invalid')).toBe(false)
      expect(isUUID('123e4567-e89b-12d3-a456')).toBe(false)
      expect(isUUID('123e4567-e89b-62d3-a456-426614174000')).toBe(false)
    })
  })

  describe('isJSON', () => {
    it('should validate JSON strings', () => {
      expect(isJSON('{"key": "value"}')).toBe(true)
      expect(isJSON('["item1", "item2"]')).toBe(true)
      expect(isJSON('123')).toBe(true)
      expect(isJSON('null')).toBe(true)
    })

    it('should reject invalid JSON', () => {
      expect(isJSON('invalid')).toBe(false)
      expect(isJSON('{key: value}')).toBe(false)
      expect(isJSON("{'key': 'value'}")).toBe(false)
    })
  })

  describe('isNumeric', () => {
    it('should validate numeric strings', () => {
      expect(isNumeric('123')).toBe(true)
      expect(isNumeric('12.34')).toBe(true)
      expect(isNumeric('-123')).toBe(true)
      expect(isNumeric('0')).toBe(true)
    })

    it('should reject non-numeric strings', () => {
      expect(isNumeric('abc')).toBe(false)
      expect(isNumeric('12a')).toBe(false)
      expect(isNumeric('')).toBe(false)
    })
  })

  describe('isAlpha', () => {
    it('should validate alphabetic strings', () => {
      expect(isAlpha('hello')).toBe(true)
      expect(isAlpha('HELLO')).toBe(true)
      expect(isAlpha('HelloWorld')).toBe(true)
    })

    it('should reject non-alphabetic strings', () => {
      expect(isAlpha('hello123')).toBe(false)
      expect(isAlpha('hello-world')).toBe(false)
      expect(isAlpha('hello world')).toBe(false)
      expect(isAlpha('')).toBe(false)
    })
  })

  describe('isAlphanumeric', () => {
    it('should validate alphanumeric strings', () => {
      expect(isAlphanumeric('hello123')).toBe(true)
      expect(isAlphanumeric('HELLO123')).toBe(true)
      expect(isAlphanumeric('abc')).toBe(true)
      expect(isAlphanumeric('123')).toBe(true)
    })

    it('should reject non-alphanumeric strings', () => {
      expect(isAlphanumeric('hello-123')).toBe(false)
      expect(isAlphanumeric('hello 123')).toBe(false)
      expect(isAlphanumeric('hello_123')).toBe(false)
      expect(isAlphanumeric('')).toBe(false)
    })
  })

  describe('isStrongPassword', () => {
    it('should validate strong passwords', () => {
      const result = isStrongPassword('Pass123!')
      expect(result.valid).toBe(true)
      expect(result.requirements.minLength).toBe(true)
      expect(result.requirements.hasUppercase).toBe(true)
      expect(result.requirements.hasLowercase).toBe(true)
      expect(result.requirements.hasNumber).toBe(true)
      expect(result.requirements.hasSpecialChar).toBe(true)
    })

    it('should reject weak passwords', () => {
      const result = isStrongPassword('weak')
      expect(result.valid).toBe(false)
      expect(result.requirements.minLength).toBe(false)
    })

    it('should respect custom minimum length', () => {
      const result = isStrongPassword('Pass123!', 12)
      expect(result.valid).toBe(false)
      expect(result.requirements.minLength).toBe(false)
    })

    it('should check for uppercase', () => {
      const result = isStrongPassword('pass123!')
      expect(result.valid).toBe(false)
      expect(result.requirements.hasUppercase).toBe(false)
    })

    it('should check for lowercase', () => {
      const result = isStrongPassword('PASS123!')
      expect(result.valid).toBe(false)
      expect(result.requirements.hasLowercase).toBe(false)
    })

    it('should check for numbers', () => {
      const result = isStrongPassword('Password!')
      expect(result.valid).toBe(false)
      expect(result.requirements.hasNumber).toBe(false)
    })

    it('should check for special characters', () => {
      const result = isStrongPassword('Password123')
      expect(result.valid).toBe(false)
      expect(result.requirements.hasSpecialChar).toBe(false)
    })
  })

  describe('inRange', () => {
    it('should return true for values in range', () => {
      expect(inRange(5, 1, 10)).toBe(true)
      expect(inRange(1, 1, 10)).toBe(true)
      expect(inRange(10, 1, 10)).toBe(true)
    })

    it('should return false for values out of range', () => {
      expect(inRange(0, 1, 10)).toBe(false)
      expect(inRange(11, 1, 10)).toBe(false)
      expect(inRange(-5, 1, 10)).toBe(false)
    })
  })

  describe('isLength', () => {
    it('should validate string length', () => {
      expect(isLength('hello', 1, 10)).toBe(true)
      expect(isLength('hello', 5, 5)).toBe(true)
    })

    it('should validate array length', () => {
      expect(isLength([1, 2, 3], 1, 5)).toBe(true)
      expect(isLength([1, 2, 3], 3, 3)).toBe(true)
    })

    it('should reject invalid lengths', () => {
      expect(isLength('hello', 10, 20)).toBe(false)
      expect(isLength([1, 2, 3], 5, 10)).toBe(false)
    })
  })

  describe('isPast', () => {
    it('should return true for past dates', () => {
      expect(isPast(new Date('2020-01-01'))).toBe(true)
      expect(isPast('2020-01-01')).toBe(true)
      expect(isPast(0)).toBe(true)
    })

    it('should return false for future dates', () => {
      expect(isPast(new Date('2030-01-01'))).toBe(false)
    })
  })

  describe('isFuture', () => {
    it('should return true for future dates', () => {
      expect(isFuture(new Date('2030-01-01'))).toBe(true)
      expect(isFuture('2030-01-01')).toBe(true)
    })

    it('should return false for past dates', () => {
      expect(isFuture(new Date('2020-01-01'))).toBe(false)
      expect(isFuture(0)).toBe(false)
    })
  })

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2024-01-15T10:00:00')
      const date2 = new Date('2024-01-15T15:00:00')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different days', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-01-16')
      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('should handle string dates', () => {
      expect(isSameDay('2024-01-15', '2024-01-15')).toBe(true)
      expect(isSameDay('2024-01-15', '2024-01-16')).toBe(false)
    })

    it('should handle timestamps', () => {
      const date1 = new Date('2024-01-15T10:00:00').getTime()
      const date2 = new Date('2024-01-15T15:00:00').getTime()
      expect(isSameDay(date1, date2)).toBe(true)
    })
  })
})
