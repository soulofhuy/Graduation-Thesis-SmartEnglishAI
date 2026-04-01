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
import { TOAST_COLORS } from '@/lib/constants'
import { useAuth } from '@/components/auth-provider'
import { getDeactivatedClasses } from '@/services/teacher/classes'

type TrashItemType = 'class' | 'quiz' | 'assignment' | 'all'

interface TrashItem {
    id: string
    name: string
    type: 'class' | 'quiz' | 'assignment'
    deletedAt: string
    description?: string
}

const typeLabels: Record<TrashItem['type'], string> = {
    class: 'Lớp học',
    quiz: 'Câu hỏi',
    assignment: 'Bài tập'
}

const typeColors: Record<TrashItem['type'], string> = {
    class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    quiz: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    assignment: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
}

export default function TrashPage() {
    const { accessToken } = useAuth()
    const [trashItems, setTrashItems] = useState<TrashItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [filterType, setFilterType] = useState<TrashItemType>('class')
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (!accessToken) return

        const loadDeactivatedClasses = async () => {
            setIsLoading(true)
            try {
                const result = await getDeactivatedClasses(accessToken)
                // Convert Class type to TrashItem
                const items: TrashItem[] = result.classes.map(cls => ({
                    id: cls.id,
                    name: cls.name || '',
                    type: 'class',
                    deletedAt: cls.deactivatedAt || new Date().toLocaleString('vi-VN'),
                    description: cls.description || undefined
                }))
                setTrashItems(items)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Lỗi khi tải thùng rác'
                toast.error(message, { className: TOAST_COLORS.error })
            } finally {
                setIsLoading(false)
            }
        }

        loadDeactivatedClasses()
    }, [accessToken])

    const filteredItems = filterType === 'all'
        ? trashItems
        : trashItems.filter(item => item.type === filterType)

    const handleRestore = (id: string) => {
        setTrashItems(prev => prev.filter(item => item.id !== id))
        toast.success('Khôi phục thành công!', { className: TOAST_COLORS.success })
    }

    const handleDeletePermanently = (id: string) => {
        setTrashItems(prev => prev.filter(item => item.id !== id))
        setSelectedItems(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
        })
        toast.success('Xóa vĩnh viễn thành công!', { className: TOAST_COLORS.success })
    }

    const handleRestoreSelected = () => {
        setTrashItems(prev => prev.filter(item => !selectedItems.has(item.id)))
        setSelectedItems(new Set())
        toast.success(`Khôi phục ${selectedItems.size} mục thành công!`, { className: TOAST_COLORS.success })
    }

    const handleDeleteSelectedPermanently = () => {
        setTrashItems(prev => prev.filter(item => !selectedItems.has(item.id)))
        setSelectedItems(new Set())
        toast.success(`Xóa vĩnh viễn ${selectedItems.size} mục thành công!`, { className: TOAST_COLORS.success })
    }

    const toggleSelect = (id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredItems.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(filteredItems.map(item => item.id)))
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Thùng rác</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lí các mục đã xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn
                    </p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <Select value={filterType} onValueChange={(value) => setFilterType(value as TrashItemType)}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="class">Lớp học</SelectItem>
                        <SelectItem value="quiz">Câu hỏi</SelectItem>
                        <SelectItem value="assignment">Bài tập</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Action Buttons */}
            {selectedItems.size > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                                Đã chọn {selectedItems.size} mục
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleRestoreSelected}
                                    className="gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Khôi phục ({selectedItems.size})
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleDeleteSelectedPermanently}
                                    className="gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa vĩnh viễn ({selectedItems.size})
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Trash Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Mục đã xóa</CardTitle>
                    <CardDescription>
                        {isLoading ? 'Đang tải...' : `${filteredItems.length} mục trong thùng rác`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-muted-foreground">Thùng rác trống</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300"
                                            />
                                        </TableHead>
                                        <TableHead>Tên</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Mô tả</TableHead>
                                        <TableHead>Ngày xóa</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    className="rounded border-gray-300"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${typeColors[item.type]}`}>
                                                    {typeLabels[item.type]}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {item.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-sm">{item.deletedAt}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRestore(item.id)}
                                                        className="gap-2"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                        Khôi phục
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeletePermanently(item.id)}
                                                        className="gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Xóa
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

            {/* Info Box */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
                <CardContent className="pt-6">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                        💡 <strong>Lưu ý:</strong> Các mục trong thùng rác có thể bị xóa vĩnh viễn.
                        Một khi xóa vĩnh viễn, bạn không thể khôi phục được nữa.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
