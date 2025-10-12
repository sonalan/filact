import { describe, it, expect } from 'vitest'
import {
  truncate,
  capitalize,
  titleCase,
  camelCase,
  pascalCase,
  snakeCase,
  kebabCase,
  slugify,
  cleanWhitespace,
  escapeHtml,
  unescapeHtml,
  randomString,
  pluralize,
  getInitials,
  maskString,
} from './string'

describe('string utilities', () => {
  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
    })

    it('should not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('should use custom suffix', () => {
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…')
    })

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })

    it('should handle empty strings', () => {
      expect(truncate('', 5)).toBe('')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello world')).toBe('Hello world')
    })

    it('should not change already capitalized string', () => {
      expect(capitalize('HELLO')).toBe('HELLO')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('titleCase', () => {
    it('should capitalize each word', () => {
      expect(titleCase('hello world')).toBe('Hello World')
    })

    it('should handle multiple words', () => {
      expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox')
    })

    it('should handle single word', () => {
      expect(titleCase('hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(titleCase('')).toBe('')
    })

    it('should handle multiple spaces', () => {
      expect(titleCase('hello  world')).toBe('Hello  World')
    })
  })

  describe('camelCase', () => {
    it('should convert spaces to camelCase', () => {
      expect(camelCase('hello world')).toBe('helloWorld')
    })

    it('should convert hyphens to camelCase', () => {
      expect(camelCase('hello-world')).toBe('helloWorld')
    })

    it('should convert underscores to camelCase', () => {
      expect(camelCase('hello_world')).toBe('helloWorld')
    })

    it('should handle mixed delimiters', () => {
      expect(camelCase('hello-world_test case')).toBe('helloWorldTestCase')
    })

    it('should lowercase first character of PascalCase', () => {
      expect(camelCase('HelloWorld')).toBe('helloWorld')
    })

    it('should handle single word', () => {
      expect(camelCase('hello')).toBe('hello')
    })
  })

  describe('pascalCase', () => {
    it('should convert spaces to PascalCase', () => {
      expect(pascalCase('hello world')).toBe('HelloWorld')
    })

    it('should convert hyphens to PascalCase', () => {
      expect(pascalCase('hello-world')).toBe('HelloWorld')
    })

    it('should convert underscores to PascalCase', () => {
      expect(pascalCase('hello_world')).toBe('HelloWorld')
    })

    it('should handle single word', () => {
      expect(pascalCase('hello')).toBe('Hello')
    })

    it('should handle already PascalCase', () => {
      expect(pascalCase('HelloWorld')).toBe('HelloWorld')
    })
  })

  describe('snakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world')
    })

    it('should convert PascalCase to snake_case', () => {
      expect(snakeCase('HelloWorld')).toBe('hello_world')
    })

    it('should convert spaces to snake_case', () => {
      expect(snakeCase('hello world')).toBe('hello_world')
    })

    it('should handle hyphens', () => {
      expect(snakeCase('hello-world')).toBe('hello_world')
    })

    it('should handle multiple underscores', () => {
      expect(snakeCase('hello__world')).toBe('hello_world')
    })

    it('should handle single word', () => {
      expect(snakeCase('hello')).toBe('hello')
    })
  })

  describe('kebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world')
    })

    it('should convert PascalCase to kebab-case', () => {
      expect(kebabCase('HelloWorld')).toBe('hello-world')
    })

    it('should convert spaces to kebab-case', () => {
      expect(kebabCase('hello world')).toBe('hello-world')
    })

    it('should handle underscores', () => {
      expect(kebabCase('hello_world')).toBe('hello-world')
    })

    it('should handle single word', () => {
      expect(kebabCase('hello')).toBe('hello')
    })
  })

  describe('slugify', () => {
    it('should create URL-friendly slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
    })

    it('should remove special characters', () => {
      expect(slugify('Hello @#$ World!')).toBe('hello-world')
    })

    it('should handle multiple spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world')
    })

    it('should trim leading/trailing spaces', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world')
    })

    it('should handle underscores and hyphens', () => {
      expect(slugify('hello_world-test')).toBe('hello-world-test')
    })

    it('should remove leading/trailing hyphens', () => {
      expect(slugify('-hello-world-')).toBe('hello-world')
    })
  })

  describe('cleanWhitespace', () => {
    it('should remove extra spaces', () => {
      expect(cleanWhitespace('hello   world')).toBe('hello world')
    })

    it('should trim leading/trailing spaces', () => {
      expect(cleanWhitespace('  hello world  ')).toBe('hello world')
    })

    it('should handle tabs and newlines', () => {
      expect(cleanWhitespace('hello\t\nworld')).toBe('hello world')
    })

    it('should handle single space', () => {
      expect(cleanWhitespace('hello world')).toBe('hello world')
    })
  })

  describe('escapeHtml', () => {
    it('should escape HTML tags', () => {
      expect(escapeHtml('<div>Hello</div>')).toBe('&lt;div&gt;Hello&lt;/div&gt;')
    })

    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('should escape quotes', () => {
      expect(escapeHtml('Say "Hello"')).toBe('Say &quot;Hello&quot;')
    })

    it('should escape single quotes', () => {
      expect(escapeHtml("It's great")).toBe('It&#39;s great')
    })

    it('should escape multiple characters', () => {
      expect(escapeHtml('<a href="test">Link & More</a>')).toBe(
        '&lt;a href=&quot;test&quot;&gt;Link &amp; More&lt;/a&gt;'
      )
    })
  })

  describe('unescapeHtml', () => {
    it('should unescape HTML tags', () => {
      expect(unescapeHtml('&lt;div&gt;Hello&lt;/div&gt;')).toBe('<div>Hello</div>')
    })

    it('should unescape ampersands', () => {
      expect(unescapeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry')
    })

    it('should unescape quotes', () => {
      expect(unescapeHtml('Say &quot;Hello&quot;')).toBe('Say "Hello"')
    })

    it('should unescape single quotes', () => {
      expect(unescapeHtml('It&#39;s great')).toBe("It's great")
    })

    it('should unescape multiple entities', () => {
      expect(unescapeHtml('&lt;a href=&quot;test&quot;&gt;Link &amp; More&lt;/a&gt;')).toBe(
        '<a href="test">Link & More</a>'
      )
    })
  })

  describe('randomString', () => {
    it('should generate string of specified length', () => {
      const result = randomString(10)
      expect(result).toHaveLength(10)
    })

    it('should generate different strings', () => {
      const result1 = randomString(20)
      const result2 = randomString(20)
      expect(result1).not.toBe(result2)
    })

    it('should use custom character set', () => {
      const result = randomString(10, '0123456789')
      expect(result).toMatch(/^\d+$/)
    })

    it('should handle length of 1', () => {
      const result = randomString(1)
      expect(result).toHaveLength(1)
    })

    it('should only contain alphanumeric characters by default', () => {
      const result = randomString(100)
      expect(result).toMatch(/^[A-Za-z0-9]+$/)
    })
  })

  describe('pluralize', () => {
    it('should return singular for count of 1', () => {
      expect(pluralize('item', 1)).toBe('item')
    })

    it('should add s for count greater than 1', () => {
      expect(pluralize('item', 5)).toBe('items')
    })

    it('should use custom plural form', () => {
      expect(pluralize('person', 5, 'people')).toBe('people')
    })

    it('should handle count of 0', () => {
      expect(pluralize('item', 0)).toBe('items')
    })

    it('should handle negative counts', () => {
      expect(pluralize('item', -5)).toBe('items')
    })
  })

  describe('getInitials', () => {
    it('should extract initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should respect maxLength parameter', () => {
      expect(getInitials('John Middle Doe', 3)).toBe('JMD')
    })

    it('should default to 2 initials', () => {
      expect(getInitials('John Middle Last Name')).toBe('JM')
    })

    it('should handle extra spaces', () => {
      expect(getInitials('John  Doe')).toBe('JD')
    })

    it('should capitalize initials', () => {
      expect(getInitials('john doe')).toBe('JD')
    })
  })

  describe('maskString', () => {
    it('should mask middle characters', () => {
      expect(maskString('1234567890', 2, 2)).toBe('12******90')
    })

    it('should use custom mask character', () => {
      expect(maskString('1234567890', 2, 2, 'X')).toBe('12XXXXXX90')
    })

    it('should handle no visible start', () => {
      expect(maskString('1234567890', 0, 4)).toBe('******7890')
    })

    it('should handle no visible end', () => {
      expect(maskString('1234567890', 4, 0)).toBe('1234******')
    })

    it('should not mask if string is too short', () => {
      expect(maskString('123', 2, 2)).toBe('123')
    })

    it('should handle email-like masking', () => {
      expect(maskString('email@example.com', 2, 4)).toBe('em***********.com')
    })
  })
})
