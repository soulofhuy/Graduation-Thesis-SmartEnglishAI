'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { StatsCard } from '@/components/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminOverview, type AdminOverview } from '@/services/admin/overview'
import { getMonthLabel } from '@/lib/language-mappers/month-mapper'
import { useLanguage } from '@/components/language-provider'
import { BookOpen, GraduationCap, Users } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { toast } from 'sonner'

const monthFallback = Array.from({ length: 12 }, (_, index) => ({
  month: `2026-${String(index + 1).padStart(2, '0')}`,
  teachers: 0,
  students: 0,
  assignments: 0,
  submissions: 0,
  passedSubmissions: 0
}))

export default function AdminOverviewPage() {
  const { accessToken, isHydrated } = useAuth()
  const { t, language } = useLanguage()
  const [overview, setOverview] = useState<AdminOverview | null>(null)

  useEffect(() => {
    const fetchOverview = async () => {
      if (!accessToken || !isHydrated) {
        return
      }

      try {
        const data = await getAdminOverview(accessToken)
        setOverview(data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể tải overview admin')
      }
    }

    void fetchOverview()
  }, [accessToken, isHydrated])

  const statistics = overview?.statistics

  const stats = useMemo(
    () => [
      {
        title: 'Tổng người dùng',
        value: statistics?.totalUsers.total ?? 0,
        icon: <Users className="w-5 h-5" />,
        trend: {
          value: Math.abs(statistics?.totalUsers.growthRate ?? 0),
          isPositive: (statistics?.totalUsers.growthRate ?? 0) >= 0
        }
      },
      {
        title: 'Giáo viên',
        value: statistics?.totalTeachers.total ?? 0,
        icon: <GraduationCap className="w-5 h-5" />,
        trend: {
          value: Math.abs(statistics?.totalTeachers.growthRate ?? 0),
          isPositive: (statistics?.totalTeachers.growthRate ?? 0) >= 0
        }
      },
      {
        title: 'Học sinh',
        value: statistics?.totalStudents.total ?? 0,
        icon: <Users className="w-5 h-5" />,
        trend: {
          value: Math.abs(statistics?.totalStudents.growthRate ?? 0),
          isPositive: (statistics?.totalStudents.growthRate ?? 0) >= 0
        }
      },
      {
        title: 'Tổng bài tập',
        value: statistics?.totalAssignments.total ?? 0,
        icon: <BookOpen className="w-5 h-5" />,
        trend: {
          value: Math.abs(statistics?.totalAssignments.growthRate ?? 0),
          isPositive: (statistics?.totalAssignments.growthRate ?? 0) >= 0
        }
      }
    ],
    [statistics]
  )

  const userGrowthData = useMemo(() => {
    const source = overview?.userGrowthByMonth ?? monthFallback

    return source.map(item => ({
      month: getMonthLabel(item.month, language),
      teachers: item.teachers,
      students: item.students
    }))
  }, [language, overview?.userGrowthByMonth])

  const assignmentGrowthData = useMemo(() => {
    const source = overview?.assignmentGrowthByMonth ?? monthFallback

    return source.map(item => ({
      month: getMonthLabel(item.month, language),
      assignments: item.assignments
    }))
  }, [language, overview?.assignmentGrowthByMonth])

  const submissionGrowthData = useMemo(() => {
    const source = overview?.submissionGrowthByMonth ?? monthFallback

    return source.map(item => ({
      month: getMonthLabel(item.month, language),
      submissions: item.submissions,
      passedSubmissions: item.passedSubmissions
    }))
  }, [language, overview?.submissionGrowthByMonth])

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t.student.progress.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.student.progress.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      <Card className="border-0 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-800/50 backdrop-blur-sm shadow-glow">
        <CardHeader>
          <CardTitle>Tăng trưởng người dùng</CardTitle>
          <CardDescription>
            Biểu đồ số lượng giáo viên và học sinh theo từng tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
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
                strokeWidth={3}
                name="Giáo viên"
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="var(--color-accent)"
                strokeWidth={3}
                name="Học sinh"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tăng trưởng bài tập</CardTitle>
          <CardDescription>
            Biểu đồ số lượng bài tập được tạo theo từng tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={assignmentGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="assignments"
                stroke="var(--color-primary)"
                strokeWidth={3}
                name="Bài tập"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission theo tháng</CardTitle>
          <CardDescription>
            Số lượng submission của học sinh và số submission đạt yêu cầu trên 50%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={submissionGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="submissions"
                fill="var(--color-primary)"
                name="Submission"
              />
              <Bar
                dataKey="passedSubmissions"
                fill="var(--color-accent)"
                name="Đạt yêu cầu"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
