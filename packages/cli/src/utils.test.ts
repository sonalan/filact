import { describe, it, expect } from 'vitest'
import {
  pascalCase,
  camelCase,
  pluralize,
  kebabCase,
  snakeCase,
} from './utils'

describe('CLI Utils', () => {
  describe('pascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(pascalCase('hello-world')).toBe('HelloWorld')
      expect(pascalCase('hello_world')).toBe('HelloWorld')
      expect(pascalCase('hello world')).toBe('HelloWorld')
      expect(pascalCase('helloWorld')).toBe('Helloworld')
    })

    it('should handle single words', () => {
      expect(pascalCase('hello')).toBe('Hello')
      expect(pascalCase('HELLO')).toBe('Hello')
    })

    it('should handle empty strings', () => {
      expect(pascalCase('')).toBe('')
    })
  })

  describe('camelCase', () => {
    it('should convert to camelCase', () => {
      expect(camelCase('hello-world')).toBe('helloWorld')
      expect(camelCase('hello_world')).toBe('helloWorld')
      expect(camelCase('hello world')).toBe('helloWorld')
      expect(camelCase('HelloWorld')).toBe('helloworld')
    })

    it('should handle single words', () => {
      expect(camelCase('hello')).toBe('hello')
      expect(camelCase('HELLO')).toBe('hello')
    })

    it('should handle empty strings', () => {
      expect(camelCase('')).toBe('')
    })
  })

  describe('pluralize', () => {
    it('should pluralize words ending in y', () => {
      expect(pluralize('category')).toBe('categories')
      expect(pluralize('company')).toBe('companies')
    })

    it('should pluralize words ending in s, x, ch, sh', () => {
      expect(pluralize('class')).toBe('classes')
      expect(pluralize('box')).toBe('boxes')
      expect(pluralize('church')).toBe('churches')
      expect(pluralize('dish')).toBe('dishes')
    })

    it('should pluralize regular words', () => {
      expect(pluralize('user')).toBe('users')
      expect(pluralize('post')).toBe('posts')
      expect(pluralize('comment')).toBe('comments')
    })
  })

  describe('kebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world')
      expect(kebabCase('HelloWorld')).toBe('hello-world')
      expect(kebabCase('hello world')).toBe('hello-world')
      expect(kebabCase('hello_world')).toBe('hello-world')
    })

    it('should handle single words', () => {
      expect(kebabCase('hello')).toBe('hello')
      expect(kebabCase('HELLO')).toBe('hello')
    })
  })

  describe('snakeCase', () => {
    it('should convert to snake_case', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world')
      expect(snakeCase('HelloWorld')).toBe('hello_world')
      expect(snakeCase('hello world')).toBe('hello_world')
      expect(snakeCase('hello-world')).toBe('hello_world')
    })

    it('should handle single words', () => {
      expect(snakeCase('hello')).toBe('hello')
      expect(snakeCase('HELLO')).toBe('hello')
    })
  })
})
