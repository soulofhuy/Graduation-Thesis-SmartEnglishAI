'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ModalWrapper } from '@/components/modal-wrapper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Copy, Edit, Trash2, Users, BookOpen, Grid, TableCellsMerge, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { createClass, getClassesByTeacherId } from '@/services/teacher/classes'
import type { Class as BackendClass } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
import { TOAST_COLORS } from '@/lib/toast/color'
import { useLanguage } from '@/components/language-provider'
import { Switch } from '@/components/ui/switch'
import { createClassSchema, type ClassFormValues } from '@/lib/validators/class'
import { EditClassModal } from './edit-class-modal'
import { DeleteClassModal } from './delete-class-modal'
import { getToastMessage } from '@/lib/toast/message'
import { Badge } from '@/components/ui/badge'
import { PendingRequestsModal } from './pending-requests-modal'

const classSchema = createClassSchema()

export default function TeacherClassesPage() {
  const { t, language } = useLanguage();
  const { accessToken, user } = useAuth()
  const [classes, setClasses] = useState<BackendClass[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<BackendClass | null>(null)
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      description: '',
      needsTeacherApproval: false
    },
  })

  const reloadClasses = async () => {
    if (!accessToken || !user?.id) {
      return
    }

    try {
      const result = await getClassesByTeacherId(accessToken, user.id, true)
      setClasses(result.classes)
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    }
  }

  useEffect(() => {
    if (!accessToken || !user?.id) {
      return
    }

    const loadClasses = async () => {
      setIsLoading(true)
      try {
        const result = await getClassesByTeacherId(accessToken, user.id, true)
        setClasses(result.classes)
      } catch (error) {
        const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
        toast.error(message, { className: TOAST_COLORS.error })
      } finally {
        setIsLoading(false)
      }
    }

    loadClasses()
  }, [accessToken, user?.id, language])

  async function onSubmit(values: ClassFormValues) {
    if (!accessToken) {
      toast.error(getToastMessage('invalidToken', language), { className: TOAST_COLORS.error })
      return
    }

    setIsCreating(true)
    try {
      const result = await createClass(accessToken, {
        name: values.name,
        description: values.description || null,
        needsTeacherApproval: values.needsTeacherApproval
      })
      setClasses((prev) => [...prev, result.class])
      form.reset()
      setIsModalOpen(false)
      toast.success(result.message, { className: TOAST_COLORS.success })
    } catch (error) {
      const message = error instanceof Error ? error.message : getToastMessage('saveFailed', language)
      toast.error(message, { className: TOAST_COLORS.error })
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(getToastMessage('copySuccess', language), { className: TOAST_COLORS.success })
  }

  const handleEditClass = (classItem: BackendClass) => {
    setSelectedClass(classItem)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = (updatedClass: BackendClass) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    )
  }

  const handleDeleteClass = (classItem: BackendClass) => {
    setSelectedClass(classItem)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteSuccess = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId))
  }

  const handleViewPendingRequests = (classItem: BackendClass) => {
    setSelectedClass(classItem)
    setIsPendingModalOpen(true)
  }

  const getPendingRequestCount = (classItem: BackendClass) => {
    return (
      classItem.classMembers?.filter(
        (member) => !member.isApproved && !member.isRejected && !member.isBanned
      ).length ?? 0
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.teacher.classes.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.teacher.classes.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-1">
            <span className="px-2 text-xs font-medium tracking-wide text-muted-foreground">
              {t.common.viewPort}
            </span>
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className="rounded-sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              className="rounded-sm"
              onClick={() => setViewMode('table')}
            >
              <TableCellsMerge className="h-4 w-4" />
            </Button>
          </div>
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            {t.common.add}
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            ... {t.common.loading}
          </CardContent>
        </Card>
      )}

      {!isLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => {
            const studentCount = classItem.approvedStudentsCount ?? 0
            const assignmentCount = 0
            const pendingCount = getPendingRequestCount(classItem)

            return (
              <Card key={classItem.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg border bg-background/90 p-1 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8"
                    onClick={() => handleViewPendingRequests(classItem)}
                  >
                    <Eye className="w-4 h-4" />
                    {pendingCount > 0 ? (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white">
                        {pendingCount}
                      </span>
                    ) : null}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditClass(classItem)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteClass(classItem)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <CardHeader className="pr-28">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                      {classItem?.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {classItem?.description || 'Chưa có mô tả cho lớp học này'}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                        {t.teacher.classes.gridViewport.fieldStudentNumber}
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {studentCount}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <BookOpen className="w-4 h-4" />
                        {t.teacher.classes.gridViewport.fieldAssignmentNumber}
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {assignmentCount}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                        {t.teacher.classes.gridViewport.fieldPendingRequestNumber}
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {pendingCount}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t.teacher.classes.gridViewport.fieldClassCode}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-bold text-foreground">
                          {classItem?.classCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(classItem?.classCode ?? '')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && viewMode === 'table' && (
        <Card>
          <CardHeader>
            <CardTitle>{t.teacher.classes.title}</CardTitle>
            <CardDescription>{t.teacher.classes.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.teacher.classes.tableViewport.columnName}</TableHead>
                    <TableHead>{t.teacher.classes.tableViewport.columnDescription}</TableHead>
                    <TableHead>{t.teacher.classes.tableViewport.columnStudentNumber}</TableHead>
                    <TableHead>{t.teacher.classes.tableViewport.columnAssignmentNumber}</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>{t.teacher.classes.tableViewport.columnClassCode}</TableHead>
                    <TableHead className="text-right">{t.teacher.classes.tableViewport.columnActions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((classItem) => {
                    const studentCount = classItem.approvedStudentsCount ?? 0
                    const assignmentCount = 0
                    const pendingCount = getPendingRequestCount(classItem)

                    return (
                      <TableRow key={classItem.id}>
                        <TableCell className="font-medium">
                          {classItem?.name}
                        </TableCell>
                        <TableCell>{classItem?.description}</TableCell>
                        <TableCell>{studentCount}</TableCell>
                        <TableCell>{assignmentCount}</TableCell>
                        <TableCell>
                          <Badge variant={pendingCount > 0 ? 'secondary' : 'outline'}>
                            {pendingCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono font-bold">
                              {classItem?.classCode}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(classItem?.classCode ?? '')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="relative"
                              onClick={() => handleViewPendingRequests(classItem)}
                            >
                              <Eye className="h-4 w-4" />
                              {pendingCount > 0 ? (
                                <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-4 text-white">
                                  {pendingCount}
                                </span>
                              ) : null}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditClass(classItem)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(classItem)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <ModalWrapper
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={t.teacher.classes.addClass.title}
        description={t.teacher.classes.addClass.description}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isCreating}>
              {isCreating ? t.common.isSaving : t.common.save}
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
                  <FormLabel>{t.teacher.classes.addClass.fieldName}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.teacher.classes.addClass.fieldNamePlaceholder} {...field} />
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
                  <FormLabel>{t.teacher.classes.addClass.fieldDescription}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t.teacher.classes.addClass.fieldDescriptionPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="needsTeacherApproval"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormLabel>{t.teacher.classes.addClass.fieldNeedsTeacherApproval}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </ModalWrapper>

      <EditClassModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        classItem={selectedClass}
        accessToken={accessToken || ''}
        onSuccess={handleEditSuccess}
      />

      <DeleteClassModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        classItem={selectedClass}
        accessToken={accessToken || ''}
        onSuccess={handleDeleteSuccess}
      />

      <PendingRequestsModal
        isOpen={isPendingModalOpen}
        onOpenChange={setIsPendingModalOpen}
        classItem={selectedClass}
        accessToken={accessToken || ''}
        onActionSuccess={reloadClasses}
      />
    </div>
  )
}

