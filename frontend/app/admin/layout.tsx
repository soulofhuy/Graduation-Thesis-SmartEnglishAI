'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/sidebar-layout'
import { adminNavItems } from '@/lib/constants'
import { useAuth } from '@/components/auth-provider'
import { getMyProfile } from '@/services/profiles'
import { useLanguage } from '@/components/language-provider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { accessToken, logout } = useAuth()
  const { t } = useLanguage()
  const [userName, setUserName] = useState('')

  const navItems = adminNavItems.map((item) => ({
    label: t.navRoles.admin[item.labelKey] ?? item.label,
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
      navItems={navItems}
      userRole="admin"
      userName={userName || 'Admin'}
      onLogout={() => {
        logout()
        router.push('/login')
      }}
    >
      {children}
    </SidebarLayout>
  )
}
