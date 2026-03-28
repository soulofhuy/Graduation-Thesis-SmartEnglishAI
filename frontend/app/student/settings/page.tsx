'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useLanguage } from '@/components/language-provider'
import { SettingsTab } from './_components/SettingsTab'
import { ProfileTab } from './_components/ProfileTab'
import { PasswordTab } from './_components/PasswordTab'
import { useAuth } from '@/components/auth-provider'
import { changePassword } from '@/services/auth'
import { getAuthValidationMessages } from '@/lib/validation-translators/auth'
import {
  createChangePasswordSchema,
  type ChangePasswordFormValues
} from '@/lib/validators/change-password'
import { createProfileSchema, type ProfileFormValues } from '@/lib/validators/profile'

const profileSchema = createProfileSchema()

export default function StudentSettingsPage() {
  const { t, language } = useLanguage();
  const { accessToken } = useAuth()
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: 'Minh',
      lastName: 'Anh',
      address: 'Ho Chi Minh City',
      phoneNumber: '0900000000',
      dateOfBirth: '2002-05-10',
      createdAt: '2024-01-15',
      updatedAt: '2026-03-28',
    },
  })

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(createChangePasswordSchema(getAuthValidationMessages(language))),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  async function handleProfileSubmit(values: ProfileFormValues) {
    setIsSavingProfile(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Lưu cài đặt thành công!')
      if (isEditingProfile) {
        setIsEditingProfile(false)
      }
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt')
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(values: ChangePasswordFormValues) {
    if (!accessToken) {
      toast.error('Vui lòng đăng nhập lại để đổi mật khẩu')
      return
    }

    setIsSavingPassword(true)
    try {
      const result = await changePassword(accessToken, values.currentPassword, values.newPassword)
      toast.success(result.message || 'Đổi mật khẩu thành công!')
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi khi đổi mật khẩu'
      toast.error(message)
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      <div className="mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.student.settings.title}</h1>
          <p className="text-muted-foreground mt-1">{t.student.settings.description}</p>
        </div>

        <Tabs defaultValue="setting" className="space-y-6">
          <TabsList className="flex flex-wrap justify-start gap-2">
            <TabsTrigger value="setting">{t.student.settings.tabs.settingsTab.mainTitle}</TabsTrigger>
            <TabsTrigger value="profile">{t.student.settings.tabs.profileTab.mainTitle}</TabsTrigger>
            <TabsTrigger value="password">{t.student.settings.tabs.passwordTab.mainTitle}</TabsTrigger>
          </TabsList>

          <SettingsTab t={t} />

          <ProfileTab
            form={profileForm}
            isEditingProfile={isEditingProfile}
            isSaving={isSavingProfile}
            onToggleEdit={() => setIsEditingProfile((prev) => !prev)}
            onSubmit={handleProfileSubmit}
            t={t}
          />

          <PasswordTab
            form={passwordForm}
            isSaving={isSavingPassword}
            onSubmit={handlePasswordSubmit}
            t={t}
          />
        </Tabs>
      </div>
    </div>
  )
}
