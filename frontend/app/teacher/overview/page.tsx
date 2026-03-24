'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/stats-card'
import { Users, BookOpen, FileText, BarChart3, Plus, Sparkles } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function TeacherOverviewPage() {
  // Mock data
  const stats = [
    {
      title: 'Tổng lớp học',
      value: '5',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 2, isPositive: true },
    },
    {
      title: 'Tổng học sinh',
      value: '156',
      icon: <Users className="w-5 h-5" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Tổng bài tập',
      value: '24',
      icon: <BookOpen className="w-5 h-5" />,
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Điểm trung bình',
      value: '7.8/10',
      icon: <BarChart3 className="w-5 h-5" />,
      trend: { value: 3, isPositive: true },
    },
  ]

  const recentAssignments = [
    {
      id: 1,
      name: 'Bài tập ngữ pháp Unit 1',
      class: '9A1',
      dueDate: '2024-03-25',
      submissions: '28/30',
    },
    {
      id: 2,
      name: 'Bài tập reading Unit 2',
      class: '9A2',
      dueDate: '2024-03-26',
      submissions: '25/28',
    },
    {
      id: 3,
      name: 'Kiểm tra giữa kì',
      class: '9A1',
      dueDate: '2024-03-27',
      submissions: '30/30',
    },
    {
      id: 4,
      name: 'Bài tập writing Unit 3',
      class: '9A3',
      dueDate: '2024-03-28',
      submissions: '20/25',
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
          Chào mừng trở lại, thầy Nguyễn Văn A
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Tạo bài tập
        </Button>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          Tạo câu hỏi bằng AI
        </Button>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Bài tập gần đây</CardTitle>
          <CardDescription>
            Danh sách các bài tập được giao gần đây nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Hạn nộp</TableHead>
                  <TableHead>Nộp bài</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      {assignment.name}
                    </TableCell>
                    <TableCell>{assignment.class}</TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                    <TableCell>{assignment.submissions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
