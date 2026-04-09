'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ModalWrapper } from '@/components/modal-wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { updateClass, generateClassCode } from '@/services/teacher/classes'
import type { Class as BackendClass } from '@/lib/types'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TOAST_COLORS } from '@/lib/toast/color'
import { useLanguage } from '@/components/language-provider'
import { Switch } from '@/components/ui/switch'
import { updateClassSchema, type UpdateClassFormValues } from '@/lib/validators/class'
import { Loader2, RefreshCw } from 'lucide-react'

const classSchema = updateClassSchema()

interface EditClassModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    classItem: BackendClass | null
    accessToken: string
    onSuccess: (updatedClass: BackendClass) => void
}

export function EditClassModal({
    isOpen,
    onOpenChange,
    classItem,
    accessToken,
    onSuccess,
}: EditClassModalProps) {
    const { t } = useLanguage()
    const [isUpdating, setIsUpdating] = React.useState(false)
    const [isGeneratingCode, setIsGeneratingCode] = React.useState(false)

    const form = useForm<UpdateClassFormValues>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            name: classItem?.name || '',
            description: classItem?.description || '',
            classCode: classItem?.classCode || '',
            needsTeacherApproval: classItem?.needsTeacherApproval || false,
        },
    })

    // Update form values when classItem changes
    React.useEffect(() => {
        if (classItem) {
            form.reset({
                name: classItem.name || '',
                description: classItem.description || '',
                classCode: classItem.classCode || '',
                needsTeacherApproval: classItem.needsTeacherApproval || false,
            })
        }
    }, [classItem, form])

    const handleGenerateClassCode = async () => {
        if (!accessToken) {
            toast.error('Vui lòng đăng nhập lại', { className: TOAST_COLORS.error })
            return
        }

        setIsGeneratingCode(true)
        try {
            const result = await generateClassCode(accessToken)
            if (result?.classCode) {
                form.setValue('classCode', result?.classCode)
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Lỗi khi tạo mã lớp'
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsGeneratingCode(false)
        }
    }

    async function onSubmit(values: UpdateClassFormValues) {
        if (!accessToken || !classItem?.id) {
            toast.error('Vui lòng đăng nhập lại', { className: TOAST_COLORS.error })
            return
        }

        setIsUpdating(true)
        try {
            const result = await updateClass(accessToken, classItem.id, {
                name: values.name,
                description: values.description || null,
                classCode: values.classCode,
                needsTeacherApproval: values.needsTeacherApproval,
            })
            onSuccess(result.class)
            form.reset()
            onOpenChange(false)
            toast.success(result.message, { className: TOAST_COLORS.success })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Lỗi khi cập nhật lớp học'
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={t.teacher.classes.editClass.title}
            description={t.teacher.classes.editClass.description}
            footer={
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t.common.cancel}
                    </Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isUpdating}>
                        {isUpdating ? t.common.isSaving : t.common.save}
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
                                <FormLabel>{t.teacher.classes.editClass.fieldName}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t.teacher.classes.editClass.fieldNamePlaceholder}
                                        {...field}
                                    />
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
                                <FormLabel>{t.teacher.classes.editClass.fieldDescription}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={t.teacher.classes.editClass.fieldDescriptionPlaceholder}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="classCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.teacher.classes.editClass.fieldClassCode}</FormLabel>
                                <div className="flex gap-2">
                                    <FormControl className="flex-1">
                                        <Input
                                            readOnly
                                            {...field}
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerateClassCode}
                                        disabled={isGeneratingCode}
                                        className="px-3"
                                    >
                                        {isGeneratingCode ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="needsTeacherApproval"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                                <FormLabel>
                                    {t.teacher.classes.editClass.fieldNeedsTeacherApproval}
                                </FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value ?? false}
                                        onCheckedChange={field.onChange}
                                    />
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
