/**
 * Resource Data Hooks
 * TanStack Query hooks for resource data management
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query'
import type { BaseModel } from '../types/resource'
import type { ResourceConfig } from '../resources/builder'
import type { GetListParams, GetListResult } from '../providers/types'

/**
 * Hook for fetching a list of records
 */
export function useResourceList<TModel extends BaseModel>(
  config: ResourceConfig<TModel>,
  params?: GetListParams
): UseQueryResult<GetListResult<TModel>> {
  return useQuery({
    queryKey: [config.model.endpoint, 'list', params],
    queryFn: () => config.provider.getList<TModel>(config.model.endpoint, params || {}),
  })
}

/**
 * Hook for fetching a single record
 */
export function useResourceOne<TModel extends BaseModel>(
  config: ResourceConfig<TModel>,
  id: string | number | undefined
): UseQueryResult<TModel> {
  return useQuery({
    queryKey: [config.model.endpoint, 'one', id],
    queryFn: () => {
      if (!id) throw new Error('ID is required')
      return config.provider.getOne<TModel>(config.model.endpoint, id)
    },
    enabled: !!id,
  })
}

/**
 * Hook for creating a record
 */
export function useResourceCreate<TModel extends BaseModel>(
  config: ResourceConfig<TModel>
): UseMutationResult<TModel, Error, Partial<TModel>> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<TModel>) => {
      // Run beforeCreate hook
      let processedData = data
      if (config.hooks?.beforeCreate) {
        const result = await config.hooks.beforeCreate(data)
        if (result) {
          processedData = result as Partial<TModel>
        }
      }

      const created = await config.provider.create<TModel>(config.model.endpoint, { data: processedData })

      // Run afterCreate hook
      if (config.hooks?.afterCreate) {
        await config.hooks.afterCreate(created)
      }

      return created
    },
    onSuccess: () => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [config.model.endpoint, 'list'] })
    },
  })
}

/**
 * Hook for updating a record
 */
export function useResourceUpdate<TModel extends BaseModel>(
  config: ResourceConfig<TModel>
): UseMutationResult<TModel, Error, { id: string | number; data: Partial<TModel> }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<TModel> }) => {
      // Get current record for beforeUpdate hook
      const current = await config.provider.getOne<TModel>(config.model.endpoint, id)

      // Run beforeUpdate hook
      let processedData = data
      if (config.hooks?.beforeUpdate) {
        const result = await config.hooks.beforeUpdate(current, data)
        if (result) {
          processedData = result as Partial<TModel>
        }
      }

      const updated = await config.provider.update<TModel>(config.model.endpoint, { id, data: processedData })

      // Run afterUpdate hook
      if (config.hooks?.afterUpdate) {
        await config.hooks.afterUpdate(updated)
      }

      return updated
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [config.model.endpoint, 'list'] })
      queryClient.invalidateQueries({ queryKey: [config.model.endpoint, 'one', variables.id] })
    },
  })
}

/**
 * Hook for deleting a record
 */
export function useResourceDelete<TModel extends BaseModel>(
  config: ResourceConfig<TModel>
): UseMutationResult<void, Error, string | number> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string | number) => {
      // Get record for beforeDelete hook
      const record = await config.provider.getOne<TModel>(config.model.endpoint, id)

      // Run beforeDelete hook
      if (config.hooks?.beforeDelete) {
        const canDelete = await config.hooks.beforeDelete(record)
        if (canDelete === false) {
          throw new Error('Delete operation cancelled by hook')
        }
      }

      await config.provider.delete(config.model.endpoint, { id })

      // Run afterDelete hook
      if (config.hooks?.afterDelete) {
        await config.hooks.afterDelete(id)
      }
    },
    onSuccess: () => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [config.model.endpoint, 'list'] })
    },
  })
}

/**
 * Hook for bulk delete
 */
export function useResourceDeleteMany<TModel extends BaseModel>(
  config: ResourceConfig<TModel>
): UseMutationResult<void, Error, (string | number)[]> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      await config.provider.deleteMany(config.model.endpoint, {
        filter: {
          [config.model.primaryKey || 'id']: { in: ids },
        },
      })
    },
    onSuccess: () => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [config.model.endpoint, 'list'] })
    },
  })
}
