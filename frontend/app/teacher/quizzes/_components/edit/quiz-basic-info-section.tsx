'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { AssignmentFormData } from './quiz-builder-types'
import { useLanguage } from '@/components/language-provider'

type TeacherClassOption = {
    id: string
    name: string
}

type QuizBasicInfoSectionProps = {
    formData: AssignmentFormData
    setFormData: Dispatch<SetStateAction<AssignmentFormData>>
    classes: TeacherClassOption[]
    isClassesLoading: boolean
    onSave: () => void
    isSaving: boolean
    onContinue: () => void
}

export function QuizBasicInfoSection({
    formData,
    setFormData,
    classes,
    isClassesLoading,
    onSave,
    isSaving,
    onContinue,
}: QuizBasicInfoSectionProps) {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-1 xl:grid-cols-9 gap-6">
            <Card className="xl:col-span-4 shadow-sm border-muted/40">
                <CardContent className="space-y-5">
                    <div className="grid gap-2">
                        <Label htmlFor="title">{t.teacher.assignments.createAssignment.tabAssignmentInfo.fieldAssignmentName}</Label>
                        <Input
                            id="title"
                            className="h-11"
                            value={formData.title}
                            placeholder={t.teacher.assignments.createAssignment.tabAssignmentInfo.fieldAssignmentNamePlaceholder}
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
                            <Label htmlFor="classId">{t.teacher.assignments.createAssignment.tabAssignmentInfo.fieldClass}</Label>
                            <Select
                                value={formData.classId}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        classId: value,
                                    }))
                                }
                                disabled={isClassesLoading || classes.length === 0}
                            >
                                <SelectTrigger id="classId" className="h-11 w-full">
                                    <SelectValue
                                        placeholder={
                                            isClassesLoading
                                                ? 'Dang tai danh sach lop...'
                                                : 'Chon lop hoc'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((classItem) => (
                                        <SelectItem key={classItem.id} value={classItem.id}>
                                            {classItem.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">{t.teacher.assignments.createAssignment.tabAssignmentInfo.fieldDeadline}</Label>
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
                        <Label htmlFor="description">{t.teacher.assignments.createAssignment.description}</Label>
                        <RichTextEditor
                            value={formData.description}
                            placeholder={t.teacher.assignments.createAssignment.tabAssignmentInfo.fieldDescriptionPlaceholder}
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
                    <CardTitle className="text-lg font-semibold">{t.teacher.assignments.createAssignment.tabAssignmentConfig.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                            <div>
                                <p className="text-sm font-medium">{t.teacher.assignments.createAssignment.tabAssignmentConfig.fieldIsPublic}</p>
                                <p className="text-xs text-muted-foreground">{t.teacher.assignments.createAssignment.tabAssignmentConfig.fieldIsPublicDescription}</p>
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
                                <p className="text-sm font-medium">{t.teacher.assignments.createAssignment.tabAssignmentConfig.fieldOneAttempt}</p>
                                <p className="text-xs text-muted-foreground">{t.teacher.assignments.createAssignment.tabAssignmentConfig.fieldOneAttemptDescription}</p>
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
                                <p className="text-sm font-medium">{t.teacher.assignments.createAssignment.tabAssignmentConfig.fieldCanViewResult}</p>
                                <p className="text-xs text-muted-foreground">{t.teacher.assignments.createAssignment.tabAssignmentConfig.fieldCanViewResultDescription}</p>
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
                </CardContent>
            </Card>
        </div>
    )
}
