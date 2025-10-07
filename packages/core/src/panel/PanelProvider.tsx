/**
 * Panel Provider
 * React context provider for panel configuration
 */

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { PanelConfig, PanelContextValue, CustomPage } from './types'
import type { ResourceConfig } from '../resources/builder'
import type { BaseModel } from '../types/resource'

/**
 * Panel context
 */
const PanelContext = createContext<PanelContextValue | null>(null)

/**
 * Panel provider props
 */
export interface PanelProviderProps {
  /** Panel configuration */
  config: PanelConfig

  /** Children components */
  children: ReactNode

  /** Custom query client */
  queryClient?: QueryClient
}

/**
 * Panel provider component
 */
export function PanelProvider({ config, children, queryClient: customQueryClient }: PanelProviderProps) {
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Create or use provided query client
  const queryClient = useMemo(
    () =>
      customQueryClient ||
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      }),
    [customQueryClient]
  )

  // Build resource map
  const resources = useMemo(() => {
    const map = new Map<string, ResourceConfig<any>>()
    config.resources?.forEach((resource) => {
      map.set(resource.model.name, resource)
    })
    return map
  }, [config.resources])

  // Build pages map
  const pages = useMemo(() => {
    const map = new Map<string, CustomPage>()
    config.pages?.forEach((page) => {
      map.set(page.name, page)
    })
    return map
  }, [config.pages])

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!config.auth?.checkAuth) {
        setIsAuthenticated(true)
        setIsCheckingAuth(false)
        return
      }

      try {
        const authenticated = await config.auth.checkAuth()
        setIsAuthenticated(authenticated)

        if (authenticated && config.auth.getUser) {
          const userData = await config.auth.getUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [config.auth])

  // Logout handler
  const logout = async () => {
    if (config.auth?.logout) {
      await config.auth.logout()
    }
    setUser(null)
    setIsAuthenticated(false)
  }

  // Refresh handler
  const refresh = () => {
    queryClient.invalidateQueries()
  }

  const contextValue: PanelContextValue = useMemo(
    () => ({
      config,
      resources,
      pages,
      user,
      isAuthenticated,
      logout,
      refresh,
    }),
    [config, resources, pages, user, isAuthenticated]
  )

  // Show loading during auth check
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading...</div>
          <div className="text-sm text-gray-500">Initializing {config.name}</div>
        </div>
      </div>
    )
  }

  return (
    <PanelContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PanelContext.Provider>
  )
}

/**
 * Hook to access panel context
 */
export function usePanel(): PanelContextValue {
  const context = useContext(PanelContext)
  if (!context) {
    throw new Error('usePanel must be used within a PanelProvider')
  }
  return context
}

/**
 * Hook to get a specific resource by name
 */
export function useResource<TModel extends BaseModel>(name: string): ResourceConfig<TModel> | undefined {
  const { resources } = usePanel()
  return resources.get(name) as ResourceConfig<TModel> | undefined
}

/**
 * Hook to get all registered resources
 */
export function useResources(): ResourceConfig<any>[] {
  const { resources } = usePanel()
  return Array.from(resources.values())
}

/**
 * Hook to get a specific page by name
 */
export function usePage(name: string): CustomPage | undefined {
  const { pages } = usePanel()
  return pages.get(name)
}

/**
 * Hook to get all custom pages
 */
export function usePages(): CustomPage[] {
  const { pages } = usePanel()
  return Array.from(pages.values())
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user, isAuthenticated } = usePanel()
  return { user, isAuthenticated }
}

/**
 * Hook to get panel configuration
 */
export function usePanelConfig(): PanelConfig {
  const { config } = usePanel()
  return config
}
