'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { Users, BookOpen, GraduationCap, TrendingUp, Award } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function AdminOverviewPage() {
  const stats = [
    {
      title: 'Tổng người dùng',
      value: '342',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Giáo viên',
      value: '28',
      icon: <Award className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
    },
    {
      title: 'Học sinh',
      value: '314',
      icon: <GraduationCap className="w-5 h-5" />,
      trend: { value: 9, isPositive: true },
    },
    {
      title: 'Tổng lớp học',
      value: '12',
      icon: <BookOpen className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
    },
  ]

  const userGrowthData = [
    { month: 'T1', users: 120, teachers: 8, students: 112 },
    { month: 'T2', users: 180, teachers: 15, students: 165 },
    { month: 'T3', users: 250, teachers: 22, students: 228 },
    { month: 'T4', users: 320, teachers: 28, students: 292 },
    { month: 'T5', users: 342, teachers: 28, students: 314 },
  ]

  const activityData = [
    { date: 'T2', quizzes: 45, submissions: 89 },
    { date: 'T3', quizzes: 52, submissions: 124 },
    { date: 'T4', quizzes: 68, submissions: 156 },
    { date: 'T5', quizzes: 71, submissions: 168 },
    { date: 'T6', quizzes: 85, submissions: 192 },
  ]

  const recentActivity = [
    {
      id: 1,
      user: 'Thầy Nguyễn Văn A',
      action: 'Tạo bài tập mới',
      timestamp: '2 giờ trước',
    },
    {
      id: 2,
      user: 'Trần Minh Anh',
      action: 'Nộp bài tập',
      timestamp: '1 giờ trước',
    },
    {
      id: 3,
      user: 'Cô Trần Thị B',
      action: 'Tạo lớp học mới',
      timestamp: '30 phút trước',
    },
    {
      id: 4,
      user: 'Phạm Thị Chung',
      action: 'Hoàn thành bài tập',
      timestamp: '15 phút trước',
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-text">
          Tổng quan hệ thống
        </h1>
        <p className="text-lg text-muted-foreground">
          Giám sát hoạt động và thống kê của toàn hệ thống
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* User Growth */}
      <Card className="border-0 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-800/50 backdrop-blur-sm shadow-glow">
        <CardHeader>
          <CardTitle>Tăng trưởng người dùng</CardTitle>
          <CardDescription>
            Biểu đồ tăng trưởng người dùng theo tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="teachers"
                stroke="var(--color-primary)"
                strokeWidth={2}
                name="Giáo viên"
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="var(--color-accent)"
                strokeWidth={2}
                name="Học sinh"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động hệ thống</CardTitle>
          <CardDescription>
            Số lượng bài tập và nộp bài theo tuần
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="quizzes"
                fill="var(--color-primary)"
                name="Bài tập"
              />
              <Bar
                dataKey="submissions"
                fill="var(--color-accent)"
                name="Nộp bài"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>
            Những hoạt động mới nhất trên hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {activity.user}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
