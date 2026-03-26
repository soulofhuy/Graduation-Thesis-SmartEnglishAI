import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
  Inbox,
  TrendingUp,
} from 'lucide-react'

export const teacherNavItems = [
  {
    label: 'Tổng quan',
    href: '/teacher/overview',
    icon: LayoutDashboard,
  },
  {
    label: 'Quản lí lớp học',
    href: '/teacher/classes',
    icon: Users,
  },
  {
    label: 'Quản lí câu hỏi',
    href: '/teacher/quizzes',
    icon: BookOpen,
  },
  {
    label: 'Kết quả học tập',
    href: '/teacher/results',
    icon: BarChart3,
  },
  {
    label: 'Cài đặt tài khoản',
    href: '/teacher/settings',
    icon: Settings,
  },
]

export const studentNavItems = [
  {
    label: 'Tổng quan',
    href: '/student/overview',
    icon: LayoutDashboard,
  },
  {
    label: 'Lớp học của tôi',
    href: '/student/classes',
    icon: GraduationCap,
  },
  {
    label: 'Làm bài tập',
    href: '/student/quiz',
    icon: Inbox,
  },
  {
    label: 'Lịch sử',
    href: '/student/history',
    icon: BarChart3,
  },
  {
    label: 'Tiến độ học tập',
    href: '/student/progress',
    icon: TrendingUp,
  },
  {
    label: 'Cài đặt',
    href: '/student/settings',
    icon: Settings,
  },
]

export const adminNavItems = [
  {
    label: 'Tổng quan hệ thống',
    href: '/admin/overview',
    icon: LayoutDashboard,
  },
  {
    label: 'Quản lí người dùng',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Quản lí lớp học',
    href: '/admin/classes',
    icon: GraduationCap,
  },
  {
    label: 'Quản lí bài tập',
    href: '/admin/quizzes',
    icon: BookOpen,
  },
  {
    label: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings,
  },
]
