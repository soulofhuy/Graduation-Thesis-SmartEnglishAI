'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { StatsCard } from '@/components/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdminOverview, type AdminOverview } from '@/services/admin/overview'
import { getMonthLabel } from '@/lib/language-mappers/month-mapper'
import { useLanguage } from '@/components/language-provider'
import { BookOpen, ClipboardList, GraduationCap, UserRound, Users } from 'lucide-react'
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
import { TOAST_COLORS } from '@/lib/toast/color'
import { getToastMessage } from '@/lib/toast/message'

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
        const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
        toast.error(message, { className: TOAST_COLORS.error })
      }
    }

    void fetchOverview()
  }, [accessToken, isHydrated])

  const statistics = overview?.statistics

  const stats = useMemo(
    () => [
      {
        title: t.admin.overview.statistic.fieldTotalUsers,
        value: statistics?.totalUsers.total ?? 0,
        icon: <Users className="w-5 h-5 text-blue-500" />,
        trend: {
          value: Math.abs(statistics?.totalUsers.growthRate ?? 0),
          isPositive: (statistics?.totalUsers.growthRate ?? 0) >= 0
        }
      },
      {
        title: t.admin.overview.statistic.fieldTotalTeachers,
        value: statistics?.totalTeachers.total ?? 0,
        icon: <GraduationCap className="w-5 h-5 text-green-500" />,
        trend: {
          value: Math.abs(statistics?.totalTeachers.growthRate ?? 0),
          isPositive: (statistics?.totalTeachers.growthRate ?? 0) >= 0
        }
      },
      {
        title: t.admin.overview.statistic.fieldTotalStudents,
        value: statistics?.totalStudents.total ?? 0,
        icon: <UserRound className="w-5 h-5 text-purple-500" />,
        trend: {
          value: Math.abs(statistics?.totalStudents.growthRate ?? 0),
          isPositive: (statistics?.totalStudents.growthRate ?? 0) >= 0
        }
      },
      {
        title: t.admin.overview.statistic.fieldTotalAssignments,
        value: statistics?.totalAssignments.total ?? 0,
        icon: <ClipboardList className="w-5 h-5 text-yellow-500" />,
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

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-semibold mb-3">
            {t.admin.overview.userGrowthByMonthChart.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-5">
          <ResponsiveContainer width="90%" height={400} className="mx-auto">
            <BarChart
              data={userGrowthData}
              margin={{ top: 8, right: 36, left: 36, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 15 }} interval={0} />
              <YAxis allowDecimals={false} width={36} />
              <Tooltip />
              <Legend
                wrapperStyle={{ paddingTop: 30 }}
                formatter={(value) => (
                  <span style={{ marginRight: 100 }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="teachers"
                fill="var(--color-primary)"
                name={t.admin.overview.userGrowthByMonthChart.teacher}
                barSize={24}
              />
              <Bar
                dataKey="students"
                fill="var(--color-accent)"
                name={t.admin.overview.userGrowthByMonthChart.student}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-semibold mb-3">
            {t.admin.overview.assignmentGrowthByMonthChart.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="90%" height={400} className="mx-auto">
            <LineChart
              data={assignmentGrowthData}
              margin={{ top: 8, right: 36, left: 36, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 15 }} interval={0} />
              <YAxis allowDecimals={false} width={36} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="assignments"
                stroke="var(--color-primary)"
                strokeWidth={3}
                name={t.admin.overview.assignmentGrowthByMonthChart.assignment}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-semibold mb-3">
            {t.admin.overview.submissionGrowthByMonthChart.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="90%" height={400} className="mx-auto">
            <BarChart
              data={submissionGrowthData}
              margin={{ top: 8, right: 36, left: 36, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 15 }} interval={0} />
              <YAxis allowDecimals={false} width={36} />
              <Tooltip />
              <Legend
                wrapperStyle={{ paddingTop: 30 }}
                formatter={(value) => (
                  <span style={{ marginRight: 100 }}>
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="submissions"
                fill="var(--color-primary)"
                name={t.admin.overview.submissionGrowthByMonthChart.totalSubmissionsInMonth}
              />
              <Bar
                dataKey="passedSubmissions"
                fill="var(--color-accent)"
                name={t.admin.overview.submissionGrowthByMonthChart.totalPassedAssignmentsInMonth}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
