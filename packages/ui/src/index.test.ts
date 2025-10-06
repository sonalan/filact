import { describe, it, expect } from 'vitest'
import { version } from './index'

describe('@filact/ui', () => {
  it('should export version', () => {
    expect(version).toBe('0.1.0')
  })

  it('should have correct version format', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
