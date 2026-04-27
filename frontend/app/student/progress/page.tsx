'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { CheckCircle, HelpCircle, Star, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import {
  getStudentStudyProgress, type StudentStudyProgress,
} from '@/services/student/study-progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getTaskTypeLabel } from '@/lib/language-mappers/task-type-mapper'

const getMonthLabel = (month: string) => {
  const monthPart = Number(month.split('-')[1] ?? 0)
  return monthPart > 0 ? `Thang ${monthPart}` : month
}

export default function StudentProgressPage() {
  const { t, language } = useLanguage()
  const { accessToken, isHydrated } = useAuth()
  const [progress, setProgress] = useState<StudentStudyProgress | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isHydrated || !accessToken) {
      return
    }

    const fetchProgress = async () => {
      setIsLoading(true)
      try {
        const result = await getStudentStudyProgress(accessToken)
        setProgress(result)
      } catch (error) {
        const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
        toast.error(message, { className: TOAST_COLORS.error })
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProgress()
  }, [accessToken, isHydrated])

  const scoreData = useMemo(() => {
    return (progress?.monthlyCorrectByTime ?? []).map((item) => ({
      month: getMonthLabel(item.month),
      totalQuestions: item.totalQuestions,
      correctQuestions: item.correctQuestions,
    }))
  }, [progress?.monthlyCorrectByTime])

  const topicPerformance = useMemo(() => {
    return (progress?.taskTypeStats ?? []).map((item) => ({
      name: getTaskTypeLabel(item.taskType, language),
      correctQuestions: item.correctQuestions,
      totalQuestions: item.totalQuestions,
    }))
  }, [language, progress?.taskTypeStats])

  const stats = useMemo(() => {
    const overview = progress?.overview

    return [
      {
        title: 'Tong bai tap',
        value: overview?.totalAssignmentsDone ?? 0,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      },
      {
        title: 'Tong cau da lam',
        value: overview?.totalQuestionsDone ?? 0,
        icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
      },
      {
        title: 'Task type gioi nhat',
        value: overview?.bestTaskType ? getTaskTypeLabel(overview.bestTaskType.taskType, language) : '-',
        icon: <Star className="w-5 h-5 text-yellow-500" />,
      },
      {
        title: 'Task type can cai thien',
        value: overview?.weakestTaskType ? getTaskTypeLabel(overview.weakestTaskType.taskType, language) : '-',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      },
    ]
  }, [language, progress?.overview])

  const recommendation = useMemo(() => {
    const weakest = progress?.overview.weakestTaskType
    const best = progress?.overview.bestTaskType

    return {
      weakestLabel: weakest ? getTaskTypeLabel(weakest.taskType, language) : '-',
      weakestCorrect: weakest?.correctQuestions ?? 0,
      weakestTotal: weakest?.totalQuestions ?? 0,
      bestLabel: best ? getTaskTypeLabel(best.taskType, language) : '-',
      bestCorrect: best?.correctQuestions ?? 0,
      bestTotal: best?.totalQuestions ?? 0,
    }
  }, [language, progress?.overview])

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Dang tai tien do hoc tap...</p>
      </div>
    )
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Vui long dang nhap de xem tien do hoc tap</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Lịch sử học tập của bạn
        </h1>
        <p className="text-muted-foreground mt-1">
          description
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Score Trend */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-semibold mb-3">
            Biểu đồ thể hiện số câu hỏi đúng theo tháng
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-5">
          <ResponsiveContainer width="90%" height={400} className="mx-auto">
            <BarChart
              data={scoreData}
              margin={{ top: 8, right: 36, left: 36, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} width={36} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 30 }} />
              <Bar
                dataKey="totalQuestions"
                fill="hsl(221 83% 53%)"
                name="Tong cau"
                barSize={35}
              />
              <Bar
                dataKey="correctQuestions"
                fill="hsl(142 76% 36%)"
                name="Cau dung"
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Topic Performance */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-lg font-semibold mb-3">
            Biểu đồ thể hiện số câu hỏi đúng theo từng chủ đề
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="90%" height={400} className="mx-auto">
            <BarChart
              data={topicPerformance}
              margin={{ top: 8, right: 36, left: 36, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} width={36} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 30 }} />
              <Bar
                dataKey="totalQuestions"
                fill="hsl(221 83% 53%)"
                name="Tong cau"
                barSize={35}
              />
              <Bar
                dataKey="correctQuestions"
                fill="hsl(142 76% 36%)"
                name="Cau dung"
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
