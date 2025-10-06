#!/usr/bin/env node

/**
 * Filact CLI
 * Code generation and scaffolding tool
 */

export const version = '0.1.0'

export function getVersion(): string {
  return version
}

export function greet(name: string): string {
  return `Hello, ${name}! Welcome to Filact CLI.`
}
