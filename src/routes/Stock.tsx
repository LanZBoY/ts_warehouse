import { useMemo, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useStockBalances, useStockMovements } from '@/hooks/useStock'
import { useItems } from '@/hooks/useItems'
import { useLocations } from '@/hooks/useLocations'
import { MovementDialog } from '@/components/stock/MovementDialog'
import { AdjustDialog } from '@/components/stock/AdjustDialog'
import { movementTypeLabel } from '@/lib/labels'

type DialogState = 'inbound' | 'outbound' | 'adjust' | null

export function Stock() {
  const [dialog, setDialog] = useState<DialogState>(null)

  const { data: balances, isLoading: balancesLoading } = useStockBalances()
  const { data: movements, isLoading: movementsLoading } = useStockMovements()
  const { data: items } = useItems()
  const { data: locations } = useLocations()

  // 把 items / locations 轉成 id → name 的 lookup map,讓表格能顯示名稱
  const itemMap = useMemo(
    () => new Map(items?.map(i => [i.id, i.name]) ?? []),
    [items],
  )
  const locationMap = useMemo(
    () => new Map(locations?.map(l => [l.id, l.name]) ?? []),
    [locations],
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">庫存管理</h2>
        <div className="flex gap-2">
          <Button onClick={() => setDialog('inbound')}>
            <ArrowDownToLine /> 入庫
          </Button>
          <Button variant="outline" onClick={() => setDialog('outbound')}>
            <ArrowUpFromLine /> 出庫
          </Button>
          <Button variant="outline" onClick={() => setDialog('adjust')}>
            <ClipboardCheck /> 盤點
          </Button>
        </div>
      </div>

      <Tabs defaultValue="balances">
        <TabsList>
          <TabsTrigger value="balances">目前庫存</TabsTrigger>
          <TabsTrigger value="movements">異動記錄</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="mt-4">
          {balancesLoading && (
            <p className="text-muted-foreground">載入中…</p>
          )}
          {balances && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>物品</TableHead>
                  <TableHead>儲位</TableHead>
                  <TableHead className="text-right">數量</TableHead>
                  <TableHead>更新時間</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      尚無庫存,點右上角的「入庫」開始
                    </TableCell>
                  </TableRow>
                )}
                {balances.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      {itemMap.get(b.item_id) ?? b.item_id}
                    </TableCell>
                    <TableCell>
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
          )}
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          {movementsLoading && (
            <p className="text-muted-foreground">載入中…</p>
          )}
          {movements && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>時間</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>物品</TableHead>
                  <TableHead>儲位</TableHead>
                  <TableHead className="text-right">變化</TableHead>
                  <TableHead className="text-right">異動後</TableHead>
                  <TableHead>備註</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      尚無異動記錄
                    </TableCell>
                  </TableRow>
                )}
                {movements.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {new Date(m.created_at).toLocaleString('zh-TW')}
                    </TableCell>
                    <TableCell>{movementTypeLabel(m.movement_type)}</TableCell>
                    <TableCell>
                      {itemMap.get(m.item_id) ?? m.item_id}
                    </TableCell>
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
          )}
        </TabsContent>
      </Tabs>

      <MovementDialog
        open={dialog === 'inbound'}
        onOpenChange={open => !open && setDialog(null)}
        direction="inbound"
      />
      <MovementDialog
        open={dialog === 'outbound'}
        onOpenChange={open => !open && setDialog(null)}
        direction="outbound"
      />
      <AdjustDialog
        open={dialog === 'adjust'}
        onOpenChange={open => !open && setDialog(null)}
      />
    </div>
  )
}
