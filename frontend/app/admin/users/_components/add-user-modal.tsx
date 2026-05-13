'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { createAdminUser, type AdminUserProfile } from '@/services/admin/user-management'
import { useLanguage } from '@/components/language-provider'
import { getAuthValidationMessages } from '@/lib/validation-translators/auth'
import { createAddUserSchema, type AddUserFormValues } from '@/lib/validators/admin-add-user'

type AddUserModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    token: string | null
    onUserCreated?: () => void
}

export function AddUserModal({
    open,
    onOpenChange,
    token,
    onUserCreated
}: AddUserModalProps) {
    const { t, language } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const authValidationMessages = getAuthValidationMessages(language)
    const addUserSchema = useMemo(
        () => createAddUserSchema({
            emailRequired: authValidationMessages.emailInvalid,
            emailInvalid: authValidationMessages.emailInvalid,
            roleRequired: authValidationMessages.roleRequired,
            passwordMin: authValidationMessages.passwordMin
        }),
        [authValidationMessages]
    )

    const form = useForm<AddUserFormValues>({
        resolver: zodResolver(addUserSchema),
        defaultValues: {
            email: '',
            password: '',
            role: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            dateOfBirth: ''
        }
    })

    useEffect(() => {
        if (!open) {
            form.reset()
        }
    }, [form, open])

    const handleSubmit = async (values: AddUserFormValues) => {
        if (!token) {
            toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
            return
        }

        setIsSubmitting(true)
        try {
            const profile: Partial<AdminUserProfile> = {}
            if (values.firstName) profile.firstName = values.firstName
            if (values.lastName) profile.lastName = values.lastName
            if (values.phoneNumber) profile.phoneNumber = values.phoneNumber
            if (values.address) profile.address = values.address
            if (values.dateOfBirth) profile.dateOfBirth = values.dateOfBirth

            await createAdminUser(
                token,
                values.email,
                values.password,
                values.role as 'TEACHER' | 'STUDENT',
                profile
            )

            toast.success(getToastMessage('saveSuccess', language), { className: TOAST_COLORS.success })
            onOpenChange(false)
            onUserCreated?.()
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('saveFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t.admin.userManagement.createNewUser.userInfo.title}</DialogTitle>
                </DialogHeader>

                <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                    {/* Email */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.createNewUser.userInfo.fieldEmail}</label>
                        <Input
                            {...form.register('email')}
                            type="email"
                            placeholder={t.admin.userManagement.createNewUser.userInfo.fieldEmailPlaceholder}
                        />
                        {form.formState.errors.email?.message ? (
                            <p className="mt-1 text-sm text-destructive">
                                {String(form.formState.errors.email.message)}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label className="block text-sm font-medium">{t.admin.userManagement.createNewUser.userInfo.fieldPassword}</label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => form.setValue('password', '123456', { shouldValidate: true })}
                            >
                                Dùng mật khẩu mặc định 123456
                            </Button>
                        </div>
                        <Input
                            {...form.register('password')}
                            type="password"
                            placeholder={t.admin.userManagement.createNewUser.userInfo.fieldPasswordPlaceholder}
                        />
                        {form.formState.errors.password?.message ? (
                            <p className="mt-1 text-sm text-destructive">
                                {String(form.formState.errors.password.message)}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.createNewUser.userInfo.fieldRole}</label>
                        <Select
                            value={form.watch('role')}
                            onValueChange={(value) => form.setValue('role', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t.admin.userManagement.createNewUser.userInfo.fieldRolePlaceholder} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TEACHER">{t.admin.userManagement.createNewUser.userInfo.fieldRoleTeacher}</SelectItem>
                                <SelectItem value="STUDENT">{t.admin.userManagement.createNewUser.userInfo.fieldRoleStudent}</SelectItem>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.role?.message ? (
                            <p className="mt-1 text-sm text-destructive">
                                {String(form.formState.errors.role.message)}
                            </p>
                        ) : null}
                    </div>

                    {/* Profile - Optional */}
                    <div className="border-t pt-4">
                        <p className="mb-3 text-sm font-medium text-muted-foreground">
                            {t.admin.userManagement.createNewUser.profile.title}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.createNewUser.profile.fieldFirstName}</label>
                                <Input
                                    {...form.register('firstName')}
                                    placeholder={t.admin.userManagement.createNewUser.profile.fieldFirstNamePlaceholder}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.createNewUser.profile.fieldLastName}</label>
                                <Input
                                    {...form.register('lastName')}
                                    placeholder={t.admin.userManagement.createNewUser.profile.fieldLastNamePlaceholder}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.createNewUser.profile.fieldPhoneNumber}</label>
                                <Input
                                    {...form.register('phoneNumber')}
                                    placeholder={t.admin.userManagement.createNewUser.profile.fieldPhoneNumberPlaceholder}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.createNewUser.profile.fieldDateOfBirth}</label>
                                <Input
                                    {...form.register('dateOfBirth')}
                                    type="date"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-2 block text-sm font-medium">{t.admin.userManagement.createNewUser.profile.fieldAddress}</label>
                                <Input
                                    {...form.register('address')}
                                    placeholder={t.admin.userManagement.createNewUser.profile.fieldAddressPlaceholder}
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        {t.common.cancel}
                    </Button>
                    <Button
                        onClick={() => void form.handleSubmit(handleSubmit)()}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t.common.isSaving : t.common.save}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
