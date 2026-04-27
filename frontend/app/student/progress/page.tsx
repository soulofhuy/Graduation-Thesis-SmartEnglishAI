'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { TrendingUp, Target, Zap, Award } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import {
  getStudentStudyProgress,
  type StudentStudyProgress,
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

const taskTypeLabelMap: Record<string, string> = {
  PRONUNCIATION: 'Phat am',
  WORD_STRESS: 'Trong am',
  SITUATIONAL_DIALOG: 'Hoi thoai tinh huong',
  MULTIPLE_CHOICE: 'Trac nghiem',
  CLOZE_PASSAGE: 'Dien vao doan van',
  READING_COMPREHENSION: 'Doc hieu',
}

const getTaskTypeLabel = (taskType: string) => {
  return taskTypeLabelMap[taskType] ?? taskType
}

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
      name: getTaskTypeLabel(item.taskType),
      correctQuestions: item.correctQuestions,
      totalQuestions: item.totalQuestions,
    }))
  }, [progress?.taskTypeStats])

  const stats = useMemo(() => {
    const overview = progress?.overview

    return [
      {
        title: 'Tong bai tap',
        value: overview?.totalAssignmentsDone ?? 0,
        icon: <Target className="w-5 h-5" />,
      },
      {
        title: 'Tong cau da lam',
        value: overview?.totalQuestionsDone ?? 0,
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        title: 'Task type gioi nhat',
        value: overview?.bestTaskType
          ? getTaskTypeLabel(overview.bestTaskType.taskType)
          : '-',
        icon: <Award className="w-5 h-5" />,
      },
      {
        title: 'Task type can cai thien',
        value: overview?.weakestTaskType
          ? getTaskTypeLabel(overview.weakestTaskType.taskType)
          : '-',
        icon: <Zap className="w-5 h-5" />,
      },
    ]
  }, [progress?.overview])

  const recommendation = useMemo(() => {
    const weakest = progress?.overview.weakestTaskType
    const best = progress?.overview.bestTaskType

    return {
      weakestLabel: weakest ? getTaskTypeLabel(weakest.taskType) : '-',
      weakestCorrect: weakest?.correctQuestions ?? 0,
      weakestTotal: weakest?.totalQuestions ?? 0,
      bestLabel: best ? getTaskTypeLabel(best.taskType) : '-',
      bestCorrect: best?.correctQuestions ?? 0,
      bestTotal: best?.totalQuestions ?? 0,
    }
  }, [progress?.overview])

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
          Tiến độ học tập
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo doi tien do hoc tap va hieu suat cua ban
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
        <CardHeader>
          <CardTitle>So cau dung theo thang</CardTitle>
          <CardDescription>
            Bieu do tong cau va cau dung theo tung thang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="totalQuestions"
                fill="hsl(221 83% 53%)"
                name="Tong cau"
              />
              <Bar
                dataKey="correctQuestions"
                fill="hsl(142 76% 36%)"
                name="Cau dung"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Topic Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Hieu suat theo task type</CardTitle>
          <CardDescription>
            Tong cau da lam va so cau dung theo tung task type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="totalQuestions"
                fill="hsl(221 83% 53%)"
                name="Tong cau"
              />
              <Bar
                dataKey="correctQuestions"
                fill="hsl(142 76% 36%)"
                name="Cau dung"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Goi y cai thien</CardTitle>
          <CardDescription>
            Dua tren hieu suat thuc te tu bai da lam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-1">
              Tap trung vao {recommendation.weakestLabel}
            </h4>
            <p className="text-sm text-amber-800">
              Day la nhom bai co so cau dung thap nhat ({recommendation.weakestCorrect}/{recommendation.weakestTotal}).
              Ban nen uu tien luyen them dang bai nay.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-1">
              Duy tri tien do theo thang
            </h4>
            <p className="text-sm text-blue-800">
              Theo doi duong bieu do cau dung va tong cau moi thang de giu nhip hoc on dinh.
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-1">
              The manh hien tai: {recommendation.bestLabel}
            </h4>
            <p className="text-sm text-green-800">
              Ban dang lam rat tot o nhom nay ({recommendation.bestCorrect}/{recommendation.bestTotal}).
              Tiep tuc duy tri phong do nay.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
