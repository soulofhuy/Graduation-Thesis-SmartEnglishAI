'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, MoreVertical } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student'
  status: 'active' | 'inactive'
  createdDate: string
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      role: 'teacher',
      status: 'active',
      createdDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Trần Minh Anh',
      email: 'tranminhanh@example.com',
      role: 'student',
      status: 'active',
      createdDate: '2024-02-01',
    },
    {
      id: '3',
      name: 'Cô Trần Thị B',
      email: 'tranthib@example.com',
      role: 'teacher',
      status: 'active',
      createdDate: '2024-01-20',
    },
    {
      id: '4',
      name: 'Phạm Thị Chung',
      email: 'phamthichung@example.com',
      role: 'student',
      status: 'inactive',
      createdDate: '2024-02-10',
    },
    {
      id: '5',
      name: 'Lê Đức Dũng',
      email: 'leducdung@example.com',
      role: 'student',
      status: 'active',
      createdDate: '2024-02-15',
    },
  ])

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive/10 text-destructive'
      case 'teacher':
        return 'bg-primary/10 text-primary'
      case 'student':
        return 'bg-accent/10 text-accent'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên'
      case 'teacher':
        return 'Giáo viên'
      case 'student':
        return 'Học sinh'
      default:
        return role
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lí người dùng
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            Quản lý thông tin và quyền hạn của người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.createdDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Edit className="w-4 h-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              Đặt lại mật khẩu
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => {
                                setUsers(users.filter((u) => u.id !== user.id))
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Không tìm thấy người dùng nào
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
