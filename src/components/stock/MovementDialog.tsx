import { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useInbound, useOutbound } from '@/hooks/useStock'
import { useItems } from '@/hooks/useItems'
import { useLocations } from '@/hooks/useLocations'
import { extractErrorMessage } from '@/lib/error'

type Direction = 'inbound' | 'outbound'

const schema = z.object({
  item_id: z.uuid('請選擇物品'),
  location_id: z.uuid('請選擇儲位'),
  quantity: z.number({ message: '請填寫數量' }).int().min(1, '數量需 ≥ 1'),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  direction: Direction
}

const TITLES: Record<Direction, { title: string; desc: string; ok: string }> = {
  inbound: { title: '入庫', desc: '增加儲位的物品數量', ok: '入庫' },
  outbound: { title: '出庫', desc: '減少儲位的物品數量', ok: '出庫' },
}

export function MovementDialog({ open, onOpenChange, direction }: Props) {
  const inboundMutation = useInbound()
  const outboundMutation = useOutbound()
  const mutation = direction === 'inbound' ? inboundMutation : outboundMutation

  const { data: items } = useItems()
  const { data: locations } = useLocations()

  const itemMap = useMemo(
    () => new Map(items?.map(i => [i.id, i.name]) ?? []),
    [items],
  )
  const locationMap = useMemo(
    () => new Map(locations?.map(l => [l.id, l.name]) ?? []),
    [locations],
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { item_id: '', location_id: '', quantity: 1, note: '' },
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync({
        item_id: values.item_id,
        location_id: values.location_id,
        quantity: values.quantity,
        note: values.note || null,
      })
      toast.success(`已${TITLES[direction].title}`)
      onOpenChange(false)
    } catch (e) {
      toast.error(extractErrorMessage(e, `${TITLES[direction].title}失敗`))
    }
  }

  const t = TITLES[direction]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label>物品</Label>
            <Controller
              control={control}
              name="item_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇物品">
                      {field.value ? itemMap.get(field.value) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {items?.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.item_id && (
              <p className="text-sm text-destructive">
                {errors.item_id.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>儲位</Label>
            <Controller
              control={control}
              name="location_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇儲位">
                      {field.value ? locationMap.get(field.value) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.location_id && (
              <p className="text-sm text-destructive">
                {errors.location_id.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity">數量</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">
                {errors.quantity.message}
              </p>
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
              {mutation.isPending ? '送出中…' : t.ok}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
