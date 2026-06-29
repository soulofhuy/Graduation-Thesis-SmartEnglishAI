'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/sidebar-layout'
import { studentNavItems } from '@/lib/constants'
import { useAuth } from '@/components/auth-provider'
import { getMyProfile } from '@/services/profiles'
import { useLanguage } from '@/components/language-provider'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { accessToken, logout } = useAuth()
  const { t } = useLanguage()
  const [userName, setUserName] = useState('')

  const navItems = studentNavItems.map((item) => ({
    label: t.navRoles.student[item.labelKey] ?? item.label,
    href: item.href,
    icon: <item.icon className="w-5 h-5" />,
  }))

  useEffect(() => {
    if (!accessToken) {
      return
    }

    const loadProfile = async () => {
      try {
        const result = await getMyProfile(accessToken)
        const profile = result.profile
        const fullName = `${profile.lastName ?? ''} ${profile.firstName ?? ''}`.trim()
        setUserName(fullName)
      } catch {
        setUserName('')
      }
    }

    loadProfile()
  }, [accessToken])

  return (
    <SidebarLayout
      title=""
      navItems={navItems}
      userRole="student"
      userName={userName || 'User'}
      onLogout={() => {
        logout()
        router.push('/login')
      }}
    >
      {children}
    </SidebarLayout>
  )
}
