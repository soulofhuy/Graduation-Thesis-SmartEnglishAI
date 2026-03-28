'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { ChangePasswordFormValues } from '@/lib/validators/change-password'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TabsContent } from '@/components/ui/tabs'

type PasswordTabProps = {
    form: UseFormReturn<ChangePasswordFormValues>
    isSaving: boolean
    onSubmit: (values: ChangePasswordFormValues) => void
    t: any
}

export function PasswordTab({ form, isSaving, onSubmit, t }: PasswordTabProps) {
    const isDirty = form.formState.isDirty

    return (
        <TabsContent value="password" className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <CardTitle>{t.student.settings.tabs.passwordTab.subTitle}</CardTitle>
                                    <CardDescription>{t.student.settings.tabs.passwordTab.description}</CardDescription>
                                </div>
                                {isDirty && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => form.reset()}
                                        >
                                            {t.common.cancel}
                                        </Button>
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving ? t.common.isSaving : t.common.save}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t.student.settings.tabs.passwordTab.fields.currentPassword}</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t.student.settings.tabs.passwordTab.fields.newPassword}</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t.student.settings.tabs.passwordTab.fields.confirmPassword}</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </TabsContent>
    )
}
