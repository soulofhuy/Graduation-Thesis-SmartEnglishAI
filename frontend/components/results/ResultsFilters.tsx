'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type AssignmentOption = { id: string; title: string; className?: string; classCode?: string }

type Props = {
    assignments: AssignmentOption[]
    onApply: (assignmentId: string | null, classId: string | null, search: string) => void
}

export default function ResultsFilters({ assignments, onApply }: Props) {
    const [assignmentId, setAssignmentId] = useState<string | null>(null)
    const [classId, setClassId] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const classesForAssignment = assignmentId
        ? assignments
            .filter((a) => a.id === assignmentId)
            .map((a) => ({ id: a.classCode ?? '-', name: a.className }))
        : []

    useEffect(() => {
        if (!assignmentId) setClassId(null)
    }, [assignmentId])

    return (
        <div className="space-y-4 p-4">
            <div>
                <label className="block text-sm font-medium">Assignment</label>
                <Select onValueChange={(v) => setAssignmentId(v === 'all' ? null : v)} value={assignmentId ?? ''}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Chọn bài tập" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {assignments.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium">Class</label>
                <Select onValueChange={(v) => setClassId(v === 'all' ? null : v)} value={classId ?? ''}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Chọn lớp" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {classesForAssignment.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium">Search</label>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tên hoặc email" className="mt-2" />
            </div>

            <div className="flex gap-2">
                <Button onClick={() => onApply(assignmentId, classId, search)}>Apply</Button>
                <Button variant="outline" onClick={() => { setAssignmentId(null); setClassId(null); setSearch(''); onApply(null, null, ''); }}>Clear</Button>
            </div>
        </div>
    )
}
