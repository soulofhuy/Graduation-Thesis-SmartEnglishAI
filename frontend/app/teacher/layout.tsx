'use client'

import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/sidebar-layout'
import { teacherNavItems } from '@/lib/constants'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const navItems = teacherNavItems.map((item) => ({
    label: item.label,
    href: item.href,
    icon: <item.icon className="w-5 h-5" />,
  }))

  return (
    <SidebarLayout
      title="Trang giáo viên"
      navItems={navItems}
      userRole="teacher"
      userName="Nguyễn Văn A"
      onLogout={() => {
        router.push('/login')
      }}
    >
      {children}
    </SidebarLayout>
  )
}
