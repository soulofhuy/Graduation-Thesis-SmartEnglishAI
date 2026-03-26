'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ModalWrapper } from '@/components/modal-wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Copy, Edit, Trash2, Users, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const classSchema = z.object({
  name: z.string().min(1, 'Tên lớp học là bắt buộc'),
  description: z.string().optional(),
})

type ClassFormValues = z.infer<typeof classSchema>

interface ClassItem {
  id: string
  name: string
  description: string
  studentCount: number
  assignmentCount: number
  joinCode: string
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: '1',
      name: 'Lớp 9A1',
      description: 'Lớp học tiếng Anh nâng cao',
      studentCount: 30,
      assignmentCount: 8,
      joinCode: 'ABC123',
    },
    {
      id: '2',
      name: 'Lớp 9A2',
      description: 'Lớp học tiếng Anh cơ bản',
      studentCount: 28,
      assignmentCount: 6,
      joinCode: 'DEF456',
    },
    {
      id: '3',
      name: 'Lớp 9A3',
      description: 'Lớp học tiếng Anh trung bình',
      studentCount: 25,
      assignmentCount: 5,
      joinCode: 'GHI789',
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  function onSubmit(values: ClassFormValues) {
    const newClass: ClassItem = {
      id: String(classes.length + 1),
      name: values.name,
      description: values.description || '',
      studentCount: 0,
      assignmentCount: 0,
      joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    }

    setClasses([...classes, newClass])
    form.reset()
    setIsModalOpen(false)
    toast.success('Tạo lớp học thành công!')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Sao chép thành công!')
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lí lớp học
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các lớp học của bạn
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Tạo lớp học mới
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {classItem.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {classItem.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    Học sinh
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {classItem.studentCount}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <BookOpen className="w-4 h-4" />
                    Bài tập
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {classItem.assignmentCount}
                  </p>
                </div>
              </div>

              {/* Join Code */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Mã lớp học
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold text-foreground">
                    {classItem.joinCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(classItem.joinCode)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Class Modal */}
      <ModalWrapper
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Tạo lớp học mới"
        description="Nhập thông tin chi tiết cho lớp học mới"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)}>
              Tạo lớp học
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên lớp học</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Lớp 9A1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả lớp học..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </ModalWrapper>
    </div>
  )
}
