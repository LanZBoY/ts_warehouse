/**
 * 從 API error 物件抽出可顯示給使用者的錯誤訊息。
 * 容錯所有可能形狀:string、{detail: string}、{detail: ValidationError[]}、其他。
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback

  if (typeof error === 'string') return error

  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>
    const detail = obj.detail

    if (typeof detail === 'string') return detail

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as Record<string, unknown>
      if (typeof first?.msg === 'string') return first.msg
    }

    if (typeof obj.message === 'string') return obj.message
  }

  return fallback
}
