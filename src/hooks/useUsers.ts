import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

type CreateUserRequest = components['schemas']['CreateUserRequest']
type UserUpdate = components['schemas']['UserUpdate']

const USERS_KEY = ['users']

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/v1/users')
      if (error) throw error
      return data!.data
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateUserRequest) => {
      const { data, error } = await api.POST('/api/v1/users', { body })
      if (error) throw error
      return data!.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UserUpdate }) => {
      const { data, error } = await api.PUT('/api/v1/users/{user_id}', {
        params: { path: { user_id: id } },
        body,
      })
      if (error) throw error
      return data!.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/v1/users/{user_id}', {
        params: { path: { user_id: id } },
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({
      id,
      newPassword,
    }: {
      id: string
      newPassword: string
    }) => {
      const { error } = await api.POST(
        '/api/v1/users/{user_id}/reset-password',
        {
          params: { path: { user_id: id } },
          body: { new_password: newPassword },
        },
      )
      if (error) throw error
    },
    // 重設密碼不影響 user 列表,不需要 invalidate
  })
}
