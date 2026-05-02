'use client'

import { useEffect, useState } from 'react'
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
import { getMyProfile, updateMyProfile } from '@/services/profiles'
import { getAuthValidationMessages } from '@/lib/validation-translators/auth'
import {
  createChangePasswordSchema,
  type ChangePasswordFormValues
} from '@/lib/validators/change-password'
import { createProfileSchema, type ProfileFormValues } from '@/lib/validators/profile'
import { normalizeDateForApi } from '@/lib/format'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'

const profileSchema = createProfileSchema()

export default function TeacherSettingsPage() {
  const { t, language } = useLanguage();
  const { accessToken } = useAuth()
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      phoneNumber: '',
      dateOfBirth: '',
      createdAt: '',
      updatedAt: '',
    },
  })

  useEffect(() => {
    if (!accessToken) {
      return
    }

    const loadProfile = async () => {
      try {
        const result = await getMyProfile(accessToken)
        const profile = result.profile
        profileForm.reset({
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          address: profile.address ?? '',
          phoneNumber: profile.phoneNumber ?? '',
          dateOfBirth: profile.dateOfBirth ?? '',
          createdAt: profile.createdAt ?? '',
          updatedAt: profile.updatedAt ?? '',
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
        toast.error(message, { className: TOAST_COLORS.error })
      }
    }

    loadProfile()
  }, [accessToken, profileForm])

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(createChangePasswordSchema(getAuthValidationMessages(language))),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  async function handleProfileSubmit(values: ProfileFormValues) {
    setIsSavingProfile(true);
    if (!accessToken) {
      toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error });
      setIsSavingProfile(false);
      return
    }
    try {
      const normalizedDateOfBirth = normalizeDateForApi(values.dateOfBirth)
      const payload = {
        ...values,
        dateOfBirth: normalizedDateOfBirth
      }
      const profileData = Object.fromEntries(
        Object.entries(payload)
          .filter(([key]) => key !== 'createdAt' && key !== 'updatedAt')
          .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
      ) as Omit<ProfileFormValues, 'createdAt' | 'updatedAt'>;
      const result = await updateMyProfile(accessToken, profileData)
      toast.success(getToastMessage('saveSuccess', language), { className: TOAST_COLORS.success })
      setIsEditingProfile(false)
    } catch (error) {
      toast.error(getToastMessage('saveFailed', language), { className: TOAST_COLORS.error })
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(values: ChangePasswordFormValues) {
    if (!accessToken) {
      toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
      return
    }

    setIsSavingPassword(true)
    try {
      const result = await changePassword(accessToken, values.currentPassword, values.newPassword)
      toast.success(getToastMessage('changePasswordSuccess', language), { className: TOAST_COLORS.success })
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('changePasswordFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
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
          <TabsList className="flex flex-wrap justify-start gap-20 bg-transparent p-1">
            <TabsTrigger
              value="setting"
              className="rounded-full px-10 py-4 text-base font-medium border border-border data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              {t.student.settings.tabs.settingsTab.mainTitle}
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className="rounded-full px-10 py-4 text-base font-medium border border-border data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              {t.student.settings.tabs.profileTab.mainTitle}
            </TabsTrigger>

            <TabsTrigger
              value="password"
              className="rounded-full px-10 py-4 text-base font-medium border border-border data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              {t.student.settings.tabs.passwordTab.mainTitle}
            </TabsTrigger>
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
