import { useState } from 'react'
import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CreateUserDialog } from '@/components/users/CreateUserDialog'
import { EditRoleDialog } from '@/components/users/EditRoleDialog'
import { ResetPasswordDialog } from '@/components/users/ResetPasswordDialog'
import { useDeleteUser, useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/hooks/useAuth'
import { userRoleLabel } from '@/lib/labels'
import { extractErrorMessage } from '@/lib/error'
import type { components } from '@/api/schema'

type UserRead = components['schemas']['UserRead']

export function Users() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<UserRead | null>(null)
  const [resetting, setResetting] = useState<UserRead | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserRead | null>(null)

  const { user: currentUser } = useAuth()
  const { data: users, isLoading, error } = useUsers()
  const deleteMutation = useDeleteUser()

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('已刪除使用者')
    } catch (e) {
      toast.error(extractErrorMessage(e, '刪除失敗'))
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">使用者管理</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> 新增
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">載入中…</p>}
      {error && (
        <p className="text-sm text-destructive">
          載入失敗:{(error as Error).message}
        </p>
      )}

      {users && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>帳號</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead className="w-40 text-right">動作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => {
              const isSelf = u.id === currentUser?.id
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.username}
                    {isSelf && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (你)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{userRoleLabel(u.role)}</TableCell>
                  <TableCell>
                    {new Date(u.created_at).toLocaleString('zh-TW')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingRole(u)}
                        aria-label="編輯角色"
                        title="編輯角色"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setResetting(u)}
                        aria-label="重設密碼"
                        title="重設密碼"
                      >
                        <KeyRound />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(u)}
                        aria-label="刪除"
                        title="刪除"
                        disabled={isSelf}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditRoleDialog
        open={!!editingRole}
        onOpenChange={open => !open && setEditingRole(null)}
        user={editingRole}
      />
      <ResetPasswordDialog
        open={!!resetting}
        onOpenChange={open => !open && setResetting(null)}
        user={resetting}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除這個使用者?</AlertDialogTitle>
            <AlertDialogDescription>
              將永久刪除「{deleteTarget?.username}」,此動作無法復原。
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
