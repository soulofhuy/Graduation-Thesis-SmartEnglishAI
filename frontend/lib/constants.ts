import {
  LayoutDashboard,
  Users,
  UserRound,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
  Inbox,
  TrendingUp,
  Trash2
} from 'lucide-react';

export type StudentNavLabelKey =
  | 'class'
  | 'assignment'
  | 'history'
  | 'progress'
  | 'settings';

export type TeacherNavLabelKey =
  | 'overview'
  | 'classes'
  | 'students'
  | 'assignments'
  | 'results'
  | 'trashBin'
  | 'settings';

export const teacherNavItems = [
  {
    label: 'Tổng quan',
    labelKey: 'overview' as TeacherNavLabelKey,
    href: '/teacher/overview',
    icon: LayoutDashboard
  },
  {
    label: 'Quản lí lớp học',
    labelKey: 'classes' as TeacherNavLabelKey,
    href: '/teacher/classes',
    icon: Users
  },
  {
    label: 'Quản lí học sinh',
    labelKey: 'students' as TeacherNavLabelKey,
    href: '/teacher/students',
    icon: UserRound
  },
  {
    label: 'Quản lí câu hỏi',
    labelKey: 'assignments' as TeacherNavLabelKey,
    href: '/teacher/quizzes',
    icon: BookOpen
  },
  {
    label: 'Kết quả học tập',
    labelKey: 'results' as TeacherNavLabelKey,
    href: '/teacher/results',
    icon: BarChart3
  },
  {
    label: 'Thùng rác',
    labelKey: 'trashBin' as TeacherNavLabelKey,
    href: '/teacher/trash',
    icon: Trash2
  },
  {
    label: 'Cài đặt tài khoản',
    labelKey: 'settings' as TeacherNavLabelKey,
    href: '/teacher/settings',
    icon: Settings
  }
];

export const studentNavItems = [
  {
    label: 'Lớp học của tôi',
    labelKey: 'class' as StudentNavLabelKey,
    href: '/student/classes',
    icon: GraduationCap
  },
  {
    label: 'Làm bài tập',
    labelKey: 'assignment' as StudentNavLabelKey,
    href: '/student/quiz',
    icon: Inbox
  },
  {
    label: 'Lịch sử',
    labelKey: 'history' as StudentNavLabelKey,
    href: '/student/history',
    icon: BarChart3
  },
  {
    label: 'Tiến độ học tập',
    labelKey: 'progress' as StudentNavLabelKey,
    href: '/student/progress',
    icon: TrendingUp
  },
  {
    label: 'Cài đặt',
    labelKey: 'settings' as StudentNavLabelKey,
    href: '/student/settings',
    icon: Settings
  }
];

export const adminNavItems = [
  {
    label: 'Tổng quan hệ thống',
    href: '/admin/overview',
    icon: LayoutDashboard
  },
  {
    label: 'Quản lí người dùng',
    href: '/admin/users',
    icon: Users
  },
  {
    label: 'Quản lí học viên',
    href: '/admin/students',
    icon: UserRound
  },
  {
    label: 'Quản lí lớp học',
    href: '/admin/classes',
    icon: GraduationCap
  },
  {
    label: 'Quản lí bài tập',
    href: '/admin/quizzes',
    icon: BookOpen
  },
  {
    label: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings
  }
];
