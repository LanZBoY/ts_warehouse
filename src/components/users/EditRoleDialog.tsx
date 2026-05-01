import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { useUpdateUser } from '@/hooks/useUsers'
import { userRoleLabel } from '@/lib/labels'
import { extractErrorMessage } from '@/lib/error'
import type { components } from '@/api/schema'

type UserRead = components['schemas']['UserRead']
type UserRole = components['schemas']['UserRole']

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserRead | null
}

export function EditRoleDialog({ open, onOpenChange, user }: Props) {
  const [role, setRole] = useState<UserRole>('USER')
  const updateMutation = useUpdateUser()

  // 開啟時把 role 同步成現有的 role
  useEffect(() => {
    if (open && user) setRole(user.role)
  }, [open, user])

  const onSubmit = async () => {
    if (!user) return
    try {
      await updateMutation.mutateAsync({ id: user.id, body: { role } })
      toast.success('已更新角色')
      onOpenChange(false)
    } catch (e) {
      toast.error(extractErrorMessage(e, '更新失敗'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>編輯角色</DialogTitle>
          <DialogDescription>
            修改「{user?.username}」的角色
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>角色</Label>
          <Select value={role} onValueChange={v => setRole(v as UserRole)}>
            <SelectTrigger>
              <SelectValue>{userRoleLabel(role)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">{userRoleLabel('USER')}</SelectItem>
              <SelectItem value="ADMIN">{userRoleLabel('ADMIN')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? '送出中…' : '更新'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
