'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, X } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { useLanguage } from '@/components/language-provider'
import { dateFormat } from '@/lib/format'
import { getToastMessage } from '@/lib/toast/message'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getActiveStatusLabel } from '@/lib/language-mappers/active-deactive-mapper'
import { getActiveStatusColor } from '@/lib/color-mappers/active-deactive-mapper'
import { getAllStudentsByClassId } from '@/services/classes'
import { ClassMember } from '@/lib/types'
import { getStudentBannedStatusColor } from '@/lib/color-mappers/student-banned-status-mapper'
import { getStudentBannedStatusLabel } from '@/lib/language-mappers/student-banned-status-mapper'

// interface Student {
//     id: string
//     profile: {
//         firstName: string
//         lastName: string
//     }
//     email: string
//     phoneNumber: string
//     isActive: boolean
//     createdAt: string
// }

interface StudentsInClassModalProps {
    isOpen: boolean
    onClose: () => void
    classId: string
    className: string
    accessToken: string
}

export function StudentsInClassModal({
    isOpen,
    onClose,
    classId,
    className,
    accessToken,
}: StudentsInClassModalProps) {
    const { t, language } = useLanguage()
    const [students, setStudents] = useState<ClassMember[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [sortField, setSortField] = useState<'name' | 'email' | 'phone' | 'status' | 'date'>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    const fetchStudents = useCallback(async () => {
        if (!accessToken || !classId) return

        setIsLoading(true)
        try {
            const resp = await getAllStudentsByClassId(accessToken, classId)
            console.log('Fetched students response:', resp)
            setStudents(resp?.classMembers ?? [])
        } catch (error) {
            toast.error(getToastMessage('loadFailed', language), { className: TOAST_COLORS.error })
            setStudents([])
        } finally {
            setIsLoading(false)
        }
    }, [accessToken, classId, language])

    useEffect(() => {
        if (isOpen && classId) {
            void fetchStudents()
        }
    }, [isOpen, classId, fetchStudents])

    // const visibleStudents = useMemo(() => {
    //     const query = searchQuery.trim().toLowerCase()

    //     const filtered = students.filter((student) => {
    //         if (!query) return true

    //         const firstName = student.profile?.firstName?.toLowerCase() ?? ''
    //         const lastName = student.profile?.lastName?.toLowerCase() ?? ''
    //         const email = student.email?.toLowerCase() ?? ''
    //         const phone = student.phoneNumber?.toLowerCase() ?? ''

    //         return (
    //             firstName.includes(query) ||
    //             lastName.includes(query) ||
    //             email.includes(query) ||
    //             phone.includes(query)
    //         )
    //     })

    //     const directionFactor = sortDirection === 'asc' ? 1 : -1

    //     return [...filtered].sort((left, right) => {
    //         let comparison = 0

    //         if (sortField === 'email') {
    //             comparison = (left.email ?? '').localeCompare(right.email ?? '', language === 'vi' ? 'vi' : 'en', {
    //                 sensitivity: 'base',
    //             })
    //         } else if (sortField === 'phone') {
    //             comparison = (left.phoneNumber ?? '').localeCompare(right.phoneNumber ?? '', language === 'vi' ? 'vi' : 'en', {
    //                 sensitivity: 'base',
    //             })
    //         } else if (sortField === 'status') {
    //             comparison = (left.isActive === right.isActive ? 0 : left.isActive ? 1 : -1)
    //         } else if (sortField === 'date') {
    //             comparison = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    //         } else {
    //             const leftName = `${left.profile?.firstName ?? ''} ${left.profile?.lastName ?? ''}`.trim()
    //             const rightName = `${right.profile?.firstName ?? ''} ${right.profile?.lastName ?? ''}`.trim()
    //             comparison = leftName.localeCompare(rightName, language === 'vi' ? 'vi' : 'en', {
    //                 sensitivity: 'base',
    //             })
    //         }

    //         return comparison * directionFactor
    //     })
    // }, [students, language, searchQuery, sortDirection, sortField])

    // const getStudentName = (student: Student) => {
    //     const firstName = student.profile?.firstName || ''
    //     const lastName = student.profile?.lastName || ''
    //     return `${firstName} ${lastName}`.trim() || student.email || 'N/A'
    // }

    const handleSort = (field: 'name' | 'email' | 'phone' | 'status' | 'date') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {t.admin.classManagement?.tableView?.title || 'Danh sách học sinh'} - {className}
                    </DialogTitle>
                    <DialogDescription>
                        {students.length} học sinh trong lớp
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                                value={searchInput}
                                onChange={(e) => {
                                    setSearchInput(e.target.value)
                                    setSearchQuery(e.target.value)
                                }}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="text-center cursor-pointer hover:bg-muted"
                                            onClick={() => handleSort('name')}
                                        >
                                            Họ tên {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead
                                            className="text-center cursor-pointer hover:bg-muted"
                                            onClick={() => handleSort('email')}
                                        >
                                            Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead
                                            className="text-center cursor-pointer hover:bg-muted"
                                            onClick={() => handleSort('phone')}
                                        >
                                            Số điện thoại {sortField === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead
                                            className="text-center cursor-pointer hover:bg-muted"
                                            onClick={() => handleSort('status')}
                                        >
                                            Trạng thái {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                        <TableHead
                                            className="text-center cursor-pointer hover:bg-muted"
                                            onClick={() => handleSort('date')}
                                        >
                                            Ngày tạo {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium text-center">
                                                {student.student?.profile?.firstName} {student.student?.profile?.lastName}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground text-center">
                                                {student.student?.profile?.user?.email}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.student?.profile?.phoneNumber || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`rounded px-2 py-1 text-xs font-medium ${getStudentBannedStatusColor(student.isBanned)}`}>
                                                    {getStudentBannedStatusLabel(student.isBanned, language)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground text-center">
                                                {dateFormat(student.joinedAt || '')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Đóng
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
