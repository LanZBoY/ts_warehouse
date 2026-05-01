import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from './schema'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}
export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function clearAllTokens(): void {
  clearToken()
  clearRefreshToken()
}

// 觸發給 AuthProvider 接的事件名稱
export const AUTH_EXPIRED_EVENT = 'auth:expired'

// ---- single-flight refresh -----------------------------------------------
// 同時間 N 個請求 401,只能有一個 refresh 在跑,其他人 await 同一個 promise
let refreshPromise: Promise<string | null> | null = null

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    // 用原生 fetch,避免走 middleware 造成無限迴圈
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      data?: { access_token: string; refresh_token: string }
    }
    if (!json.data) return null
    setToken(json.data.access_token)
    setRefreshToken(json.data.refresh_token)
    return json.data.access_token
  } catch {
    return null
  }
}

function refreshOrWait(): Promise<string | null> {
  if (refreshPromise) return refreshPromise
  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

// ---- middleware ----------------------------------------------------------
// 為了能在 401 時重發 POST/PUT,要先把 request body 存起來
// (Request 的 body 是 stream,送出後就消費完了)
const savedBodies = new WeakMap<Request, string>()

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }

    // GET / HEAD 沒 body,不用存
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const cloned = request.clone()
        const body = await cloned.text()
        if (body) savedBodies.set(request, body)
      } catch {
        // 某些 body 形式無法 clone(stream 等),忽略
      }
    }

    return request
  },

  async onResponse({ request, response }) {
    // 不是 401 → 直接放行
    if (response.status !== 401) return

    // 別在 auth 相關 endpoint 觸發 refresh(會無限迴圈)
    if (
      request.url.includes('/auth/refresh') ||
      request.url.includes('/auth/login')
    ) {
      return
    }

    const newToken = await refreshOrWait()

    if (!newToken) {
      // refresh 失敗 → 通知 AuthProvider 把使用者踢出去
      clearAllTokens()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
      return // 讓原本的 401 response 傳到上游
    }

    // refresh 成功 → 帶新 token 重發原請求
    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${newToken}`)

    const savedBody = savedBodies.get(request)

    return fetch(request.url, {
      method: request.method,
      headers,
      body: savedBody,
    })
  },
}

export const api = createClient<paths>({ baseUrl: BASE_URL })
api.use(authMiddleware)
