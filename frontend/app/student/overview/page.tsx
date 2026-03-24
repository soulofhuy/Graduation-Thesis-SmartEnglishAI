'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/stats-card'
import { CheckCircle, Clock, TrendingUp, Flame } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

export default function StudentOverviewPage() {
  const stats = [
    {
      title: 'Hoàn thành',
      value: '18',
      icon: <CheckCircle className="w-5 h-5" />,
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Chưa làm',
      value: '3',
      icon: <Clock className="w-5 h-5" />,
      trend: { value: 0, isPositive: false },
    },
    {
      title: 'Điểm TB',
      value: '8.2',
      icon: <TrendingUp className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
    },
    {
      title: 'Streak',
      value: '7 ngày',
      icon: <Flame className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
    },
  ]

  const scoreData = [
    { date: 'T2', score: 7 },
    { date: 'T3', score: 7.5 },
    { date: 'T4', score: 8 },
    { date: 'T5', score: 7.8 },
    { date: 'T6', score: 8.5 },
    { date: 'T7', score: 8.2 },
    { date: 'CN', score: 8.5 },
  ]

  const pendingAssignments = [
    {
      id: 1,
      name: 'Bài tập writing Unit 3',
      class: 'Lớp 9A1',
      dueDate: '2024-03-25',
      daysLeft: 2,
    },
    {
      id: 2,
      name: 'Bài tập listening Unit 4',
      class: 'Lớp 9A1',
      dueDate: '2024-03-28',
      daysLeft: 5,
    },
    {
      id: 3,
      name: 'Kiểm tra cuối kì',
      class: 'Lớp 9A1',
      dueDate: '2024-04-01',
      daysLeft: 9,
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-text">
          Tổng quan
        </h1>
        <p className="text-lg text-muted-foreground">
          Chào mừng trở lại, Trần Minh Anh
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Score Trend */}
      <Card className="border-0 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-800/50 backdrop-blur-sm shadow-glow">
        <CardHeader>
          <CardTitle className="bg-gradient-text">Xu hướng điểm số</CardTitle>
          <CardDescription>
            Biểu đồ điểm số trong tuần qua
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pending Assignments */}
      <Card className="border-0 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-800/50 backdrop-blur-sm shadow-glow">
        <CardHeader>
          <CardTitle>Bài tập sắp đến hạn</CardTitle>
          <CardDescription>
            Danh sách bài tập cần hoàn thành
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingAssignments.length > 0 ? (
            <div className="space-y-3">
              {pendingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {assignment.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.class}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      Còn {assignment.daysLeft} ngày
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignment.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Không có bài tập sắp đến hạn
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
