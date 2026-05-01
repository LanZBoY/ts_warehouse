import { useEffect, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  AUTH_EXPIRED_EVENT,
  clearAllTokens,
  getRefreshToken,
  getToken,
  setRefreshToken,
  setToken as writeToken,
} from '@/api/client'
import { AuthContext } from '@/hooks/useAuth'

const CURRENT_USER_KEY = ['currentUser']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken())
  const queryClient = useQueryClient()

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/v1/users/me')
      if (error) {
        clearAllTokens()
        setTokenState(null)
        throw error
      }
      return data?.data ?? null
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  })

  // middleware 偵測到 refresh 失敗 → 觸發事件 → 這裡接住
  useEffect(() => {
    const handleExpired = () => {
      // tokens 已經被 middleware 清掉
      setTokenState(null)
      queryClient.clear()
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired)
  }, [queryClient])

  const login = async (username: string, password: string) => {
    const { data, error } = await api.POST('/api/v1/auth/login', {
      body: { username, password },
    })
    if (error) throw error
    const tokens = data!.data
    writeToken(tokens.access_token)
    setRefreshToken(tokens.refresh_token)
    setTokenState(tokens.access_token)
    await refetch()
  }

  const logout = async () => {
    // 嘗試通知後端撤銷 refresh_token(失敗也沒差,本地照樣清掉)
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await api.POST('/api/v1/auth/logout', {
          body: { refresh_token: refreshToken },
        })
      } catch {
        // 忽略 — 本地登出永遠成功
      }
    }
    clearAllTokens()
    setTokenState(null)
    queryClient.clear()
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: !!token && isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
