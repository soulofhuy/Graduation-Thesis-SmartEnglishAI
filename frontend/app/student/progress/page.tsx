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
import { getMonthLabel } from '@/lib/language-mappers/month-mapper'

const MAX_X_AXIS_LABEL_CHARS_PER_LINE = 20

const getWrappedLabelLines = (
  label: string,
  maxCharsPerLine = MAX_X_AXIS_LABEL_CHARS_PER_LINE
) => {
  const words = label.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return ['']
  }

  const lines: string[] = []
  let currentLine = ''

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word
    if (nextLine.length <= maxCharsPerLine || !currentLine) {
      currentLine = nextLine
      return
    }

    lines.push(currentLine)
    currentLine = word
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

const renderWrappedXAxisTick = (props: {
  x?: number
  y?: number
  payload?: { value?: string | number }
}) => {
  const { x = 0, y = 0, payload } = props
  const label = String(payload?.value ?? '')
  const lines = getWrappedLabelLines(label)

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={12}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        fontSize={16}
      >
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={0} dy={index === 0 ? 0 : 16}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  )
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
      month: getMonthLabel(item.month, language),
      totalQuestions: item.totalQuestions,
      correctQuestions: item.correctQuestions,
    }))
  }, [language, progress?.monthlyCorrectByTime])

  const topicPerformance = useMemo(() => {
    return (progress?.taskTypeStats ?? []).map((item) => ({
      name: getTaskTypeLabel(item.taskType, language),
      correctQuestions: item.correctQuestions,
      totalQuestions: item.totalQuestions,
    }))
  }, [language, progress?.taskTypeStats])

  const topicXAxisHeight = useMemo(() => {
    const maxLineCount = Math.max(
      1,
      ...topicPerformance.map((item) => getWrappedLabelLines(item.name).length)
    )

    return Math.max(60, maxLineCount * 16 + 24)
  }, [topicPerformance])

  const stats = useMemo(() => {
    const overview = progress?.overview

    return [
      {
        title: t.student.progress.overallStatistic.fieldTotalCompletedAssignments,
        value: overview?.totalAssignmentsDone ?? 0,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      },
      {
        title: t.student.progress.overallStatistic.fieldTotalCompletedQuestion,
        value: overview?.totalQuestionsDone ?? 0,
        icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
      },
      {
        title: t.student.progress.overallStatistic.fieldHighestTaskType,
        value: overview?.bestTaskType ? getTaskTypeLabel(overview.bestTaskType.taskType, language) : '-',
        icon: <Star className="w-5 h-5 text-yellow-500" />,
      },
      {
        title: t.student.progress.overallStatistic.fieldLowestTaskType,
        value: overview?.weakestTaskType ? getTaskTypeLabel(overview.weakestTaskType.taskType, language) : '-',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      },
    ]
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
        <p className="text-muted-foreground">{getToastMessage('invalidToken', language)}</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t.student.progress.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.student.progress.description}
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
            {t.student.progress.monthlyProgress.title}
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
                fill=" hsl(215 20% 65%)"
                name={t.student.progress.monthlyProgress.totalQuestions}
                barSize={35}
              />
              <Bar
                dataKey="correctQuestions"
                fill="hsl(173 58% 39%)"
                name={t.student.progress.monthlyProgress.correctAnswers}
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
            {t.student.progress.taskTypeProgress.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="90%" height={400} className="mx-auto">
            <BarChart
              data={topicPerformance}
              margin={{ top: 8, right: 36, left: 36, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval={0}
                height={topicXAxisHeight}
                tick={renderWrappedXAxisTick}
              />
              <YAxis allowDecimals={false} width={36} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 30 }} />
              <Bar
                dataKey="totalQuestions"
                fill="hsl(73, 65%, 83%)"
                name={t.student.progress.taskTypeProgress.totalQuestions}
                barSize={35}
              />
              <Bar
                dataKey="correctQuestions"
                fill="hsl(33, 76%, 79%)"
                name={t.student.progress.taskTypeProgress.correctAnswers}
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
