'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface ChoiceDraft {
    id: string
    choiceContent: string
    isCorrect: boolean
}

interface QuestionDraft {
    id: string
    questionContent: string
    topicTag: string
    questionType: 'single-choice'
    passageIndex: string
    choices: ChoiceDraft[]
}

interface PassageDraft {
    id: string
    passageContent: string
}

interface TaskDraft {
    id: string
    taskTitle: string
    passages: PassageDraft[]
    questions: QuestionDraft[]
}

interface AssignmentFormData {
    title: string
    description: string
    classId: string
    dueDate: string
    isPublic: boolean
    isSingleAttempt: boolean
    canViewResult: boolean
}

const createId = () => Math.random().toString(36).slice(2, 10)

const createChoice = (): ChoiceDraft => ({
    id: createId(),
    choiceContent: '',
    isCorrect: false,
})

const createQuestion = (): QuestionDraft => ({
    id: createId(),
    questionContent: '',
    topicTag: '',
    questionType: 'single-choice',
    passageIndex: 'none',
    choices: [createChoice(), createChoice()],
})

const createTask = (index: number): TaskDraft => ({
    id: createId(),
    taskTitle: `Phan ${index + 1}`,
    passages: [],
    questions: [createQuestion()],
})

export default function CreateQuizPage() {
    const router = useRouter()
    const initialTask = createTask(0)
    const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'advanced' | 'history' | 'stats'>('basic')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState<AssignmentFormData>({
        title: '',
        description: '',
        classId: '',
        dueDate: '',
        isPublic: false,
        isSingleAttempt: true,
        canViewResult: true,
    })
    const [tasks, setTasks] = useState<TaskDraft[]>([initialTask])
    const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTask.id)
    const [selectedQuestionId, setSelectedQuestionId] = useState<string>(initialTask.questions[0].id)

    const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0]
    const selectedQuestion =
        selectedTask?.questions.find((question) => question.id === selectedQuestionId) ??
        selectedTask?.questions[0]

    useEffect(() => {
        if (!tasks.find((task) => task.id === selectedTaskId) && tasks[0]) {
            setSelectedTaskId(tasks[0].id)
        }
    }, [tasks, selectedTaskId])

    useEffect(() => {
        if (!selectedTask) {
            return
        }

        if (!selectedTask.questions.find((question) => question.id === selectedQuestionId)) {
            const fallbackQuestion = selectedTask.questions[0]
            if (fallbackQuestion) {
                setSelectedQuestionId(fallbackQuestion.id)
            }
        }
    }, [selectedTask, selectedQuestionId])

    const updateTask = (taskId: string, updater: (task: TaskDraft) => TaskDraft) => {
        setTasks((prev) => prev.map((task) => (task.id === taskId ? updater(task) : task)))
    }

    const updateSelectedQuestion = (updater: (question: QuestionDraft) => QuestionDraft) => {
        if (!selectedTask || !selectedQuestion) {
            return
        }

        updateTask(selectedTask.id, (oldTask) => ({
            ...oldTask,
            questions: oldTask.questions.map((question) =>
                question.id === selectedQuestion.id ? updater(question) : question
            ),
        }))
    }

    const payloadPreview = useMemo(() => {
        return {
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            classId: formData.classId.trim(),
            isPublic: formData.isPublic,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
            isSingleAttempt: formData.isSingleAttempt,
            canViewResult: formData.canViewResult,
            tasks: tasks.map((task) => ({
                taskContent: task.taskTitle.trim(),
                passages: task.passages.length
                    ? task.passages.map((passage) => ({ passageContent: passage.passageContent.trim() }))
                    : undefined,
                questions: task.questions.map((question) => ({
                    questionContent: question.questionContent.trim(),
                    passageIndex:
                        question.passageIndex === 'none' ? undefined : Number(question.passageIndex),
                    choices: question.choices.map((choice) => ({
                        choiceContent: choice.choiceContent.trim(),
                        isCorrect: choice.isCorrect,
                    })),
                })),
            })),
        }
    }, [formData, tasks])

    const goToQuestionTab = () => {
        if (!formData.title.trim()) {
            toast.error('Vui long nhap tieu de de thi')
            return
        }

        if (!formData.classId.trim()) {
            toast.error('Vui long nhap class ID')
            return
        }

        setActiveTab('questions')
    }

    const submitCreateAssignment = async () => {
        if (!payloadPreview.tasks.length) {
            toast.error('Can it nhat 1 task')
            return
        }

        for (const task of payloadPreview.tasks) {
            if (!task.taskContent) {
                toast.error('Task content khong duoc de trong')
                return
            }

            if (!task.questions.length) {
                toast.error('Moi task phai co it nhat 1 cau hoi')
                return
            }

            for (const question of task.questions) {
                if (!question.questionContent) {
                    toast.error('Question content khong duoc de trong')
                    return
                }

                if (question.choices.length < 2) {
                    toast.error('Moi cau hoi phai co it nhat 2 dap an')
                    return
                }

                const correctCount = question.choices.filter((choice) => choice.isCorrect).length
                if (correctCount !== 1) {
                    toast.error('Moi cau hoi phai co dung 1 dap an dung')
                    return
                }
            }
        }

        setIsSubmitting(true)
        try {
            // TODO: call API create assignment here with payloadPreview.
            await new Promise((resolve) => setTimeout(resolve, 800))
            toast.success('Tao de thi thanh cong')
            router.push('/teacher/quizzes')
        } catch (_error) {
            toast.error('Tao de thi that bai')
        } finally {
            setIsSubmitting(false)
        }
    }

    const topTabs = [
        { key: 'basic', label: 'Thong tin co ban' },
        { key: 'questions', label: 'Soan cau hoi' },
        { key: 'advanced', label: 'Cai dat nang cao' },
        { key: 'history', label: 'Lich su truy cap' },
        { key: 'stats', label: 'Thong ke' },
    ] as const

    return (
        <div className="p-4 md:p-8 space-y-4 bg-muted/20 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Chinh sua de thi</h1>
            </div>

            <Card className="overflow-hidden">
                <div className="border-b px-4 pt-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-5 overflow-auto pb-2">
                            {topTabs.map((tab) => {
                                const isActive = activeTab === tab.key
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        className={`border-b-2 pb-2 text-sm font-medium whitespace-nowrap ${isActive
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground'
                                            }`}
                                        onClick={() => {
                                            if (tab.key === 'questions') {
                                                goToQuestionTab()
                                                return
                                            }

                                            setActiveTab(tab.key)
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                            <Button asChild variant="destructive" size="sm">
                                <Link href="/teacher/quizzes">Tro ve</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={submitCreateAssignment} disabled={isSubmitting}>
                            {isSubmitting ? 'Dang luu...' : 'Luu de thi'}
                        </Button>
                    </div>

                    {activeTab === 'basic' && (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                            <Card className="xl:col-span-3">
                                <CardHeader>
                                    <CardTitle>Anh de thi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="aspect-video rounded-md border bg-gradient-to-br from-sky-100 to-indigo-100" />
                                    <p className="text-sm text-muted-foreground">Tai anh len hoac chon anh de thi</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="h-10 rounded border bg-sky-100" />
                                        <div className="h-10 rounded border bg-orange-100" />
                                        <div className="h-10 rounded border bg-green-100" />
                                        <div className="h-10 rounded border bg-purple-100" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="xl:col-span-4">
                                <CardHeader>
                                    <CardTitle>Thong tin co ban</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Ten de thi *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, title: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="classId">Class ID *</Label>
                                            <Input
                                                id="classId"
                                                value={formData.classId}
                                                placeholder="Nhap class ID"
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, classId: e.target.value }))
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="dueDate">Han nop</Label>
                                            <Input
                                                id="dueDate"
                                                type="datetime-local"
                                                value={formData.dueDate}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Mo ta</Label>
                                        <Textarea
                                            id="description"
                                            className="min-h-36"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, description: e.target.value }))
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="xl:col-span-5">
                                <CardHeader>
                                    <CardTitle>Cau hinh truy cap</CardTitle>
                                    <CardDescription>
                                        Cai dat nay chi ap dung khi truy cap de thi
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-md bg-blue-600/90 text-white px-3 py-2 text-sm">
                                        Cau hinh nay chi ap dung khi truy cap on thi
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Chia se lien ket nay voi moi nguoi</Label>
                                        <div className="rounded-md bg-muted px-3 py-2 text-sm truncate">
                                            https://eduquiz.vn/de-thi/{formData.title.trim() || 'de-thi-moi'}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm">Sao chep</Button>
                                            <Button variant="secondary" size="sm">Quet ma QRCode</Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="isPublic">Pham vi chia se</Label>
                                            <Switch
                                                id="isPublic"
                                                checked={formData.isPublic}
                                                onCheckedChange={(checked) =>
                                                    setFormData((prev) => ({ ...prev, isPublic: checked }))
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="isSingleAttempt">Su dung mat khau / 1 lan lam bai</Label>
                                            <Switch
                                                id="isSingleAttempt"
                                                checked={formData.isSingleAttempt}
                                                onCheckedChange={(checked) =>
                                                    setFormData((prev) => ({ ...prev, isSingleAttempt: checked }))
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="canViewResult">Hoc sinh co the xem ket qua</Label>
                                            <Switch
                                                id="canViewResult"
                                                checked={formData.canViewResult}
                                                onCheckedChange={(checked) =>
                                                    setFormData((prev) => ({ ...prev, canViewResult: checked }))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button onClick={goToQuestionTab}>Sang tab Soan cau hoi</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'questions' && selectedTask && selectedQuestion && (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                            <Card className="xl:col-span-4">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl">Danh sach phan thi</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary"
                                            onClick={() => {
                                                const newTask = createTask(tasks.length)
                                                setTasks((prev) => [...prev, newTask])
                                                setSelectedTaskId(newTask.id)
                                                setSelectedQuestionId(newTask.questions[0].id)
                                            }}
                                        >
                                            Them moi
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {tasks.map((task) => (
                                            <button
                                                key={task.id}
                                                type="button"
                                                className={`px-3 py-1 rounded-full text-sm border ${task.id === selectedTask.id
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'bg-background text-foreground'
                                                    }`}
                                                onClick={() => {
                                                    setSelectedTaskId(task.id)
                                                    setSelectedQuestionId(task.questions[0]?.id ?? '')
                                                }}
                                            >
                                                {task.taskTitle}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                const newTitle = window.prompt('Nhap ten task moi', selectedTask.taskTitle)
                                                if (!newTitle?.trim()) {
                                                    return
                                                }

                                                updateTask(selectedTask.id, (oldTask) => ({
                                                    ...oldTask,
                                                    taskTitle: newTitle.trim(),
                                                }))
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                if (tasks.length === 1) {
                                                    toast.error('Can it nhat mot task')
                                                    return
                                                }

                                                setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id))
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>

                                    <div className="border-t pt-4 space-y-3">
                                        <p className="font-semibold">Danh muc cau hoi</p>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => {
                                                    const newQuestion = createQuestion()
                                                    updateTask(selectedTask.id, (oldTask) => ({
                                                        ...oldTask,
                                                        questions: [...oldTask.questions, newQuestion],
                                                    }))
                                                    setSelectedQuestionId(newQuestion.id)
                                                }}
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> Them cau hoi
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() =>
                                                    updateTask(selectedTask.id, (oldTask) => ({
                                                        ...oldTask,
                                                        passages: [
                                                            ...oldTask.passages,
                                                            {
                                                                id: createId(),
                                                                passageContent: '',
                                                            },
                                                        ],
                                                    }))
                                                }
                                            >
                                                Them bang van ban
                                            </Button>
                                        </div>

                                        <div className="space-y-2 max-h-[38vh] overflow-auto pr-1">
                                            {selectedTask.questions.map((question, index) => (
                                                <button
                                                    key={question.id}
                                                    type="button"
                                                    className={`w-full text-left rounded-md border px-3 py-2 text-sm ${selectedQuestion.id === question.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border'
                                                        }`}
                                                    onClick={() => setSelectedQuestionId(question.id)}
                                                >
                                                    Cau hoi {index + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="xl:col-span-8">
                                <CardHeader>
                                    <CardTitle className="text-xl">Them cau hoi moi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Loai cau hoi</Label>
                                            <Select
                                                value={selectedQuestion.questionType}
                                                onValueChange={() => undefined}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="single-choice">Mot dap an</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Gan vao doan van</Label>
                                            <Select
                                                value={selectedQuestion.passageIndex}
                                                onValueChange={(value) =>
                                                    updateSelectedQuestion((question) => ({
                                                        ...question,
                                                        passageIndex: value,
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Khong gan doan van" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Khong gan doan van</SelectItem>
                                                    {selectedTask.passages.map((_passage, index) => (
                                                        <SelectItem key={String(index)} value={String(index)}>
                                                            Doan van {index + 1}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Soan cau hoi</Label>
                                        <Textarea
                                            className="min-h-24"
                                            placeholder="Nhap noi dung cau hoi"
                                            value={selectedQuestion.questionContent}
                                            onChange={(e) =>
                                                updateSelectedQuestion((question) => ({
                                                    ...question,
                                                    questionContent: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Chu de hoc tap</Label>
                                        <Input
                                            placeholder="Gan nhan chu de hoc tap"
                                            value={selectedQuestion.topicTag}
                                            onChange={(e) =>
                                                updateSelectedQuestion((question) => ({
                                                    ...question,
                                                    topicTag: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Cau tra loi</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    updateSelectedQuestion((question) => ({
                                                        ...question,
                                                        choices: [...question.choices, createChoice()],
                                                    }))
                                                }
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> Them dap an
                                            </Button>
                                        </div>

                                        {selectedQuestion.choices.map((choice, index) => (
                                            <div key={choice.id} className="space-y-2 rounded-md border p-3">
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        className="flex items-center text-sm font-medium"
                                                        onClick={() =>
                                                            updateSelectedQuestion((question) => ({
                                                                ...question,
                                                                choices: question.choices.map((item) => ({
                                                                    ...item,
                                                                    isCorrect: item.id === choice.id,
                                                                })),
                                                            }))
                                                        }
                                                    >
                                                        <CheckCircle2
                                                            className={`w-4 h-4 mr-2 ${choice.isCorrect ? 'text-green-600' : 'text-muted-foreground'
                                                                }`}
                                                        />
                                                        Dap an {index + 1}
                                                    </button>

                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive"
                                                        disabled={selectedQuestion.choices.length <= 2}
                                                        onClick={() =>
                                                            updateSelectedQuestion((question) => ({
                                                                ...question,
                                                                choices: question.choices.filter(
                                                                    (item) => item.id !== choice.id
                                                                ),
                                                            }))
                                                        }
                                                    >
                                                        Xoa dap an
                                                    </Button>
                                                </div>

                                                <Textarea
                                                    className="min-h-20"
                                                    placeholder="Nhap noi dung dap an"
                                                    value={choice.choiceContent}
                                                    onChange={(e) =>
                                                        updateSelectedQuestion((question) => ({
                                                            ...question,
                                                            choices: question.choices.map((item) =>
                                                                item.id === choice.id
                                                                    ? { ...item, choiceContent: e.target.value }
                                                                    : item
                                                            ),
                                                        }))
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-end">
                                        <Button type="button" variant="secondary">Luu cau hoi</Button>
                                        <Button type="button" variant="outline">Luu nhap</Button>
                                        <Button type="button" onClick={submitCreateAssignment}>
                                            Luu nhap va tiep tuc tao moi
                                        </Button>
                                    </div>

                                    <div className="rounded-md border p-3 bg-muted/30">
                                        <p className="text-sm font-medium mb-2">Preview payload</p>
                                        <pre className="text-xs overflow-auto max-h-48">
                                            {JSON.stringify(payloadPreview, null, 2)}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab !== 'basic' && activeTab !== 'questions' && (
                        <Card>
                            <CardContent className="py-16 text-center text-muted-foreground">
                                Tab nay dang duoc cap nhat.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </Card>
        </div>
    )
}
