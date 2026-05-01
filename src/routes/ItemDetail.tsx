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
import { useItems } from '@/hooks/useItems'
import { useLocations } from '@/hooks/useLocations'
import { useStockBalances, useStockMovements } from '@/hooks/useStock'
import { movementTypeLabel } from '@/lib/labels'

export function ItemDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: items, isLoading: itemsLoading } = useItems()
  const { data: locations } = useLocations()
  const { data: balances } = useStockBalances(
    id ? { item_id: id } : undefined,
  )
  const { data: movements } = useStockMovements(
    id ? { item_id: id } : undefined,
  )

  const item = useMemo(
    () => items?.find(i => i.id === id),
    [items, id],
  )

  const locationMap = useMemo(
    () => new Map(locations?.map(l => [l.id, l.name]) ?? []),
    [locations],
  )

  // 後端已 filter,前端只做排序 + 隱藏 0
  const itemBalances = useMemo(
    () =>
      (balances ?? [])
        .filter(b => b.quantity > 0)
        .sort((a, b) =>
          (locationMap.get(a.location_id) ?? '').localeCompare(
            locationMap.get(b.location_id) ?? '',
          ),
        ),
    [balances, locationMap],
  )

  const totalQuantity = useMemo(
    () => itemBalances.reduce((sum, b) => sum + b.quantity, 0),
    [itemBalances],
  )

  const itemMovements = movements ?? []

  if (itemsLoading) {
    return <p className="text-muted-foreground">載入中…</p>
  }

  if (!item) {
    return (
      <div>
        <Link
          to="/items"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <ArrowLeft /> 返回物品列表
        </Link>
        <p className="mt-4 text-destructive">找不到此物品</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/items"
          className={
            buttonVariants({ variant: 'ghost', size: 'sm' }) + ' mb-2 -ml-2'
          }
        >
          <ArrowLeft /> 返回物品列表
        </Link>
        <h2 className="mt-2 text-2xl font-bold">{item.name}</h2>
        {item.note && (
          <p className="text-sm text-muted-foreground">{item.note}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          分布於 {itemBalances.length} 個儲位 · 總計 {totalQuantity} 件
        </p>
      </div>

      <Tabs defaultValue="balances">
        <TabsList>
          <TabsTrigger value="balances">
            存放分布({itemBalances.length})
          </TabsTrigger>
          <TabsTrigger value="movements">
            異動記錄({itemMovements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>儲位</TableHead>
                <TableHead className="text-right">數量</TableHead>
                <TableHead>更新時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemBalances.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    此物品目前沒有庫存
                  </TableCell>
                </TableRow>
              )}
              {itemBalances.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">
                    {locationMap.get(b.location_id) ?? b.location_id}
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
                <TableHead>儲位</TableHead>
                <TableHead className="text-right">變化</TableHead>
                <TableHead className="text-right">異動後</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemMovements.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    此物品尚無異動
                  </TableCell>
                </TableRow>
              )}
              {itemMovements.map(m => (
                <TableRow key={m.id}>
                  <TableCell>
                    {new Date(m.created_at).toLocaleString('zh-TW')}
                  </TableCell>
                  <TableCell>{movementTypeLabel(m.movement_type)}</TableCell>
                  <TableCell>
                    {locationMap.get(m.location_id) ?? m.location_id}
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
