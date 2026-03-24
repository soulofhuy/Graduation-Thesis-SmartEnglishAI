'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface HistoryItem {
  id: string
  quizName: string
  score: number
  date: string
  duration: number
  status: 'passed' | 'failed'
}

export default function StudentHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const history: HistoryItem[] = [
    {
      id: '1',
      quizName: 'Bài tập ngữ pháp Unit 1',
      score: 8.5,
      date: '2024-03-15',
      duration: 28,
      status: 'passed',
    },
    {
      id: '2',
      quizName: 'Bài tập reading Unit 2',
      score: 7.2,
      date: '2024-03-14',
      duration: 22,
      status: 'passed',
    },
    {
      id: '3',
      quizName: 'Kiểm tra giữa kì',
      score: 6.8,
      date: '2024-03-13',
      duration: 85,
      status: 'passed',
    },
    {
      id: '4',
      quizName: 'Bài tập listening Unit 1',
      score: 5.5,
      date: '2024-03-12',
      duration: 18,
      status: 'failed',
    },
    {
      id: '5',
      quizName: 'Bài tập vocabulary Unit 3',
      score: 9.0,
      date: '2024-03-10',
      duration: 15,
      status: 'passed',
    },
  ]

  const filteredHistory = history.filter((item) =>
    item.quizName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lịch sử</h1>
        <p className="text-muted-foreground mt-1">
          Xem lại lịch sử các bài tập đã làm
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bài tập..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bài tập đã làm</CardTitle>
          <CardDescription>
            Danh sách tất cả các bài tập bạn đã hoàn thành
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên bài tập</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Ngày làm</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.quizName}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-primary">
                          {item.score}/10
                        </span>
                      </TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.duration} phút</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'passed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status === 'passed' ? 'Đạt' : 'Không đạt'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Không tìm thấy bài tập nào
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
