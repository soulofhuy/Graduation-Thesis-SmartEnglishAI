'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getUserProfile, updateUserProfile, type AdminUser } from '@/services/admin/user-management'
import { useLanguage } from '@/components/language-provider'
import { createProfileSchema, type ProfileFormValues } from '@/lib/validators/profile'

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
    const { t, language } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadingProfile, setLoadingProfile] = useState(false)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(createProfileSchema()),
        defaultValues: {
            firstName: '',
            lastName: '',
            address: '',
            phoneNumber: '',
            dateOfBirth: ''
        }
    })

    useEffect(() => {
        if (!open) {
            form.reset()
            return
        }

        const load = async () => {
            if (!token || !user) return
            setLoadingProfile(true)
            try {
                const data = await getUserProfile(token, user.id)
                form.reset({
                    firstName: data.profile?.firstName ?? '',
                    lastName: data.profile?.lastName ?? '',
                    address: data.profile?.address ?? '',
                    phoneNumber: data.profile?.phoneNumber ?? '',
                    dateOfBirth: formatDateForInput(data.profile?.dateOfBirth ?? null)
                })
            } catch (err) {
                const message = err instanceof Error ? err.message : getToastMessage('loadFailed', language)
                toast.error(message, { className: TOAST_COLORS.error })
            } finally {
                setLoadingProfile(false)
            }
        }

        void load()
    }, [open, token, user, form, language])

    const handleSubmit = async (values: ProfileFormValues) => {
        if (!token || !user) return

        setIsSubmitting(true)
        try {
            const payload: Record<string, any> = {
                firstName: values.firstName || null,
                lastName: values.lastName || null,
                address: values.address || null,
                phoneNumber: values.phoneNumber || null,
                dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : null
            }

            await updateUserProfile(token, user.id, payload)
            toast.success(getToastMessage('updateSuccess', language), { className: TOAST_COLORS.success })
            onOpenChange(false)
            onUpdated?.()
        } catch (err) {
            const message = err instanceof Error ? err.message : getToastMessage('updateFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t.admin.userManagement.updateProfile.title}</DialogTitle>
                </DialogHeader>

                {user ? (
                    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.updateProfile.fieldFirstName}</label>
                                <Input {...form.register('firstName')} />
                                {form.formState.errors.firstName?.message ? (
                                    <p className="mt-1 text-sm text-destructive">{String(form.formState.errors.firstName.message)}</p>
                                ) : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.updateProfile.fieldLastName}</label>
                                <Input {...form.register('lastName')} />
                                {form.formState.errors.lastName?.message ? (
                                    <p className="mt-1 text-sm text-destructive">{String(form.formState.errors.lastName.message)}</p>
                                ) : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.updateProfile.fieldPhoneNumber}</label>
                                <Input {...form.register('phoneNumber')} />
                                {form.formState.errors.phoneNumber?.message ? (
                                    <p className="mt-1 text-sm text-destructive">{String(form.formState.errors.phoneNumber.message)}</p>
                                ) : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.updateProfile.fieldAddress}</label>
                                <Input {...form.register('address')} />
                                {form.formState.errors.address?.message ? (
                                    <p className="mt-1 text-sm text-destructive">{String(form.formState.errors.address.message)}</p>
                                ) : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.updateProfile.fieldDateOfBirth}</label>
                                <Input type="date" {...form.register('dateOfBirth')} />
                                {form.formState.errors.dateOfBirth?.message ? (
                                    <p className="mt-1 text-sm text-destructive">{String(form.formState.errors.dateOfBirth.message)}</p>
                                ) : null}
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        {t.common.noData}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || loadingProfile}>
                        {t.common.cancel}
                    </Button>
                    <Button onClick={() => void form.handleSubmit(handleSubmit)()} disabled={!user || isSubmitting || loadingProfile}>
                        {isSubmitting ? t.common.isSaving : t.common.save}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
