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

interface Class {
  id: string
  name: string
  teacher: string
  studentCount: number
  status: 'active' | 'inactive'
  createdDate: string
}

export default function AdminClassesPage() {
  const classes: Class[] = [
    {
      id: '1',
      name: 'Lớp 9A1',
      teacher: 'Thầy Nguyễn Văn A',
      studentCount: 30,
      status: 'active',
      createdDate: '2024-01-10',
    },
    {
      id: '2',
      name: 'Lớp 9A2',
      teacher: 'Cô Trần Thị B',
      studentCount: 28,
      status: 'active',
      createdDate: '2024-01-10',
    },
    {
      id: '3',
      name: 'Lớp 9A3',
      teacher: 'Thầy Lê Văn C',
      studentCount: 25,
      status: 'active',
      createdDate: '2024-01-15',
    },
    {
      id: '4',
      name: 'Lớp 8A1',
      teacher: 'Cô Phạm Thị D',
      studentCount: 32,
      status: 'active',
      createdDate: '2024-01-20',
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lí lớp học
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tất cả lớp học trong hệ thống
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm lớp học
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm lớp học..."
          className="pl-10"
        />
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách lớp học</CardTitle>
          <CardDescription>
            Danh sách tất cả lớp học đang hoạt động
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên lớp</TableHead>
                  <TableHead>Giáo viên</TableHead>
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">
                      {classItem.name}
                    </TableCell>
                    <TableCell>{classItem.teacher}</TableCell>
                    <TableCell>{classItem.studentCount}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Hoạt động
                      </span>
                    </TableCell>
                    <TableCell>{classItem.createdDate}</TableCell>
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
