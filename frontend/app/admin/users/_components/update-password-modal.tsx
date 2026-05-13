'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { dateFormat } from '@/lib/format'
import { updateAdminUserPassword, type AdminUser } from '@/services/admin/user-management'
import { useLanguage } from '@/components/language-provider'
import { getAuthValidationMessages } from '@/lib/validation-translators/auth'
import { createChangePasswordSchema, type AdminChangePasswordFormValues } from '@/lib/validators/admin-change-password'
import { getRoleLabel } from '@/lib/language-mappers/user-role-mapper'
import { getActiveStatusLabel } from '@/lib/language-mappers/active-deactive-mapper'
import { getRoleColor } from '@/lib/color-mappers/user-role-mapper'

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
    const { t, language } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const changePasswordSchema = useMemo(
        () => createChangePasswordSchema(getAuthValidationMessages(language)),
        [language]
    )
    const form = useForm<AdminChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' }
    })

    useEffect(() => {
        if (!open) {
            form.reset({ newPassword: '', confirmPassword: '' })
        }
    }, [form, open])

    const handleSubmit = async (values: AdminChangePasswordFormValues) => {
        if (!token || !user) {
            return
        }

        setIsSubmitting(true)
        try {
            await updateAdminUserPassword(token, user.id, values.newPassword)
            toast.success(getToastMessage('updateSuccess', language), { className: TOAST_COLORS.success })
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
                    <DialogTitle>{t.admin.userManagement.changePassword.title}</DialogTitle>
                    <DialogDescription>{t.admin.userManagement.changePassword.description}</DialogDescription>
                </DialogHeader>

                {user ? (
                    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                        <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs tracking-wide text-muted-foreground">{t.admin.userManagement.changePassword.userInfo.fieldFullName}</p>
                                <p className="mt-1 font-medium">{getFullName(user)}</p>
                            </div>
                            <div>
                                <p className="text-xs tracking-wide text-muted-foreground">{t.admin.userManagement.changePassword.userInfo.fieldEmail}</p>
                                <p className="mt-1 font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs tracking-wide text-muted-foreground">{t.admin.userManagement.changePassword.userInfo.fieldRole}</p>
                                <div className="mt-1">
                                    <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>
                                        {getRoleLabel(user.role, language)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs tracking-wide text-muted-foreground">{t.admin.userManagement.changePassword.userInfo.fieldStatus}</p>
                                <div className="mt-1">
                                    <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>
                                        {getActiveStatusLabel(user.isActive, language)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs tracking-wide text-muted-foreground">{t.admin.userManagement.changePassword.userInfo.fieldCreatedDate}</p>
                                <p className="mt-1 font-medium">
                                    {user.createdAt ? dateFormat(user.createdAt) : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs tracking-wide text-muted-foreground">{t.admin.userManagement.changePassword.userInfo.fieldAddress}</p>
                                <p className="mt-1 font-medium break-all">{user.profile?.address}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.changePassword.newPassword}</label>
                                <Input
                                    {...form.register('newPassword')}
                                    type="password"
                                    placeholder={t.admin.userManagement.changePassword.newPasswordPlaceholder}
                                />
                                {form.formState.errors.newPassword?.message ? (
                                    <p className="mt-1 text-sm text-destructive">
                                        {form.formState.errors.newPassword.message}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.changePassword.passwordConfirmation}</label>
                                <Input
                                    {...form.register('confirmPassword')}
                                    type="password"
                                    placeholder={t.admin.userManagement.changePassword.passwordConfirmationPlaceholder}
                                />
                                {form.formState.errors.confirmPassword?.message ? (
                                    <p className="mt-1 text-sm text-destructive">
                                        {form.formState.errors.confirmPassword.message}
                                    </p>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        {t.common.cancel}
                    </Button>
                    <Button onClick={() => void form.handleSubmit(handleSubmit)()} disabled={!user || isSubmitting}>
                        {isSubmitting ? t.common.isSaving : t.common.isSaving}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
