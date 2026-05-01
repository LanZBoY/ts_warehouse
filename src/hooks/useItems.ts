import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

type ItemCreate = components['schemas']['ItemCreate']
type ItemUpdate = components['schemas']['ItemUpdate']

const ITEMS_KEY = ['items']

export function useItems() {
  return useQuery({
    queryKey: ITEMS_KEY,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/v1/items')
      if (error) throw error
      return data!.data
    },
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: ItemCreate) => {
      const { data, error } = await api.POST('/api/v1/items', { body })
      if (error) throw error
      return data!.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: ItemUpdate }) => {
      const { data, error } = await api.PUT('/api/v1/items/{item_id}', {
        params: { path: { item_id: id } },
        body,
      })
      if (error) throw error
      return data!.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/v1/items/{item_id}', {
        params: { path: { item_id: id } },
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY })
    },
  })
}
