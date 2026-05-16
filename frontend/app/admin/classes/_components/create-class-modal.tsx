'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ModalWrapper } from '@/components/modal-wrapper'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/components/language-provider'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getToastMessage } from '@/lib/toast/message'
import {
    createAdminClass,
    type Class,
} from '@/services/admin/class-management'
import { getAllTeachers, type AdminUser } from '@/services/admin/user-management'
import {
    createAdminClassSchema,
    type AdminClassFormValues,
} from '@/lib/validators/class'

const classSchema = createAdminClassSchema()

interface CreateClassModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    accessToken: string | null
    onSuccess: (createdClass: Class) => void
}

const getTeacherDisplayName = (teacher: AdminUser) => {
    const firstName = teacher.profile?.firstName?.trim() || ''
    const lastName = teacher.profile?.lastName?.trim() || ''
    const fullName = `${firstName} ${lastName}`.trim()

    return fullName || teacher.email
}

export function CreateClassModal({
    isOpen,
    onOpenChange,
    accessToken,
    onSuccess,
}: CreateClassModalProps) {
    const { t, language } = useLanguage()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isTeachersLoading, setIsTeachersLoading] = React.useState(false)
    const [teachers, setTeachers] = React.useState<AdminUser[]>([])

    const form = useForm<AdminClassFormValues>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            name: '',
            description: '',
            teacherId: '',
            needsTeacherApproval: false,
        },
    })

    React.useEffect(() => {
        if (!isOpen) {
            form.reset({
                name: '',
                description: '',
                teacherId: '',
                needsTeacherApproval: false,
            })
            setTeachers([])
            return
        }

        if (!accessToken) {
            return
        }

        const loadTeachers = async () => {
            setIsTeachersLoading(true)
            try {
                const data = await getAllTeachers(accessToken)
                setTeachers(data)
            } catch (error) {
                const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
                toast.error(message, { className: TOAST_COLORS.error })
            } finally {
                setIsTeachersLoading(false)
            }
        }

        void loadTeachers()
    }, [accessToken, form, isOpen, language])

    const handleSubmit = async (values: AdminClassFormValues) => {
        if (!accessToken) {
            toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
            return
        }

        setIsSubmitting(true)
        try {
            const result = await createAdminClass(accessToken, {
                name: values.name,
                description: values.description || null,
                teacherId: values.teacherId,
                needsTeacherApproval: values.needsTeacherApproval,
            })

            toast.success(getToastMessage('saveSuccess', language), { className: TOAST_COLORS.success })
            onOpenChange(false)
            onSuccess(result.class)
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('saveFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={t.admin.classManagement.createClass.title}
            description={t.admin.classManagement.createClass.description}
            contentClassName="max-w-2xl"
            footer={
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t.common.cancel}
                    </Button>
                    <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting || isTeachersLoading || teachers.length === 0}>
                        {isSubmitting ? t.common.isSaving : t.common.save}
                    </Button>
                </div>
            }
        >
            <Form {...form}>
                <form className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.admin.classManagement.updateClass.fieldClassName}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t.admin.classManagement.updateClass.fieldClassNamePlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.admin.classManagement.updateClass.fieldClassDescription}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={t.admin.classManagement.updateClass.fieldClassDescriptionPlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="teacherId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.admin.classManagement.createClass.fieldTeacher}</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange} disabled={isTeachersLoading || teachers.length === 0}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue
                                                placeholder={isTeachersLoading ? t.common.loading : t.admin.classManagement.createClass.fieldTeacherPlaceholder}
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {teachers.length === 0 ? (
                                            <SelectItem value="__empty__" disabled>
                                                {t.admin.classManagement.createClass.fieldTeacherEmpty}
                                            </SelectItem>
                                        ) : (
                                            teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id}>
                                                    {getTeacherDisplayName(teacher)}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="needsTeacherApproval"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                                <FormLabel>{t.admin.classManagement.updateClass.fieldNeedsTeacherApproval}</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </ModalWrapper>
    )
}