import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useLocations } from '@/hooks/useLocations'
import { useItems } from '@/hooks/useItems'
import { useStockBalances, useStockMovements } from '@/hooks/useStock'
import { movementTypeLabel } from '@/lib/labels'

export function LocationDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: locations, isLoading: locationsLoading } = useLocations()
  const { data: items } = useItems()
  // 直接讓後端 filter,不要前端 filter
  const { data: balances } = useStockBalances(
    id ? { location_id: id } : undefined,
  )
  const { data: movements } = useStockMovements(
    id ? { location_id: id } : undefined,
  )

  const location = useMemo(
    () => locations?.find(l => l.id === id),
    [locations, id],
  )

  const itemMap = useMemo(
    () => new Map(items?.map(i => [i.id, i.name]) ?? []),
    [items],
  )

  // 已在後端按 location_id filter 過,這裡只剩排序與「數量 > 0」的隱藏
  const locationBalances = useMemo(
    () =>
      (balances ?? [])
        .filter(b => b.quantity > 0)
        .sort((a, b) =>
          (itemMap.get(a.item_id) ?? '').localeCompare(
            itemMap.get(b.item_id) ?? '',
          ),
        ),
    [balances, itemMap],
  )

  // 後端已按 created_at desc 排序,這裡直接用
  const locationMovements = movements ?? []

  const totalQuantity = useMemo(
    () => locationBalances.reduce((sum, b) => sum + b.quantity, 0),
    [locationBalances],
  )

  if (locationsLoading) {
    return <p className="text-muted-foreground">載入中…</p>
  }

  if (!location) {
    return (
      <div>
        <Link
          to="/locations"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <ArrowLeft /> 返回儲位列表
        </Link>
        <p className="mt-4 text-destructive">找不到此儲位</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/locations"
          className={
            buttonVariants({ variant: 'ghost', size: 'sm' }) + ' mb-2 -ml-2'
          }
        >
          <ArrowLeft /> 返回儲位列表
        </Link>
        <h2 className="mt-2 text-2xl font-bold">{location.name}</h2>
        {location.note && (
          <p className="text-sm text-muted-foreground">{location.note}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          共 {locationBalances.length} 種物品 · 總計 {totalQuantity} 件
        </p>
      </div>

      <Tabs defaultValue="balances">
        <TabsList>
          <TabsTrigger value="balances">
            存放物品({locationBalances.length})
          </TabsTrigger>
          <TabsTrigger value="movements">
            異動記錄({locationMovements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>物品</TableHead>
                <TableHead className="text-right">數量</TableHead>
                <TableHead>更新時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationBalances.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    此儲位目前沒有物品
                  </TableCell>
                </TableRow>
              )}
              {locationBalances.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">
                    {itemMap.get(b.item_id) ?? b.item_id}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {b.quantity}
                  </TableCell>
                  <TableCell>
                    {new Date(b.updated_at ?? b.created_at).toLocaleString(
                      'zh-TW',
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>時間</TableHead>
                <TableHead>類型</TableHead>
                <TableHead>物品</TableHead>
                <TableHead className="text-right">變化</TableHead>
                <TableHead className="text-right">異動後</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationMovements.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    此儲位尚無異動
                  </TableCell>
                </TableRow>
              )}
              {locationMovements.map(m => (
                <TableRow key={m.id}>
                  <TableCell>
                    {new Date(m.created_at).toLocaleString('zh-TW')}
                  </TableCell>
                  <TableCell>{movementTypeLabel(m.movement_type)}</TableCell>
                  <TableCell>
                    {itemMap.get(m.item_id) ?? m.item_id}
                  </TableCell>
                  <TableCell
                    className={
                      'text-right tabular-nums ' +
                      (m.change_qty > 0
                        ? 'text-green-600'
                        : m.change_qty < 0
                          ? 'text-red-600'
                          : '')
                    }
                  >
                    {m.change_qty > 0 ? `+${m.change_qty}` : m.change_qty}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {m.quantity_after}
                  </TableCell>
                  <TableCell>{m.note ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}
