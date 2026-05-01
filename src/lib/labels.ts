import type { components } from '@/api/schema'

type UserRole = components['schemas']['UserRole']
type StockMovementType = components['schemas']['StockMovementType']

export function userRoleLabel(role: UserRole): string {
  return role === 'ADMIN' ? '管理員' : '一般使用者'
}

export function movementTypeLabel(type: StockMovementType): string {
  switch (type) {
    case 'INBOUND':
      return '入庫'
    case 'OUTBOUND':
      return '出庫'
    case 'ADJUST':
      return '盤點'
  }
}
