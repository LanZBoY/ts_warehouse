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
import { useCreateLocation, useUpdateLocation } from '@/hooks/useLocations'
import { extractErrorMessage } from '@/lib/error'
import type { components } from '@/api/schema'

type LocationRead = components['schemas']['LocationRead']

const locationSchema = z.object({
  name: z.string().min(1, '名稱必填').max(100, '名稱太長'),
  note: z.string().optional(),
})

type LocationFormValues = z.infer<typeof locationSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  location?: LocationRead
}

export function LocationFormDialog({ open, onOpenChange, location }: Props) {
  const isEdit = !!location
  const createMutation = useCreateLocation()
  const updateMutation = useUpdateLocation()
  const mutation = isEdit ? updateMutation : createMutation

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: '', note: '' },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: location?.name ?? '',
        note: location?.note ?? '',
      })
    }
  }, [open, location, reset])

  const onSubmit = async (values: LocationFormValues) => {
    const body = {
      name: values.name,
      note: values.note || null,
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: location.id, body })
        toast.success('已更新儲位')
      } else {
        await createMutation.mutateAsync(body)
        toast.success('已新增儲位')
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
          <DialogTitle>{isEdit ? '編輯儲位' : '新增儲位'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改儲位基本資料' : '輸入儲位基本資料'}
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
