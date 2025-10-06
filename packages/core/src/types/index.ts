/**
 * Core type definitions for Filact
 */

export interface FilactConfig {
  version: string
}

export type Status = 'idle' | 'loading' | 'success' | 'error'

// Re-export all type definitions
export * from './resource'
export * from './form'
export * from './table'
export * from './action'
