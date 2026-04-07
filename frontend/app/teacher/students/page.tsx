'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Eye, Search, Users } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { Class, ClassMember } from '@/lib/types'
import { getClassesByTeacherId } from '@/services/teacher/classes'
import { getAllStudentsByClassId } from '@/services/classes'
import { StudentListTable } from './_components/student-list-table'
import { DeactivatedStudentsModal } from './_components/deactivated-students-modal'
import { useLanguage } from '@/components/language-provider'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'

const DEFAULT_PAGE_SIZE = 10

export default function TeacherStudentsPage() {
    const { t, language } = useLanguage()
    const { accessToken, user } = useAuth()

    const [classes, setClasses] = useState<Class[]>([])
    const [members, setMembers] = useState<ClassMember[]>([])
    const [selectedClassId, setSelectedClassId] = useState<string>('')
    const [searchValue, setSearchValue] = useState('')
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [isClassLoading, setIsClassLoading] = useState(false)
    const [isStudentLoading, setIsStudentLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPrevPage, setHasPrevPage] = useState(false)
    const [removedMemberIds, setRemovedMemberIds] = useState<Record<string, boolean>>({})
    const [isDeactivatedModalOpen, setIsDeactivatedModalOpen] = useState(false)

    useEffect(() => {
        if (!accessToken || !user?.id) {
            return
        }

        const loadClasses = async () => {
            setIsClassLoading(true)
            try {
                const result = await getClassesByTeacherId(accessToken, user.id)
                setClasses(result.classes)
            } catch (error) {
                const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
                toast.error(message)
            } finally {
                setIsClassLoading(false)
            }
        }

        void loadClasses()
    }, [accessToken, user?.id])

    const selectedClass = useMemo(() => {
        return classes.find((classItem) => classItem.id === selectedClassId) ?? null
    }, [classes, selectedClassId])

    const deactivatedMembers = useMemo(() => {
        return members.filter((member) => removedMemberIds[member.id])
    }, [members, removedMemberIds])


    const loadStudentsByClass = async (classId: string, page: number) => {
        if (!accessToken || !user?.id) {
            return
        }

        setIsStudentLoading(true)
        try {
            const classDetail = await getAllStudentsByClassId(accessToken, classId, page, pageSize)
            const pagination = classDetail?.pagination

            setMembers(classDetail?.classMembers ?? [])
            setCurrentPage(pagination?.page ?? page)
            setTotalItems(pagination?.totalItems ?? 0)
            setHasNextPage(Boolean(pagination?.hasNextPage))
            setHasPrevPage(Boolean(pagination?.hasPrevPage))
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
            toast.error(message)
        } finally {
            setIsStudentLoading(false)
        }
    }

    const handlePageSizeChange = async (nextPageSize: number) => {
        setPageSize(nextPageSize)
        setCurrentPage(1)

        if (selectedClassId) {
            setIsStudentLoading(true)
            try {
                const classDetail = await getAllStudentsByClassId(accessToken || '', selectedClassId, 1, nextPageSize)
                const pagination = classDetail?.pagination

                setMembers(classDetail?.classMembers ?? [])
                setCurrentPage(pagination?.page ?? 1)
                setTotalItems(pagination?.totalItems ?? 0)
                setHasNextPage(Boolean(pagination?.hasNextPage))
                setHasPrevPage(Boolean(pagination?.hasPrevPage))
            } catch (error) {
                const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
                toast.error(message)
            } finally {
                setIsStudentLoading(false)
            }
        }
    }

    const handleSelectClass = async (classId: string) => {
        if (!accessToken || !user?.id) {
            return
        }

        setSelectedClassId(classId)
        setMembers([])
        setRemovedMemberIds({})
        setCurrentPage(1)
        await loadStudentsByClass(classId, 1)
    }

    const handleDeactivateMember = (memberId: string) => {
        setRemovedMemberIds((prev) => ({
            ...prev,
            [memberId]: true,
        }))
    }

    const handleReactivateMember = (memberId: string) => {
        setRemovedMemberIds((prev) => {
            if (!prev[memberId]) {
                return prev
            }

            const next = { ...prev }
            delete next[memberId]
            return next
        })
        toast.success(getToastMessage('restoreSuccess', language), { className: TOAST_COLORS.success })
    }

    const handlePrevPage = async () => {
        if (!selectedClassId || !hasPrevPage || isStudentLoading) {
            return
        }

        await loadStudentsByClass(selectedClassId, currentPage - 1)
    }

    const handleNextPage = async () => {
        if (!selectedClassId || !hasNextPage || isStudentLoading) {
            return
        }

        await loadStudentsByClass(selectedClassId, currentPage + 1)
    }

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground">{t.teacher.students.title}</h1>
                <p className="text-muted-foreground">
                    {t.teacher.students.description}
                </p>
            </div>

            <div className="flex items-end justify-between">
                <div className="space-y-2 w-full max-w-xs">
                    <p className="text-sm font-medium text-foreground">{t.teacher.students.filter.title}</p>
                    <Select
                        value={selectedClassId}
                        onValueChange={(value) => void handleSelectClass(value)}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder={t.teacher.students.filter.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((classItem) => (
                                <SelectItem key={classItem.id} value={classItem.id}>
                                    {classItem.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 w-full max-w-sm">
                    <p className="text-sm font-medium text-foreground">{t.teacher.students.searchEngine.findStudent.title}</p>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9 h-10"
                            placeholder={t.teacher.students.searchEngine.findStudent.placeholder}
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                        />
                    </div>
                </div>
            </div>

            {isClassLoading ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">{t.common.loading}</CardContent>
                </Card>
            ) : null}

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t.teacher.students.tableView.title}
                            </CardTitle>

                            <CardDescription>
                                {selectedClass && `${t.teacher.students.tableView.description} ${selectedClass.name}`}
                            </CardDescription>
                        </div>

                        <div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsDeactivatedModalOpen(true)}
                                disabled={deactivatedMembers.length === 0}
                                className="shrink-0"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                {t.teacher.students.tableView.buttonViewDeactivatedStudents} ({deactivatedMembers.length})
                            </Button>
                        </div>

                    </div>
                </CardHeader>
                <CardContent>
                    <StudentListTable
                        members={members}
                        isLoading={isStudentLoading}
                        isPaging={isStudentLoading}
                        hasSelectedClass={Boolean(selectedClassId)}
                        selectedClassName={selectedClass?.name || ''}
                        searchValue={searchValue}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        hasPrevPage={hasPrevPage}
                        hasNextPage={hasNextPage}
                        removedMemberIds={removedMemberIds}
                        onDeactivateMember={handleDeactivateMember}
                        onPageSizeChange={(nextPageSize) => void handlePageSizeChange(nextPageSize)}
                        onPrevPage={() => void handlePrevPage()}
                        onNextPage={() => void handleNextPage()}
                    />
                </CardContent>
            </Card>

            <DeactivatedStudentsModal
                open={isDeactivatedModalOpen}
                onOpenChange={setIsDeactivatedModalOpen}
                members={deactivatedMembers}
                onReactivateMember={handleReactivateMember}
            />
        </div>
    )
}
