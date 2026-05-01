import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  error: Error | null
  onRetry?: () => void
  onReload?: () => void
}

export function ErrorFallback({ error, onRetry, onReload }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          <h2 className="text-lg font-semibold">發生錯誤</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          畫面渲染時發生未預期錯誤。可以試試重新嘗試,或重新整理頁面。
        </p>
        {import.meta.env.DEV && error && (
          <pre className="mb-4 max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
            {error.message}
            {error.stack && '\n\n' + error.stack}
          </pre>
        )}
        <div className="flex gap-2">
          {onRetry && <Button onClick={onRetry}>重新嘗試</Button>}
          <Button
            variant={onRetry ? 'outline' : 'default'}
            onClick={onReload ?? (() => window.location.reload())}
          >
            重新整理頁面
          </Button>
        </div>
      </div>
    </div>
  )
}
