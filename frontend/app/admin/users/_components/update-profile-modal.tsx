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
import { getUserProfile, updateUserProfile, type AdminUser } from '@/services/admin/user-management'
import { useLanguage } from '@/components/language-provider'

type UpdateProfileModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    token: string | null
    user: AdminUser | null
    onUpdated?: () => void
}

const formatDateForInput = (date?: string | null) => {
    if (!date) return ''
    try {
        const d = new Date(date)
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    } catch (e) {
        return ''
    }
}

export function UpdateProfileModal({ open, onOpenChange, token, user, onUpdated }: UpdateProfileModalProps) {
    const { language } = useLanguage()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [address, setAddress] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingProfile, setLoadingProfile] = useState(false)

    useEffect(() => {
        if (!open) {
            setFirstName('')
            setLastName('')
            setAddress('')
            setPhoneNumber('')
            setDateOfBirth('')
            return
        }

        // load latest profile when opened
        const load = async () => {
            if (!token || !user) return
            setLoadingProfile(true)
            try {
                const data = await getUserProfile(token, user.id)
                setFirstName(data.profile?.firstName ?? '')
                setLastName(data.profile?.lastName ?? '')
                setAddress(data.profile?.address ?? '')
                setPhoneNumber(data.profile?.phoneNumber ?? '')
                setDateOfBirth(formatDateForInput(data.profile?.dateOfBirth ?? null))
            } catch (err) {
                const message = err instanceof Error ? err.message : getToastMessage('loadFailed', language)
                toast.error(message, { className: TOAST_COLORS.error })
            } finally {
                setLoadingProfile(false)
            }
        }

        void load()
    }, [open, token, user])

    const handleSubmit = async () => {
        if (!token || !user) return

        setIsSubmitting(true)
        try {
            const payload: Record<string, any> = {
                firstName: firstName || null,
                lastName: lastName || null,
                address: address || null,
                phoneNumber: phoneNumber || null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null
            }

            await updateUserProfile(token, user.id, payload)
            toast.success('Cập nhật thông tin cá nhân thành công', { className: TOAST_COLORS.success })
            onOpenChange(false)
            onUpdated?.()
        } catch (err) {
            const message = err instanceof Error ? err.message : getToastMessage('updateFailed', 'vi')
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsSubmitting(false)
        }
    }

    const getFullName = (user: AdminUser) => {
        const first = user.profile?.firstName?.trim() ?? ''
        const last = user.profile?.lastName?.trim() ?? ''
        return `${first} ${last}`.trim() || user.email
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Cập nhật thông tin cá nhân</DialogTitle>
                </DialogHeader>

                {user ? (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Họ</label>
                                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Tên</label>
                                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Số điện thoại</label>
                                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Địa chỉ</label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Ngày sinh</label>
                                <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Không có dữ liệu người dùng được chọn.
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || loadingProfile}>
                        Hủy
                    </Button>
                    <Button onClick={() => void handleSubmit()} disabled={!user || isSubmitting || loadingProfile}>
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
