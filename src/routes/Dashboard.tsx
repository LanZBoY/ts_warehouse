import { useMemo } from 'react'
import { Boxes, MapPin, Package, AlertTriangle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useItems } from '@/hooks/useItems'
import { useLocations } from '@/hooks/useLocations'
import { useStockBalances, useStockMovements } from '@/hooks/useStock'
import { movementTypeLabel } from '@/lib/labels'

const LOW_STOCK_THRESHOLD = 5

export function Dashboard() {
  const { data: items } = useItems()
  const { data: locations } = useLocations()
  const { data: balances } = useStockBalances()
  const { data: movements } = useStockMovements()

  // 把 id → name 的 map 建起來,讓表格能顯示名稱
  const itemMap = useMemo(
    () => new Map(items?.map(i => [i.id, i.name]) ?? []),
    [items],
  )
  const locationMap = useMemo(
    () => new Map(locations?.map(l => [l.id, l.name]) ?? []),
    [locations],
  )

  // 總庫存量 = 所有 balance 的 quantity 加總
  const totalQuantity = useMemo(
    () => balances?.reduce((sum, b) => sum + b.quantity, 0) ?? 0,
    [balances],
  )

  // 低庫存(≤ 閾值且 > 0,= 0 的算缺貨另外處理沒做)
  const lowStock = useMemo(
    () =>
      balances
        ?.filter(b => b.quantity > 0 && b.quantity <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.quantity - b.quantity) ?? [],
    [balances],
  )

  // 最近 5 筆異動(假設 API 已按時間排序;如果沒有要自己排)
  const recentMovements = useMemo(
    () =>
      [...(movements ?? [])]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )
        .slice(0, 5),
    [movements],
  )

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">總覽</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={<Package className="size-5" />}
          label="物品種類"
          value={items?.length ?? '—'}
        />
        <StatCard
          icon={<MapPin className="size-5" />}
          label="儲位數"
          value={locations?.length ?? '—'}
        />
        <StatCard
          icon={<Boxes className="size-5" />}
          label="總庫存量"
          value={balances ? totalQuantity : '—'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              低庫存警示
            </CardTitle>
            <CardDescription>
              數量 ≤ {LOW_STOCK_THRESHOLD} 的庫存
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">無低庫存項目 ✓</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {lowStock.map(b => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <span>
                      <span className="font-medium">
                        {itemMap.get(b.item_id) ?? b.item_id}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        @ {locationMap.get(b.location_id) ?? b.location_id}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums text-amber-600">
                      {b.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近異動</CardTitle>
            <CardDescription>近 5 筆庫存異動紀錄</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMovements.length === 0 ? (
              <p className="text-sm text-muted-foreground">尚無異動</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {recentMovements.map(m => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <span className="flex-1 truncate">
                      <span className="text-muted-foreground">
                        {new Date(m.created_at).toLocaleString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="mx-2">
                        {movementTypeLabel(m.movement_type)}
                      </span>
                      <span>{itemMap.get(m.item_id) ?? '?'}</span>
                      <span className="text-muted-foreground">
                        {' @ '}
                        {locationMap.get(m.location_id) ?? '?'}
                      </span>
                    </span>
                    <span
                      className={
                        'ml-2 font-semibold tabular-nums ' +
                        (m.change_qty > 0
                          ? 'text-green-600'
                          : m.change_qty < 0
                            ? 'text-red-600'
                            : '')
                      }
                    >
                      {m.change_qty > 0 ? `+${m.change_qty}` : m.change_qty}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  )
}
