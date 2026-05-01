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
import { useResetPassword } from '@/hooks/useUsers'
import { extractErrorMessage } from '@/lib/error'
import type { components } from '@/api/schema'

type UserRead = components['schemas']['UserRead']

const schema = z.object({
  new_password: z.string().min(6, '密碼至少 6 碼'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserRead | null
}

export function ResetPasswordDialog({ open, onOpenChange, user }: Props) {
  const mutation = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_password: '' },
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = async (values: FormValues) => {
    if (!user) return
    try {
      await mutation.mutateAsync({
        id: user.id,
        newPassword: values.new_password,
      })
      toast.success('已重設密碼')
      onOpenChange(false)
    } catch (e) {
      toast.error(extractErrorMessage(e, '重設失敗'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重設密碼</DialogTitle>
          <DialogDescription>
            為「{user?.username}」設定新密碼
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="new_password">新密碼</Label>
            <Input
              id="new_password"
              type="password"
              autoFocus
              {...register('new_password')}
            />
            {errors.new_password && (
              <p className="text-sm text-destructive">
                {errors.new_password.message}
              </p>
            )}
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
              {mutation.isPending ? '送出中…' : '重設'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
