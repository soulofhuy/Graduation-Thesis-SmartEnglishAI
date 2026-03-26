'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { TrendingUp, Target, Zap, Award } from 'lucide-react'
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

export default function StudentProgressPage() {
  const scoreData = [
    { month: 'Tháng 1', average: 6.5 },
    { month: 'Tháng 2', average: 7.0 },
    { month: 'Tháng 3', average: 7.5 },
    { month: 'Tháng 4', average: 8.0 },
    { month: 'Tháng 5', average: 8.2 },
  ]

  const topicPerformance = [
    { name: 'Grammar', score: 8.5 },
    { name: 'Reading', score: 7.8 },
    { name: 'Writing', score: 7.2 },
    { name: 'Listening', score: 6.5 },
    { name: 'Vocabulary', score: 8.8 },
  ]

  const stats = [
    {
      title: 'Tổng bài tập',
      value: '18',
      icon: <Target className="w-5 h-5" />,
    },
    {
      title: 'Điểm trung bình',
      value: '8.2/10',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      title: 'Chủ đề giỏi nhất',
      value: 'Vocabulary',
      icon: <Award className="w-5 h-5" />,
    },
    {
      title: 'Cần cải thiện',
      value: 'Listening',
      icon: <Zap className="w-5 h-5" />,
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Tiến độ học tập
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi tiến độ học tập và hiệu suất của bạn
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
          <CardTitle>Xu hướng điểm số</CardTitle>
          <CardDescription>
            Biểu đồ điểm trung bình theo tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--color-primary)"
                strokeWidth={2}
                name="Điểm trung bình"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Topic Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất theo chủ đề</CardTitle>
          <CardDescription>
            Điểm số trung bình của bạn theo từng chủ đề
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar
                dataKey="score"
                fill="var(--color-primary)"
                name="Điểm"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Gợi ý cải thiện</CardTitle>
          <CardDescription>
            Dựa trên hiệu suất của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-1">
              Tập trung vào Listening
            </h4>
            <p className="text-sm text-amber-800">
              Điểm của bạn trong chủ đề này đang thấp nhất. Hãy làm thêm các bài tập listening để cải thiện kỹ năng.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-1">
              Duy trì tiến độ Writing
            </h4>
            <p className="text-sm text-blue-800">
              Mặc dù Writing không phải là điểm mạnh nhất, nhưng bạn đang tiến bộ đều đặn. Tiếp tục cố gắng!
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-1">
              Tuyệt vời! Bạn giỏi Vocabulary
            </h4>
            <p className="text-sm text-green-800">
              Bạn đang làm rất tốt trong chủ đề này. Hãy tiếp tục và hỗ trợ bạn cùng lớp!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
