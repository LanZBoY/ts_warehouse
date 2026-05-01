import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { components } from '@/api/schema'

type UserRole = components['schemas']['UserRole']

interface Props {
  role: UserRole
  children: ReactNode
}

/**
 * 角色守衛:角色不符就導回首頁。
 * 注意:這只是 UX,真正的權限檢查必須在後端。
 */
export function RequireRole({ role, children }: Props) {
  const { user } = useAuth()
  if (user?.role !== role) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
