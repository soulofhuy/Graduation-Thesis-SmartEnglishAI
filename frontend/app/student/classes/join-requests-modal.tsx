'use client'

import { Button } from '@/components/ui/button'
import { ModalWrapper } from '@/components/modal-wrapper'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export interface JoinRequestItem {
    id: string
    classCode: string
    status: 'pending' | 'approved' | 'rejected'
    requestedAt: string
}

interface JoinRequestsModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    requests: JoinRequestItem[]
    isLoading: boolean
}

export function JoinRequestsModal({
    isOpen,
    onOpenChange,
    requests,
    isLoading,
}: JoinRequestsModalProps) {
    const getRequestStatusLabel = (status: JoinRequestItem['status']) => {
        if (status === 'approved') return 'Đã duyệt'
        if (status === 'rejected') return 'Từ chối'
        return 'Chờ duyệt'
    }

    const getRequestStatusClassName = (status: JoinRequestItem['status']) => {
        if (status === 'approved') {
            return 'bg-emerald-100 text-emerald-800'
        }
        if (status === 'rejected') {
            return 'bg-rose-100 text-rose-800'
        }
        return 'bg-amber-100 text-amber-800'
    }

    return (
        <ModalWrapper
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Yêu cầu tham gia lớp học"
            description="Theo dõi danh sách yêu cầu đã gửi và trạng thái phê duyệt."
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </div>
            }
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Mã lớp</TableHead>
                        <TableHead>Thời gian gửi</TableHead>
                        <TableHead>Trạng thái</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                Đang tải danh sách yêu cầu...
                            </TableCell>
                        </TableRow>
                    ) : requests.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                Bạn chưa gửi yêu cầu tham gia lớp nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        requests.map(request => (
                            <TableRow key={request.id}>
                                <TableCell className="font-semibold">{request.classCode}</TableCell>
                                <TableCell>{new Date(request.requestedAt).toLocaleString('vi-VN')}</TableCell>
                                <TableCell>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRequestStatusClassName(request.status)}`}
                                    >
                                        {getRequestStatusLabel(request.status)}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ModalWrapper>
    )
}