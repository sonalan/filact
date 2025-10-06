import { describe, it, expect } from 'vitest'
import type { FilactConfig, Status, BaseModel } from './index'

describe('Core Types', () => {
  it('should accept valid FilactConfig', () => {
    const config: FilactConfig = {
      version: '0.1.0',
    }
    expect(config.version).toBe('0.1.0')
  })

  it('should accept valid Status values', () => {
    const statuses: Status[] = ['idle', 'loading', 'success', 'error']
    expect(statuses).toHaveLength(4)
  })

  it('should accept valid BaseModel', () => {
    const model1: BaseModel = { id: '123' }
    const model2: BaseModel = { id: 456 }
    expect(model1.id).toBe('123')
    expect(model2.id).toBe(456)
  })
})
