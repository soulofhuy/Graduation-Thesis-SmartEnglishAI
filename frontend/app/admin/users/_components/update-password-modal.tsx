'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { dateFormat } from '@/lib/format'
import { updateAdminUserPassword, type AdminUser } from '@/services/admin/user-management'

type UpdatePasswordModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    token: string | null
    user: AdminUser | null
    onUpdated?: () => void
}

const getFullName = (user: AdminUser) => {
    const firstName = user.profile?.firstName?.trim() ?? ''
    const lastName = user.profile?.lastName?.trim() ?? ''
    return `${firstName} ${lastName}`.trim() || user.email
}

export function UpdatePasswordModal({
    open,
    onOpenChange,
    token,
    user,
    onUpdated
}: UpdatePasswordModalProps) {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!open) {
            setNewPassword('')
            setConfirmPassword('')
        }
    }, [open])

    const handleSubmit = async () => {
        if (!token || !user) {
            return
        }

        if (!newPassword.trim()) {
            toast.error('Vui lòng nhập mật khẩu mới', { className: TOAST_COLORS.error })
            return
        }

        if (newPassword.trim().length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự', { className: TOAST_COLORS.error })
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp', { className: TOAST_COLORS.error })
            return
        }

        setIsSubmitting(true)
        try {
            await updateAdminUserPassword(token, user.id, newPassword)
            toast.success('Cập nhật mật khẩu thành công', { className: TOAST_COLORS.success })
            onOpenChange(false)
            onUpdated?.()
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('updateFailed', 'vi')
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Đổi mật khẩu người dùng</DialogTitle>
                    <DialogDescription>
                        Kiểm tra thông tin cơ bản của người dùng trước khi cập nhật mật khẩu mới.
                    </DialogDescription>
                </DialogHeader>

                {user ? (
                    <div className="space-y-6">
                        <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Họ tên</p>
                                <p className="mt-1 font-medium">{getFullName(user)}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                                <p className="mt-1 font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vai trò</p>
                                <div className="mt-1">
                                    <Badge variant="secondary">{user.role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}</Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Trạng thái</p>
                                <div className="mt-1">
                                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                        {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Ngày tạo</p>
                                <p className="mt-1 font-medium">
                                    {user.createdAt ? dateFormat(user.createdAt) : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Mã người dùng</p>
                                <p className="mt-1 font-medium break-all">{user.id}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Mật khẩu mới</label>
                                <Input
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Xác nhận mật khẩu</label>
                                <Input
                                    type="password"
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Không có dữ liệu người dùng được chọn.
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={() => void handleSubmit()} disabled={!user || isSubmitting}>
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
