import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

type LocationCreate = components['schemas']['LocationCreate']
type LocationUpdate = components['schemas']['LocationUpdate']

const LOCATIONS_KEY = ['locations']

export function useLocations() {
  return useQuery({
    queryKey: LOCATIONS_KEY,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/v1/locations')
      if (error) throw error
      return data!.data
    },
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: LocationCreate) => {
      const { data, error } = await api.POST('/api/v1/locations', { body })
      if (error) throw error
      return data!.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY })
    },
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string
      body: LocationUpdate
    }) => {
      const { data, error } = await api.PUT('/api/v1/locations/{location_id}', {
        params: { path: { location_id: id } },
        body,
      })
      if (error) throw error
      return data!.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY })
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/v1/locations/{location_id}', {
        params: { path: { location_id: id } },
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY })
    },
  })
}
