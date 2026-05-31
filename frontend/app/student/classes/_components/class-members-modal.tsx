'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { ClassMember } from '@/lib/types'
import { useLanguage } from '@/components/language-provider'
import { dateFormat } from '@/lib/format'

type SortOption = 'name-asc' | 'name-desc' | 'joinedAt-asc' | 'joinedAt-desc'

interface ClassMembersModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    className?: string | null
    classCode?: string | null
    classMembers: ClassMember[]
    isLoading: boolean
}

const getStudentFullName = (member: ClassMember) => {
    const profile = member.student?.profile
    return [profile?.lastName, profile?.firstName].filter(Boolean).join(' ')
}

export function ClassMembersModal({
    isOpen,
    onOpenChange,
    className,
    classMembers,
    isLoading,
}: ClassMembersModalProps) {
    const { t } = useLanguage()
    const [searchTerm, setSearchTerm] = useState('')
    const [sortOption, setSortOption] = useState<SortOption>('name-asc')

    const filteredMembers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()
        const members = classMembers.filter(member => {
            if (!normalizedSearch) {
                return true
            }

            const fullName = getStudentFullName(member).toLowerCase()
            const email = (member.student?.email ?? '').toLowerCase()
            const phoneNumber = (member.student?.profile?.phoneNumber ?? '').toLowerCase()

            return (
                fullName.includes(normalizedSearch) ||
                email.includes(normalizedSearch) ||
                phoneNumber.includes(normalizedSearch)
            )
        })

        return members.toSorted((leftMember, rightMember) => {
            if (sortOption === 'name-asc' || sortOption === 'name-desc') {
                const leftName = getStudentFullName(leftMember).toLowerCase()
                const rightName = getStudentFullName(rightMember).toLowerCase()
                const comparison = leftName.localeCompare(rightName, 'vi')

                return sortOption === 'name-asc' ? comparison : -comparison
            }

            const leftJoinedAt = new Date(leftMember.joinedAt ?? 0).getTime()
            const rightJoinedAt = new Date(rightMember.joinedAt ?? 0).getTime()

            return sortOption === 'joinedAt-asc'
                ? leftJoinedAt - rightJoinedAt
                : rightJoinedAt - leftJoinedAt
        })
    }, [classMembers, searchTerm, sortOption])

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[70vw] max-w-[70vw] sm:max-w-xl lg:max-w-3xl xl:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        {t.student.classes.viewClassMembersList.title} {className}
                    </DialogTitle>
                    <DialogDescription>
                        {t.student.classes.viewClassMembersList.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {t.student.classes.viewClassMembersList.fieldSearch}
                        </p>
                        <Input
                            value={searchTerm}
                            onChange={event => setSearchTerm(event.target.value)}
                            placeholder={t.student.classes.viewClassMembersList.fieldSearchPlaceholder}
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {t.student.classes.viewClassMembersList.fieldSortBy}
                        </p>
                        <Select value={sortOption} onValueChange={value => setSortOption(value as SortOption)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t.student.classes.viewClassMembersList.fieldSortBy} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name-asc">
                                    {t.student.classes.viewClassMembersList.sortNameAsc}
                                </SelectItem>
                                <SelectItem value="name-desc">
                                    {t.student.classes.viewClassMembersList.sortNameDesc}
                                </SelectItem>
                                <SelectItem value="joinedAt-asc">
                                    {t.student.classes.viewClassMembersList.sortJoinedAtAsc}
                                </SelectItem>
                                <SelectItem value="joinedAt-desc">
                                    {t.student.classes.viewClassMembersList.sortJoinedAtDesc}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">{t.student.classes.viewClassMembersList.columnNo}</TableHead>
                                <TableHead>{t.student.classes.viewClassMembersList.columnName}</TableHead>
                                <TableHead>{t.student.classes.viewClassMembersList.columnEmail}</TableHead>
                                <TableHead>{t.student.classes.viewClassMembersList.columnPhoneNumber}</TableHead>
                                <TableHead>{t.student.classes.viewClassMembersList.columnDateJoined}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        {t.common.loading}
                                    </TableCell>
                                </TableRow>
                            ) : filteredMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        {searchTerm.trim() && t.student.classes.viewClassMembersList.noData}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMembers.map((member, index) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell className="font-medium">
                                            {getStudentFullName(member)}
                                        </TableCell>
                                        <TableCell>{member.student?.email}</TableCell>
                                        <TableCell>{member.student?.profile?.phoneNumber ?? '---'}</TableCell>
                                        <TableCell>
                                            {member.joinedAt ? dateFormat(member.joinedAt) : '---'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t.common.close}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
