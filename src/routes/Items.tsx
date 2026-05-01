import { useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteItem, useItems } from '@/hooks/useItems'
import { ItemFormDialog } from '@/components/items/ItemFormDialog'
import { extractErrorMessage } from '@/lib/error'
import type { components } from '@/api/schema'

type ItemRead = components['schemas']['ItemRead']

export function Items() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemRead | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ItemRead | null>(null)

  const { data: items, isLoading, error } = useItems()
  const deleteMutation = useDeleteItem()

  const openCreate = () => {
    setEditingItem(undefined)
    setFormOpen(true)
  }

  const openEdit = (item: ItemRead) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('已刪除物品')
    } catch (e) {
      toast.error(extractErrorMessage(e, '刪除失敗'))
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">物品管理</h2>
        <Button onClick={openCreate}>
          <Plus /> 新增
        </Button>
      </div>

      {isLoading && (
        <p className="text-muted-foreground">載入中…</p>
      )}
      {error && (
        <p className="text-sm text-destructive">
          載入失敗:{(error as Error).message}
        </p>
      )}

      {items && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名稱</TableHead>
              <TableHead>備註</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead className="w-40 text-right">動作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  沒有資料,點右上角新增第一筆
                </TableCell>
              </TableRow>
            )}
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.note ?? '—'}</TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleString('zh-TW')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/items/${item.id}`}
                      className={buttonVariants({
                        variant: 'ghost',
                        size: 'icon-sm',
                      })}
                      aria-label="查看"
                      title="查看物品分布"
                    >
                      <Eye />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(item)}
                      aria-label="編輯"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(item)}
                      aria-label="刪除"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editingItem}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除這筆物品?</AlertDialogTitle>
            <AlertDialogDescription>
              將永久刪除「{deleteTarget?.name}」,此動作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '刪除中…' : '刪除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
