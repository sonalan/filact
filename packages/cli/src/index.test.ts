import { describe, it, expect } from 'vitest'
import { version, getVersion, greet } from './index'

describe('@filact/cli', () => {
  describe('version', () => {
    it('should export version', () => {
      expect(version).toBe('0.1.0')
    })

    it('should have correct version format', () => {
      expect(version).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  describe('getVersion', () => {
    it('should return version string', () => {
      expect(getVersion()).toBe('0.1.0')
    })
  })

  describe('greet', () => {
    it('should return greeting message', () => {
      const result = greet('Developer')
      expect(result).toBe('Hello, Developer! Welcome to Filact CLI.')
    })

    it('should handle different names', () => {
      expect(greet('Alice')).toContain('Alice')
      expect(greet('Bob')).toContain('Bob')
    })
  })
})
