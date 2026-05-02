# ts_warehouse

庫存系統前端頁面，使用 React 19 + TypeScript + Vite 建置。

## 功能模組

- 登入 / 認證（JWT + Refresh Token，存於 localStorage）
- Dashboard 總覽（含低庫存警示）
- 物料管理（Items）
- 儲位管理（Locations）
- 庫存管理（Stock，含庫存餘額與異動紀錄）
- 使用者管理（Users，含角色編輯與密碼重設）

## 啟動方式

### 前置需求

- Node.js（建議 20+）
- pnpm（專案使用 `pnpm-lock.yaml`）
- 後端 API：預設指向 `http://127.0.0.1:8000`

### 安裝與啟動

```bash
# 安裝相依套件
pnpm install

# 啟動開發伺服器
pnpm dev

# 建置正式版
pnpm build

# 預覽建置結果
pnpm preview

# 執行 ESLint
pnpm lint

# 從後端 OpenAPI 重新產生型別 (需先啟動後端)
pnpm types
```

### 環境變數

於專案根目錄建立 `.env` 或 `.env.local`：

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

未設定時預設為 `http://127.0.0.1:8000`。

## 使用套件

### 核心框架

| 套件 | 用途 |
| --- | --- |
| `react` / `react-dom` | UI 框架（v19） |
| `typescript` | 型別系統 |
| `vite` / `@vitejs/plugin-react` | 開發 / 建置工具 |
| `react-router-dom` | 路由（v7，採 lazy-loaded routes） |

### 資料層

| 套件 | 用途 |
| --- | --- |
| `@tanstack/react-query` | Server state 管理與快取 |
| `@tanstack/react-query-devtools` | React Query 除錯工具 |
| `openapi-fetch` | 型別安全的 fetch client |
| `openapi-typescript` | 由後端 OpenAPI schema 產生 TS 型別 |

### 表單與驗證

| 套件 | 用途 |
| --- | --- |
| `react-hook-form` | 表單狀態管理 |
| `@hookform/resolvers` | 表單驗證整合 |
| `zod` | Schema 驗證 |

### UI 與樣式

| 套件 | 用途 |
| --- | --- |
| `tailwindcss` / `@tailwindcss/vite` | CSS framework（v4） |
| `tw-animate-css` | Tailwind 動畫工具 |
| `shadcn` | UI component 產生器 |
| `@base-ui/react` | 無樣式 UI primitives |
| `lucide-react` | Icon 套件 |
| `class-variance-authority` / `clsx` / `tailwind-merge` | className 組合工具 |
| `next-themes` | 深 / 淺色主題切換 |
| `sonner` | Toast 通知 |
| `@fontsource-variable/geist` | Geist 字型 |

### 開發工具

| 套件 | 用途 |
| --- | --- |
| `eslint` / `typescript-eslint` | 程式碼檢查 |
| `eslint-plugin-react-hooks` / `eslint-plugin-react-refresh` | React 相關 lint 規則 |

## 專案結構

```
src/
├── api/          # API client 與 OpenAPI 產生的型別
├── assets/       # 靜態資源
├── components/   # 共用元件
├── hooks/        # 自訂 hooks
├── layouts/      # 版面配置
├── lib/          # 工具函式
├── providers/    # Context providers
├── routes/       # 各頁面路由
├── router.tsx    # 路由設定
├── main.tsx      # 進入點
└── index.css     # 全域樣式
```

路徑別名 `@` 指向 `src/`。
