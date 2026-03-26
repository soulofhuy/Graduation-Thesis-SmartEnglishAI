'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Tên website là bắt buộc'),
  siteDescription: z.string().optional(),
  supportEmail: z.string().email('Email không hợp lệ'),
  maintenanceMode: z.boolean(),
  allowNewRegistrations: z.boolean(),
  emailVerificationRequired: z.boolean(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: 'Langoer',
      siteDescription: 'Nền tảng học tập tiếng Anh với công nghệ AI',
      supportEmail: 'support@langoer.com',
      maintenanceMode: false,
      allowNewRegistrations: true,
      emailVerificationRequired: true,
    },
  })

  async function onSubmit(values: SettingsFormValues) {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Lưu cài đặt thành công!')
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Cài đặt hệ thống
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý cài đặt chung của hệ thống
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt cơ bản</CardTitle>
              <CardDescription>
                Thông tin cơ bản về website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên website</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả website</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email hỗ trợ</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt bảo mật</CardTitle>
              <CardDescription>
                Quản lý cài đặt bảo mật của hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Chế độ bảo trì
                      </FormLabel>
                      <FormDescription>
                        Tạm dừng hệ thống để bảo trì
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="allowNewRegistrations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Cho phép đăng ký mới
                      </FormLabel>
                      <FormDescription>
                        Cho phép người dùng mới đăng ký tài khoản
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="emailVerificationRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Xác minh email bắt buộc
                      </FormLabel>
                      <FormDescription>
                        Yêu cầu xác minh email khi đăng ký
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
