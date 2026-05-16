'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ModalWrapper } from '@/components/modal-wrapper'
import { Button } from '@/components/ui/button'
import { TOAST_COLORS } from '@/lib/toast/color'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
    generateClassCode,
    updateClass,
    type Class,
} from '@/services/admin/class-management'
import {
    updateClassSchema,
    type UpdateClassFormValues,
} from '@/lib/validators/class'

const classSchema = updateClassSchema()

interface UpdateClassModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    classItem: Class | null
    accessToken: string | null
    onSuccess: (updatedClass: Class) => void
}

export function UpdateClassModal({
    isOpen,
    onOpenChange,
    classItem,
    accessToken,
    onSuccess,
}: UpdateClassModalProps) {
    const [isUpdating, setIsUpdating] = React.useState(false)
    const [isGeneratingCode, setIsGeneratingCode] = React.useState(false)
    const { language } = useLanguage()

    const form = useForm<UpdateClassFormValues>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            name: classItem?.name || '',
            description: classItem?.description || '',
            classCode: classItem?.classCode || '',
            needsTeacherApproval: classItem?.needsTeacherApproval || false,
        },
    })

    React.useEffect(() => {
        if (classItem) {
            form.reset({
                name: classItem.name || '',
                description: classItem.description || '',
                classCode: classItem.classCode || '',
                needsTeacherApproval: classItem.needsTeacherApproval || false,
            })
        } else {
            form.reset({
                name: '',
                description: '',
                classCode: '',
                needsTeacherApproval: false,
            })
        }
    }, [classItem, form])

    const handleGenerateClassCode = async () => {
        if (!accessToken) {
            toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
            return
        }

        setIsGeneratingCode(true)
        try {
            const result = await generateClassCode(accessToken)
            if (result?.classCode) {
                form.setValue('classCode', result.classCode, { shouldDirty: true })
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('saveFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsGeneratingCode(false)
        }
    }

    const onSubmit = async (values: UpdateClassFormValues) => {
        if (!accessToken || !classItem?.id) {
            toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
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
            toast.success(result.message || getToastMessage('updateSuccess', language), { className: TOAST_COLORS.success })
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('saveFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Cập nhật lớp học"
            description={classItem ? `Chỉnh sửa thông tin của ${classItem.name}` : 'Chỉnh sửa thông tin lớp học'}
            contentClassName="max-w-2xl"
            footer={
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isUpdating || !classItem}>
                        {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
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
                                <FormLabel>Tên lớp</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập tên lớp" {...field} />
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
                                <FormLabel>Mô tả</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Mô tả ngắn về lớp học" {...field} />
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
                                <FormLabel>Mã lớp</FormLabel>
                                <div className="flex gap-2">
                                    <FormControl className="flex-1">
                                        <Input readOnly {...field} />
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
                                <FormLabel>Yêu cầu giáo viên duyệt học sinh</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
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