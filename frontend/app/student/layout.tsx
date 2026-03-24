'use client'

import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/sidebar-layout'
import { studentNavItems } from '@/lib/constants'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const navItems = studentNavItems.map((item) => ({
    label: item.label,
    href: item.href,
    icon: <item.icon className="w-5 h-5" />,
  }))

  return (
    <SidebarLayout
      title="Trang học sinh"
      navItems={navItems}
      userRole="student"
      userName="Trần Minh Anh"
      onLogout={() => {
        router.push('/login')
      }}
    >
      {children}
    </SidebarLayout>
  )
}
