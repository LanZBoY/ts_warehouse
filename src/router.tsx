import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RequireRole } from '@/components/RequireRole'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import { Login } from '@/routes/Login'

// 每個 route 的 lazy 寫法:點到才載入該檔案,變成獨立 chunk。
// React Router v7 的 lazy() 接受 async 函式,return { Component } 或 { element }。
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('@/routes/Dashboard')).Dashboard,
        }),
      },
      {
        path: 'items',
        lazy: async () => ({
          Component: (await import('@/routes/Items')).Items,
        }),
      },
      {
        path: 'items/:id',
        lazy: async () => ({
          Component: (await import('@/routes/ItemDetail')).ItemDetail,
        }),
      },
      {
        path: 'locations',
        lazy: async () => ({
          Component: (await import('@/routes/Locations')).Locations,
        }),
      },
      {
        path: 'locations/:id',
        lazy: async () => ({
          Component: (await import('@/routes/LocationDetail')).LocationDetail,
        }),
      },
      {
        path: 'stock',
        lazy: async () => ({
          Component: (await import('@/routes/Stock')).Stock,
        }),
      },
      {
        path: 'users',
        lazy: async () => {
          const { Users } = await import('@/routes/Users')
          // Users 要包 RequireRole,所以用 element 而不是 Component
          return {
            element: (
              <RequireRole role="ADMIN">
                <Users />
              </RequireRole>
            ),
          }
        },
      },
    ],
  },
])
