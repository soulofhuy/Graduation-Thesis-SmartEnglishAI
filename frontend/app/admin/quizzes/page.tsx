'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Quiz {
  id: string
  title: string
  creator: string
  questionCount: number
  status: 'published' | 'draft'
  usageCount: number
  createdDate: string
}

export default function AdminQuizzesPage() {
  const quizzes: Quiz[] = [
    {
      id: '1',
      title: 'Bài tập ngữ pháp Unit 1',
      creator: 'Thầy Nguyễn Văn A',
      questionCount: 20,
      status: 'published',
      usageCount: 89,
      createdDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'Bài tập reading Unit 2',
      creator: 'Cô Trần Thị B',
      questionCount: 15,
      status: 'published',
      usageCount: 76,
      createdDate: '2024-01-20',
    },
    {
      id: '3',
      title: 'Kiểm tra giữa kì',
      creator: 'Thầy Nguyễn Văn A',
      questionCount: 50,
      status: 'published',
      usageCount: 120,
      createdDate: '2024-02-01',
    },
    {
      id: '4',
      title: 'Bài tập listening Unit 3',
      creator: 'Cô Phạm Thị D',
      questionCount: 12,
      status: 'draft',
      usageCount: 0,
      createdDate: '2024-02-10',
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lí bài tập
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tất cả bài tập trong hệ thống
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm bài tập
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bài tập..."
          className="pl-10"
        />
      </div>

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài tập</CardTitle>
          <CardDescription>
            Danh sách tất cả bài tập trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lần sử dụng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {quiz.title}
                    </TableCell>
                    <TableCell>{quiz.creator}</TableCell>
                    <TableCell>{quiz.questionCount}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          quiz.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {quiz.status === 'published' ? 'Công khai' : 'Nháp'}
                      </span>
                    </TableCell>
                    <TableCell>{quiz.usageCount}</TableCell>
                    <TableCell>{quiz.createdDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Chi tiết
                      </Button>
                    </TableCell>
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
