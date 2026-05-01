import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { userRoleLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  end?: boolean
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: '總覽', end: true },
  { to: '/items', label: '物品' },
  { to: '/locations', label: '儲位' },
  { to: '/stock', label: '庫存' },
  { to: '/users', label: '使用者', adminOnly: true },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r bg-muted/30 p-4">
        <h1 className="mb-6 text-lg font-bold">PyWarehouse</h1>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems
            .filter(item => !item.adminOnly || user?.role === 'ADMIN')
            .map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="mt-4 border-t pt-4">
          <div className="mb-2 px-3 text-xs text-muted-foreground">
            <div>{user?.username}</div>
            <div className="text-[10px]">
              {user && userRoleLabel(user.role)}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut /> 登出
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
