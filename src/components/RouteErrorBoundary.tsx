import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { ErrorFallback } from '@/components/ErrorFallback'

/**
 * React Router 的錯誤接住點。
 * Route 元件、loader、action 的錯誤會被它接到。
 */
export function RouteErrorBoundary() {
  const routeError = useRouteError()

  // 把 router 的各種 error 形狀統一成 Error
  const error = normalizeError(routeError)

  return (
    <ErrorFallback
      error={error}
      onReload={() => window.location.reload()}
    />
  )
}

function normalizeError(err: unknown): Error {
  if (err instanceof Error) return err
  if (isRouteErrorResponse(err)) {
    return new Error(`${err.status} ${err.statusText}: ${err.data ?? ''}`)
  }
  return new Error(typeof err === 'string' ? err : JSON.stringify(err))
}
