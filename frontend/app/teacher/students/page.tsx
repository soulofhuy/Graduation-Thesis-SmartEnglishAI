'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Search, Users, UserX2 } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Class, ClassMember } from '@/lib/types'
import { getClassesByTeacherId } from '@/services/teacher/classes'
import { getAllStudentsByClassId } from '@/services/classes'
import { getAllBannedStudentsByClassId, toggleBanStudentInClass } from '@/services/teacher/students'
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
    const [searchInput, setSearchInput] = useState('')
    const [searchValue, setSearchValue] = useState('')
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
    const [isClassLoading, setIsClassLoading] = useState(false)
    const [isStudentLoading, setIsStudentLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPrevPage, setHasPrevPage] = useState(false)
    const [bannedMembers, setBannedMembers] = useState<ClassMember[]>([])
    const [isBannedStudentsLoading, setIsBannedStudentsLoading] = useState(false)
    const [bannedCurrentPage, setBannedCurrentPage] = useState(1)
    const [bannedPageSize, setBannedPageSize] = useState(10)
    const [bannedTotalItems, setBannedTotalItems] = useState(0)
    const [bannedHasNextPage, setBannedHasNextPage] = useState(false)
    const [bannedHasPrevPage, setBannedHasPrevPage] = useState(false)
    const [isBanMutating, setIsBanMutating] = useState(false)
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

    const loadBannedStudentsByClass = async (classId: string, page = 1, limit = bannedPageSize) => {
        if (!accessToken) {
            return
        }

        setIsBannedStudentsLoading(true)
        try {
            const classDetail = await getAllBannedStudentsByClassId(
                accessToken,
                classId,
                page,
                limit,
            )
            const pagination = classDetail?.pagination

            setBannedMembers(classDetail?.classMembers ?? [])
            setBannedCurrentPage(pagination?.page ?? page)
            setBannedTotalItems(pagination?.totalItems ?? 0)
            setBannedHasNextPage(Boolean(pagination?.hasNextPage))
            setBannedHasPrevPage(Boolean(pagination?.hasPrevPage))
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
            toast.error(message)
            setBannedMembers([])
            setBannedTotalItems(0)
            setBannedHasNextPage(false)
            setBannedHasPrevPage(false)
        } finally {
            setIsBannedStudentsLoading(false)
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
        setBannedMembers([])
        setBannedCurrentPage(1)
        setBannedPageSize(10)
        setBannedTotalItems(0)
        setBannedHasNextPage(false)
        setBannedHasPrevPage(false)
        setCurrentPage(1)
        await loadStudentsByClass(classId, 1)
    }

    const handleDeactivateMember = async (member: ClassMember) => {
        if (!accessToken || !selectedClassId) {
            return
        }

        setIsBanMutating(true)
        try {
            await toggleBanStudentInClass(accessToken, selectedClassId, member.studentId)
            toast.success(getToastMessage('deleteSuccess', language), { className: TOAST_COLORS.success })

            await Promise.all([
                loadStudentsByClass(selectedClassId, currentPage),
                loadBannedStudentsByClass(selectedClassId, bannedCurrentPage, bannedPageSize),
            ])
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('deleteFailed', language)
            toast.error(message)
            throw error
        } finally {
            setIsBanMutating(false)
        }
    }

    const handleReactivateMember = async (member: ClassMember) => {
        if (!accessToken || !selectedClassId) {
            return
        }

        setIsBanMutating(true)
        try {
            await toggleBanStudentInClass(accessToken, selectedClassId, member.studentId)
            toast.success(getToastMessage('restoreSuccess', language), { className: TOAST_COLORS.success })

            await Promise.all([
                loadStudentsByClass(selectedClassId, currentPage),
                loadBannedStudentsByClass(selectedClassId, bannedCurrentPage, bannedPageSize),
            ])
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('restoreFailed', language)
            toast.error(message)
            throw error
        } finally {
            setIsBanMutating(false)
        }
    }

    const handleOpenBannedStudentsModal = async () => {
        if (!selectedClassId) {
            return
        }

        setBannedCurrentPage(1)
        setIsDeactivatedModalOpen(true)
        await loadBannedStudentsByClass(selectedClassId, 1, bannedPageSize)
    }

    const handleBannedPageSizeChange = async (nextPageSize: number) => {
        if (!selectedClassId) {
            return
        }

        setBannedPageSize(nextPageSize)
        setBannedCurrentPage(1)
        await loadBannedStudentsByClass(selectedClassId, 1, nextPageSize)
    }

    const handlePrevBannedPage = async () => {
        if (!selectedClassId || !bannedHasPrevPage || isBannedStudentsLoading) {
            return
        }

        await loadBannedStudentsByClass(selectedClassId, bannedCurrentPage - 1, bannedPageSize)
    }

    const handleNextBannedPage = async () => {
        if (!selectedClassId || !bannedHasNextPage || isBannedStudentsLoading) {
            return
        }

        await loadBannedStudentsByClass(selectedClassId, bannedCurrentPage + 1, bannedPageSize)
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

    const handleSearchSubmit = () => {
        setSearchValue(searchInput.trim())
    }

    const clearSearch = () => {
        setSearchInput('')
        setSearchValue('')
    }

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground">{t.teacher.students.title}</h1>
                <p className="text-muted-foreground">
                    {t.teacher.students.description}
                </p>
            </div>

            <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
                <CardContent>
                    <div className="grid gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] md:justify-items-center">
                        <div className="w-full max-w-md mx-auto">
                            <div className="flex justify-center mb-3">
                                <label className="inline-block rounded-md border-2 border-black px-3 py-1 text-sm font-bold dark:border-white">
                                    {t.teacher.students.filter.title}
                                </label>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2">
                                {classes.map((classItem) => {
                                    const isSelected = classItem.id === selectedClassId

                                    return (
                                        <Button
                                            key={classItem.id}
                                            type="button"
                                            variant={isSelected ? 'default' : 'outline'}
                                            className="rounded-full px-4 py-2"
                                            onClick={() => void handleSelectClass(classItem.id)}
                                        >
                                            {classItem.name}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="w-full max-w-3xl mx-auto">
                            <div className="flex justify-center mb-3">
                                <label className="inline-block rounded-md border-2 border-black px-3 py-1 text-sm font-bold dark:border-white">
                                    {t.teacher.students.searchOrSortOrFilter.search.title}
                                </label>
                            </div>

                            <div className="space-y-4">
                                <form
                                    className="flex flex-col items-center gap-3 md:max-w-md mx-auto"
                                    onSubmit={(event) => {
                                        event.preventDefault()
                                        handleSearchSubmit()
                                    }}
                                >
                                    <div className="relative w-full max-w-sm">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            className="h-11 w-full rounded-full pl-10 pr-4"
                                            placeholder={t.teacher.students.searchOrSortOrFilter.search.searchFieldPlaceholder}
                                            value={searchInput}
                                            onChange={(event) => setSearchInput(event.target.value)}
                                        />
                                    </div>

                                    <div className="flex justify-center gap-2">
                                        <Button type="submit" className="rounded-full px-5">
                                            {t.teacher.classes.searchOrSortOrFilter.search.searchButton}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-full px-5"
                                            onClick={clearSearch}
                                        >
                                            {t.teacher.classes.searchOrSortOrFilter.search.resetButton}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                onClick={() => void handleOpenBannedStudentsModal()}
                                disabled={!selectedClassId || isBannedStudentsLoading}
                                className="shrink-0"
                            >
                                <UserX2 className="h-4 w-4 mr-1" />
                                {t.teacher.students.tableView.buttonViewDeactivatedStudents}
                            </Button>
                        </div>

                    </div>
                </CardHeader>
                <CardContent>
                    <StudentListTable
                        members={members}
                        isLoading={isStudentLoading}
                        isPaging={isStudentLoading}
                        isMutating={isBanMutating}
                        hasSelectedClass={Boolean(selectedClassId)}
                        selectedClassName={selectedClass?.name || ''}
                        searchValue={searchValue}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        hasPrevPage={hasPrevPage}
                        hasNextPage={hasNextPage}
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
                members={bannedMembers}
                isLoading={isBannedStudentsLoading}
                isMutating={isBanMutating}
                totalItems={bannedTotalItems}
                currentPage={bannedCurrentPage}
                pageSize={bannedPageSize}
                hasPrevPage={bannedHasPrevPage}
                hasNextPage={bannedHasNextPage}
                isPaging={isBannedStudentsLoading}
                onPageSizeChange={(nextPageSize) => void handleBannedPageSizeChange(nextPageSize)}
                onPrevPage={handlePrevBannedPage}
                onNextPage={handleNextBannedPage}
                onReactivateMember={handleReactivateMember}
            />
        </div>
    )
}
