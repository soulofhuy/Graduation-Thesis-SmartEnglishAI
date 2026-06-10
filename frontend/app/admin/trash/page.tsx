'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { RotateCcw, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { TOAST_COLORS } from '@/lib/toast/color'
import { getToastMessage } from '@/lib/toast/message'
import { useAuth } from '@/components/auth-provider'
import { useLanguage } from '@/components/language-provider'
import { dateTimeFormat } from '@/lib/format'
import { 
    getAdminDeactivatedClasses, 
    getAdminDeactivatedAssignments, 
    restoreAdminClass, 
    deleteAdminClass, 
    restoreAdminAssignment, 
    deleteAdminAssignment 
} from '@/services/admin/trashBin'

type TrashItemType = 'class' | 'assignment'
type TrashSortField = 'title' | 'description' | 'deletedAt'
type SortDirection = 'asc' | 'desc'

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

export default function AdminTrashPage() {
    const { t, language } = useLanguage()
    const { accessToken } = useAuth()
    const [trashItems, setTrashItems] = useState<TrashItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [filterType, setFilterType] = useState<TrashItemType>('class')
    const [searchInput, setSearchInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortField, setSortField] = useState<TrashSortField>('deletedAt')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    useEffect(() => {
        if (!accessToken) return

        let isCancelled = false

        const loadTrashItems = async () => {
            setIsLoading(true)
            try {
                let items: TrashItem[] = []

                switch (filterType) {
                    case 'class': {
                        const result = await getAdminDeactivatedClasses(accessToken)
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
                        const result = await getAdminDeactivatedAssignments(accessToken)
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

    const handleSearchSubmit = () => {
        setSearchQuery(searchInput.trim())
    }

    const clearSearch = () => {
        setSearchInput('')
        setSearchQuery('')
    }

    const filteredItems = trashItems
        .filter(item => item.type === filterType)
        .filter(item => {
            const keyword = searchQuery.trim().toLowerCase()
            if (!keyword) return true

            return (
                item.name.toLowerCase().includes(keyword) ||
                (item.description || '').toLowerCase().includes(keyword)
            )
        })
        .sort((a, b) => {
            const direction = sortDirection === 'asc' ? 1 : -1

            if (sortField === 'title') {
                return direction * a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
            }

            if (sortField === 'description') {
                const aDesc = a.description || ''
                const bDesc = b.description || ''
                return direction * aDesc.localeCompare(bDesc, 'vi', { sensitivity: 'base' })
            }

            const aTime = new Date(a.deletedAt).getTime()
            const bTime = new Date(b.deletedAt).getTime()
            return direction * ((Number.isNaN(aTime) ? 0 : aTime) - (Number.isNaN(bTime) ? 0 : bTime))
        })
    const selectedTypeLabel = t.teacher.trashBin.searchOrSortOrFilter.filter[filterType]

    const handleRestore = async (id: string, type: TrashItemType) => {
        if (!accessToken) return

        try {
            switch (type) {
                case 'class':
                    await restoreAdminClass(accessToken, id)
                    setTrashItems(prev => prev.filter(item => item.id !== id))
                    toast.success(getToastMessage('restoreSuccess', language), { className: TOAST_COLORS.success })
                    break
                case 'assignment':
                    await restoreAdminAssignment(accessToken, id)
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
                    await deleteAdminClass(accessToken, id)
                    setTrashItems(prev => prev.filter(item => item.id !== id))
                    toast.success(getToastMessage('deleteSuccess', language), { className: TOAST_COLORS.success })
                    break
                case 'assignment':
                    await deleteAdminAssignment(accessToken, id)
                    setTrashItems(prev => prev.filter(item => item.id !== id))
                    toast.success(getToastMessage('deleteSuccess', language), { className: TOAST_COLORS.success })
                    break
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

            <Card>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <div className="flex justify-center mb-4">
                                <label className="inline-block rounded-md border-2 border-black px-3 py-1 text-sm font-bold">
                                    {t.teacher.trashBin.searchOrSortOrFilter.filter.title}
                                </label>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                                <Button
                                    onClick={() => setFilterType('class')}
                                    className={`px-3 py-1 rounded-full border transition-colors ${filterType === 'class' ? 'bg-primary text-white border-primary' : 'bg-white text-foreground'}`}
                                >
                                    {t.teacher.trashBin.searchOrSortOrFilter.filter.class}
                                </Button>

                                <Button
                                    onClick={() => setFilterType('assignment')}
                                    className={`px-3 py-1 rounded-full border transition-colors ${filterType === 'assignment' ? 'bg-primary text-white border-primary' : 'bg-white text-foreground'}`}
                                >
                                    {t.teacher.trashBin.searchOrSortOrFilter.filter.assignment}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-center mb-4">
                                <label className="inline-block rounded-md border-2 border-black px-3 py-1 text-sm font-bold">
                                    {t.teacher.trashBin.searchOrSortOrFilter.search.title}
                                </label>
                            </div>
                            <form
                                className="flex flex-col items-center gap-3 md:max-w-md"
                                onSubmit={(event) => {
                                    event.preventDefault()
                                    handleSearchSubmit()
                                }}
                            >
                                <div className="relative w-full max-w-sm">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        placeholder={t.teacher.trashBin.searchOrSortOrFilter.search.searchFieldPlaceholder}
                                        className="h-11 w-full rounded-full pl-10 pr-4"
                                    />
                                </div>

                                <div className="flex justify-center gap-2">
                                    <Button type="submit" className="rounded-full px-5">
                                        {t.teacher.trashBin.searchOrSortOrFilter.search.searchButton}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-full px-5"
                                        onClick={clearSearch}
                                    >
                                        {t.teacher.trashBin.searchOrSortOrFilter.search.resetButton}
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <div className="flex justify-center mb-4">
                                    <label className="inline-block border-2 border-black rounded-md px-3 py-1 text-sm font-bold dark:border-white">
                                        {t.teacher.trashBin.searchOrSortOrFilter.sort.sortItems.title}
                                    </label>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant={sortField === 'title' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortField('title')}
                                    >
                                        {t.teacher.trashBin.searchOrSortOrFilter.sort.sortItems.fieldTitle}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant={sortField === 'description' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortField('description')}
                                    >
                                        {t.teacher.trashBin.searchOrSortOrFilter.sort.sortItems.fieldDescription}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant={sortField === 'deletedAt' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortField('deletedAt')}
                                    >
                                        {t.teacher.trashBin.searchOrSortOrFilter.sort.sortItems.fieldDeletedDate}
                                    </Button>
                                </div>
                            </div>

                            {/* SORT ORDER */}
                            <div>
                                <div className="flex justify-center mb-4">
                                    <label className="inline-block border-2 border-black rounded-md px-3 py-1 text-sm font-bold dark:border-white">
                                        {t.teacher.trashBin.searchOrSortOrFilter.sort.order.title}
                                    </label>
                                </div>

                                <div className="flex flex-wrap justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant={sortDirection === 'asc' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortDirection('asc')}
                                    >
                                        {t.teacher.trashBin.searchOrSortOrFilter.sort.order.asc}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant={sortDirection === 'desc' ? 'default' : 'outline'}
                                        className="rounded-full px-3 py-1"
                                        onClick={() => setSortDirection('desc')}
                                    >
                                        {t.teacher.trashBin.searchOrSortOrFilter.sort.order.desc}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
