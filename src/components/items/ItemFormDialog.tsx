import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateItem, useUpdateItem } from '@/hooks/useItems'
import { extractErrorMessage } from '@/lib/error'
import type { components } from '@/api/schema'

type ItemRead = components['schemas']['ItemRead']

const itemSchema = z.object({
  name: z.string().min(1, '名稱必填').max(100, '名稱太長'),
  note: z.string().optional(),
})

type ItemFormValues = z.infer<typeof itemSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  // 有傳就是編輯模式,沒傳就是新增模式
  item?: ItemRead
}

export function ItemFormDialog({ open, onOpenChange, item }: Props) {
  const isEdit = !!item

  const createMutation = useCreateItem()
  const updateMutation = useUpdateItem()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: '', note: '' },
  })

  // Dialog 開啟或 item 變化時,把表單重置成對應的初始值
  useEffect(() => {
    if (open) {
      reset({
        name: item?.name ?? '',
        note: item?.note ?? '',
      })
    }
  }, [open, item, reset])

  const onSubmit = async (values: ItemFormValues) => {
    const body = {
      name: values.name,
      note: values.note || null,
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: item.id, body })
        toast.success('已更新物品')
      } else {
        await createMutation.mutateAsync(body)
        toast.success('已新增物品')
      }
      onOpenChange(false)
    } catch (e) {
      toast.error(extractErrorMessage(e, isEdit ? '更新失敗' : '新增失敗'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? '編輯物品' : '新增物品'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改物品基本資料' : '輸入物品基本資料'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">名稱</Label>
            <Input id="name" {...register('name')} autoFocus />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">備註(選填)</Label>
            <Input id="note" {...register('note')} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? '送出中…' : isEdit ? '更新' : '新增'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
