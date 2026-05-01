import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

type StockMovementCreate = components['schemas']['StockMovementCreate']
type StockAdjustCreate = components['schemas']['StockAdjustCreate']

export interface StockListParams {
  item_id?: string
  location_id?: string
  skip?: number
  limit?: number
}

const BALANCES_KEY_BASE = ['stockBalances'] as const
const MOVEMENTS_KEY_BASE = ['stockMovements'] as const

export function useStockBalances(params?: StockListParams) {
  return useQuery({
    queryKey: [...BALANCES_KEY_BASE, params ?? {}],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/v1/stock/balances', {
        params: { query: { limit: 100, ...params } }, // 預設拉 100 筆,避免被預設 10 截斷
      })
      if (error) throw error
      return data!.data
    },
  })
}

export function useStockMovements(params?: StockListParams) {
  return useQuery({
    queryKey: [...MOVEMENTS_KEY_BASE, params ?? {}],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/v1/stock/movements', {
        params: { query: { limit: 100, ...params } },
      })
      if (error) throw error
      return data!.data
    },
  })
}

// invalidate 用 prefix,所有 filter 變體一起重抓
function invalidateStockQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: BALANCES_KEY_BASE })
  queryClient.invalidateQueries({ queryKey: MOVEMENTS_KEY_BASE })
}

export function useInbound() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: StockMovementCreate) => {
      const { data, error } = await api.POST('/api/v1/stock/inbound', { body })
      if (error) throw error
      return data!.data
    },
    onSuccess: () => invalidateStockQueries(queryClient),
  })
}

export function useOutbound() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: StockMovementCreate) => {
      const { data, error } = await api.POST('/api/v1/stock/outbound', { body })
      if (error) throw error
      return data!.data
    },
    onSuccess: () => invalidateStockQueries(queryClient),
  })
}

export function useAdjust() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: StockAdjustCreate) => {
      const { data, error } = await api.POST('/api/v1/stock/adjust', { body })
      if (error) throw error
      return data!.data
    },
    onSuccess: () => invalidateStockQueries(queryClient),
  })
}
