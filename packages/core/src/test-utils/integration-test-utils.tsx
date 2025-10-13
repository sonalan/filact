/**
 * Integration Test Utils
 * Helpers for integration testing with providers
 */

import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRestDataProvider } from '../providers/rest'
import type { DataProvider } from '../providers/types'

/**
 * Create a fresh QueryClient for each test
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Create a test data provider
 */
export function createTestDataProvider(): DataProvider {
  return createRestDataProvider({
    baseURL: 'https://api.example.com',
  })
}

/**
 * Wrapper component with all providers
 */
interface AllProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
  dataProvider?: DataProvider
}

export function AllProviders({
  children,
  queryClient = createTestQueryClient(),
}: AllProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  dataProvider?: DataProvider
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { queryClient, dataProvider, ...renderOptions } = options || {}

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders queryClient={queryClient} dataProvider={dataProvider}>
      {children}
    </AllProviders>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: queryClient || createTestQueryClient(),
  }
}

/**
 * Wait for query to finish loading
 */
export async function waitForLoadingToFinish() {
  // Wait for loading states to resolve
  await new Promise((resolve) => setTimeout(resolve, 100))
}

/**
 * Helper to create mock form data
 */
export function createMockFormData(overrides = {}) {
  return {
    name: 'Test User',
    email: 'test@example.com',
    status: 'active',
    ...overrides,
  }
}

/**
 * Helper to create mock user
 */
export interface MockUser {
  id: string
  name: string
  email: string
  status: string
}

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    status: 'active',
    ...overrides,
  }
}

/**
 * Helper to create mock post
 */
export interface MockPost {
  id: string
  title: string
  content: string
  userId: string
}

export function createMockPost(overrides: Partial<MockPost> = {}): MockPost {
  return {
    id: '1',
    title: 'Test Post',
    content: 'Test content',
    userId: '1',
    ...overrides,
  }
}
