/**
 * Core type definitions for Filact
 */

export interface FilactConfig {
  version: string
}

export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface BaseModel {
  id: string | number
}
