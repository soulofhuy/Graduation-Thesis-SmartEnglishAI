'use client'

import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/sidebar-layout'
import { adminNavItems } from '@/lib/constants'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const navItems = adminNavItems.map((item) => ({
    label: item.label,
    href: item.href,
    icon: <item.icon className="w-5 h-5" />,
  }))

  return (
    <SidebarLayout
      title="Trang quản trị"
      navItems={navItems}
      userRole="admin"
      userName="Admin Quản Trị"
      onLogout={() => {
        router.push('/login')
      }}
    >
      {children}
    </SidebarLayout>
  )
}
