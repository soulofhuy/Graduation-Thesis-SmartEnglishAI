'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/components/language-provider'

type AssignmentOption = {
    id: string
    title: string
    className?: string
    classId?: string
    classes?: Array<{ id: string; name: string; classCode: string }>
}

type Props = {
    assignments: AssignmentOption[]
    onApply: (assignmentId: string | null, classId: string | null, search: string) => void
}

export default function ResultsFilters({ assignments, onApply }: Props) {
    const { t, language } = useLanguage()
    const [assignmentId, setAssignmentId] = useState<string | null>(null)
    const [classId, setClassId] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const classesForAssignment = assignmentId
        ? (() => {
            const found = assignments.find((a) => a.id === assignmentId)
            if (!found) return []
            // Prefer multi-class array, fall back to single classId
            if (found.classes && found.classes.length > 0) return found.classes
            if (found.classId) return [{ id: found.classId, name: found.className ?? 'Chưa có tên lớp', classCode: '' }]
            return []
          })()
        : []

    useEffect(() => {
        setClassId(null)
    }, [assignmentId])

    return (
        <div className="space-y-4 p-4">
            <div>
                <label className="block text-sm font-medium">{t.admin.resultManagement.filters.assignment.title}</label>
                <Select onValueChange={(v) => setAssignmentId(v === 'all' ? null : v)} value={assignmentId ?? ''}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder={t.admin.resultManagement.filters.assignment.default} />
                    </SelectTrigger>
                    <SelectContent>
                        {assignments.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium">{t.admin.resultManagement.filters.class.title}</label>
                <Select onValueChange={(v) => setClassId(v === 'all' ? null : v)} value={classId ?? ''}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder={t.admin.resultManagement.filters.class.default} />
                    </SelectTrigger>
                    <SelectContent>
                        {classesForAssignment.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* <div>
                <label className="block text-sm font-medium">Search</label>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tên hoặc email" className="mt-2" />
            </div> */}

            <div className="flex gap-2">
                <Button onClick={() => onApply(assignmentId, classId, search)}>{t.admin.resultManagement.actions.apply}</Button>
                <Button variant="outline" onClick={() => { setAssignmentId(null); setClassId(null); setSearch(''); onApply(null, null, ''); }}>{t.admin.resultManagement.actions.clear}</Button>
            </div>
        </div>
    )
}
