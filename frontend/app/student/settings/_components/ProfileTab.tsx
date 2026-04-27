'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { TabsContent } from '@/components/ui/tabs'
import { dateFormat } from '@/lib/format'

const toDateInputValue = (value?: string) => {
    if (!value) {
        return ''
    }
    if (value.includes('T')) {
        return value.split('T')[0]
    }
    const parts = value.split('/')
    if (parts.length === 3) {
        const [day, month, year] = parts
        return `${year}-${month}-${day}`
    }
    return value
}

type ProfileFormValues = {
    firstName?: string
    lastName?: string
    address?: string
    phoneNumber?: string
    dateOfBirth?: string
    createdAt?: string
    updatedAt?: string
}

type ProfileTabProps = {
    form: UseFormReturn<ProfileFormValues>
    isEditingProfile: boolean
    isSaving: boolean
    onToggleEdit: () => void
    onSubmit: (values: ProfileFormValues) => void
    t: any
}

export function ProfileTab({
    form,
    isEditingProfile,
    isSaving,
    onToggleEdit,
    onSubmit,
    t
}: ProfileTabProps) {
    return (
        <TabsContent value="profile" className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader className="mb-3">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle>{t.student.settings.tabs.profileTab.subTitle}</CardTitle>
                                    <CardDescription>{t.student.settings.tabs.profileTab.description}</CardDescription>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button type="button" variant="outline" onClick={onToggleEdit} className="gap-2">
                                        <Pencil className="h-4 w-4" />
                                        {isEditingProfile ? t.common.cancelEditting : t.common.edit}
                                    </Button>
                                    {isEditingProfile && (
                                        <Button type="submit" disabled={isSaving} className="gap-2">
                                            {isSaving ? t.common.isSaving : t.common.save}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.student.settings.tabs.profileTab.fields.lastName}</FormLabel>
                                            <FormControl>
                                                <Input {...field} readOnly={!isEditingProfile} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.student.settings.tabs.profileTab.fields.firstName}</FormLabel>
                                            <FormControl>
                                                <Input {...field} readOnly={!isEditingProfile} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.student.settings.tabs.profileTab.fields.address}</FormLabel>
                                            <FormControl>
                                                <Input {...field} readOnly={!isEditingProfile} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.student.settings.tabs.profileTab.fields.phoneNumber}</FormLabel>
                                            <FormControl>
                                                <Input {...field} readOnly={!isEditingProfile} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.student.settings.tabs.profileTab.fields.dateOfBirth}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type={isEditingProfile ? 'date' : 'text'}
                                                    {...field}
                                                    readOnly={!isEditingProfile}
                                                    value={
                                                        isEditingProfile
                                                            ? toDateInputValue(field.value)
                                                            : field.value
                                                                ? dateFormat(field.value)
                                                                : ''
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="createdAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.student.settings.tabs.profileTab.fields.createdAt}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    readOnly
                                                    value={field.value ? dateFormat(field.value) : ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="updatedAt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.student.settings.tabs.profileTab.fields.updatedAt}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    readOnly
                                                    value={field.value ? dateFormat(field.value) : ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </TabsContent>
    )
}
