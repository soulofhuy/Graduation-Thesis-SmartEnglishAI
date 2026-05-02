'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { RotateCcw, Trash2, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getToastMessage } from '@/lib/toast/message'
import { useAuth } from '@/components/auth-provider'
import { getDeactivatedClasses, toggleClassStatus } from '@/services/teacher/classes'
import { useLanguage } from '@/components/language-provider'
import { dateTimeFormat } from '@/lib/format'
import { getDeactivatedAssignments, toggleAssignmentActiveStatus } from '@/services/teacher/assignments'

type TrashItemType = 'class' | 'assignment'

interface TrashItem {
    id: string
    name: string
    type: 'class' | 'assignment'
    deletedAt: string
    description?: string
}

const typeColors: Record<TrashItem['type'], string> = {
    class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    assignment: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
}

export default function TrashPage() {
    const { t, language } = useLanguage()
    const { accessToken } = useAuth()
    const [trashItems, setTrashItems] = useState<TrashItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [filterType, setFilterType] = useState<TrashItemType>('class')

    useEffect(() => {
        if (!accessToken) return

        let isCancelled = false

        const loadTrashItems = async () => {
            setIsLoading(true)
            try {
                let items: TrashItem[] = []

                switch (filterType) {
                    case 'class': {
                        const result = await getDeactivatedClasses(accessToken)
                        items = result.classes.map(cls => ({
                            id: cls.id,
                            name: cls.name || '',
                            type: 'class',
                            deletedAt: cls.deactivatedAt || new Date().toLocaleString('vi-VN'),
                            description: cls.description || ''
                        }))
                        break
                    }
                    case 'assignment':
                        const result = await getDeactivatedAssignments(accessToken)
                        items = result.assignments.map(ast => ({
                            id: ast.id,
                            name: ast.title || '',
                            type: 'assignment',
                            deletedAt: ast.deactivatedAt || new Date().toLocaleString('vi-VN'),
                            description: ast.description || ''
                        }))
                        break
                }

                if (!isCancelled) {
                    setTrashItems(items)
                }
            } catch (error) {
                if (!isCancelled) {
                    const message = error instanceof Error ? error.message : getToastMessage('loadFailed', language)
                    toast.error(message, { className: TOAST_COLORS.error })
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false)
                }
            }
        }

        void loadTrashItems()

        return () => {
            isCancelled = true
        }
    }, [accessToken, filterType])

    const filteredItems = trashItems.filter(item => item.type === filterType)
    const selectedTypeLabel = t.teacher.trashBin.filter[filterType]

    const handleRestore = async (id: string, type: TrashItemType) => {
        if (!accessToken) return

        try {
            switch (type) {
                case 'class':
                    await toggleClassStatus(accessToken, id)
                    setTrashItems(prev => prev.filter(item => item.id !== id))
                    toast.success(getToastMessage('restoreSuccess', language), { className: TOAST_COLORS.success })
                    break
                case 'assignment':
                    await toggleAssignmentActiveStatus(accessToken, id)
                    setTrashItems(prev => prev.filter(item => item.id !== id))
                    toast.success(getToastMessage('restoreSuccess', language), { className: TOAST_COLORS.success })
                    break
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('restoreFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        }
    }

    const handleDelete = async (id: string, type: TrashItemType) => {
        if (!accessToken) return

        try {
            switch (type) {
                case 'class':
                case 'assignment':
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : getToastMessage('deleteFailed', language)
            toast.error(message, { className: TOAST_COLORS.error })
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t.teacher.trashBin.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t.teacher.trashBin.description}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <Select value={filterType} onValueChange={(value) => setFilterType(value as TrashItemType)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="class">{t.teacher.trashBin.filter.class}</SelectItem>
                        <SelectItem value="assignment">{t.teacher.trashBin.filter.assignment}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader className="mb-3">
                    <CardTitle>{t.teacher.trashBin.table.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">{t.common.loading}</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">{t.common.noData}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center">{t.teacher.trashBin.table.columnName}</TableHead>
                                        <TableHead className="text-center">{t.teacher.trashBin.table.columnType}</TableHead>
                                        <TableHead className="text-center">{t.teacher.trashBin.table.columnDescription}</TableHead>
                                        <TableHead className="text-center">{t.teacher.trashBin.table.columnDeletedAt}</TableHead>
                                        <TableHead className="text-center">{t.teacher.trashBin.table.columnActions}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center font-medium">{item.name}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${typeColors[item.type]}`}>
                                                    {selectedTypeLabel}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground text-center">
                                                {item.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-center">{dateTimeFormat(item.deletedAt)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => void handleRestore(item.id, item.type)}
                                                        className="gap-2"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                        {t.common.restore}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => void handleDelete(item.id, item.type)}
                                                        className="gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        {t.common.delete}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
