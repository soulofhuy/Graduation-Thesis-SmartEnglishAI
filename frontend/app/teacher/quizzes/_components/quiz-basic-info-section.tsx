'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Switch } from '@/components/ui/switch'
import type { AssignmentFormData } from './quiz-builder-types'

type QuizBasicInfoSectionProps = {
    formData: AssignmentFormData
    setFormData: Dispatch<SetStateAction<AssignmentFormData>>
    onContinue: () => void
}

export function QuizBasicInfoSection({
    formData,
    setFormData,
    onContinue,
}: QuizBasicInfoSectionProps) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-9 gap-6">
            <Card className="xl:col-span-4 shadow-sm border-muted/40">
                <CardContent className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Tên đề thi *</Label>
                        <Input
                            id="title"
                            className="h-11"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="classId">Class ID *</Label>
                            <Input
                                id="classId"
                                className="h-11"
                                placeholder="Nhập class ID"
                                value={formData.classId}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        classId: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Hạn nộp</Label>
                            <Input
                                id="dueDate"
                                type="datetime-local"
                                className="h-11"
                                value={formData.dueDate}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        dueDate: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 min-w-0 w-full max-w-full">
                        <Label htmlFor="description">Mô tả</Label>
                        <RichTextEditor
                            value={formData.description}
                            placeholder="Nhập mô tả đề thi"
                            minHeightClass="min-h-18"
                            onChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: value,
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="xl:col-span-5 shadow-sm border-muted/40">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Cấu hình truy cập</CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div>
                                <p className="text-sm font-medium">Phạm vi chia sẻ</p>
                                <p className="text-xs text-muted-foreground">Cho phép truy cập ngoài lớp</p>
                            </div>
                            <Switch
                                checked={formData.isPublic}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        isPublic: checked,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div>
                                <p className="text-sm font-medium">Giới hạn làm bài</p>
                                <p className="text-xs text-muted-foreground">Chỉ được làm một lần / yêu cầu mật khẩu</p>
                            </div>
                            <Switch
                                checked={formData.isSingleAttempt}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        isSingleAttempt: checked,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div>
                                <p className="text-sm font-medium">Xem kết quả</p>
                                <p className="text-xs text-muted-foreground">Cho phép học sinh xem điểm sau khi nộp</p>
                            </div>
                            <Switch
                                checked={formData.canViewResult}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        canViewResult: checked,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button className="w-full h-11 text-base font-medium" onClick={onContinue}>
                            Sang tab soạn câu hỏi →
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
