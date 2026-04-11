'use client'

import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { QuestionDraft, TaskDraft, TaskType } from './quiz-builder-types'

type QuizQuestionsSectionProps = {
    tasks: TaskDraft[]
    selectedTask: TaskDraft
    selectedQuestion: QuestionDraft
    usesSharedPassage: boolean
    showQuestionComposer: boolean
    isReadingComprehension: boolean
    getSharedPassageContent: (task: TaskDraft) => string
    onAddTask: () => void
    onSelectTask: (taskId: string) => void
    onEditTaskTitle: (taskId: string) => void
    onDeleteTask: (taskId: string) => void
    onChangeTaskType: (taskId: string, taskType: TaskType) => void
    onChangeTaskDescription: (taskId: string, value: string) => void
    onAddQuestion: (taskId: string) => void
    onSelectQuestion: (questionId: string) => void
    onChangeSharedPassage: (taskId: string, value: string) => void
    onChangeQuestionContent: (value: string) => void
    onAddChoice: () => void
    onToggleCorrectChoice: (choiceId: string) => void
    onDeleteChoice: (choiceId: string) => void
    onChangeChoiceContent: (choiceId: string, value: string) => void
}

export function QuizQuestionsSection({
    tasks,
    selectedTask,
    selectedQuestion,
    usesSharedPassage,
    showQuestionComposer,
    isReadingComprehension,
    getSharedPassageContent,
    onAddTask,
    onSelectTask,
    onEditTaskTitle,
    onDeleteTask,
    onChangeTaskType,
    onChangeTaskDescription,
    onAddQuestion,
    onSelectQuestion,
    onChangeSharedPassage,
    onChangeQuestionContent,
    onAddChoice,
    onToggleCorrectChoice,
    onDeleteChoice,
    onChangeChoiceContent,
}: QuizQuestionsSectionProps) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <Card className="xl:col-span-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Danh sach phan thi</CardTitle>
                        <Button variant="ghost" size="sm" className="text-primary" onClick={onAddTask}>
                            Them moi
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {tasks.map((task) => (
                            <button
                                key={task.id}
                                type="button"
                                className={`px-3 py-1 rounded-full text-sm border ${task.id === selectedTask.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background text-foreground'
                                    }`}
                                onClick={() => onSelectTask(task.id)}
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
                            onClick={() => onEditTaskTitle(selectedTask.id)}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onDeleteTask(selectedTask.id)}
                        >
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>

                    <div className="space-y-3 border-t pt-4">
                        <div className="grid gap-2">
                            <Label>Task type</Label>
                            <Select
                                value={selectedTask.taskType}
                                onValueChange={(value) => onChangeTaskType(selectedTask.id, value as TaskType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chon task type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pronounciation">Pronounciation</SelectItem>
                                    <SelectItem value="word_stress">Word stress</SelectItem>
                                    <SelectItem value="situational_dialog">Situational dialog</SelectItem>
                                    <SelectItem value="multiple_choice">Multiple choice</SelectItem>
                                    <SelectItem value="cloze_passage">Cloze passage</SelectItem>
                                    <SelectItem value="reading_comprehension">Reading comprehension</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Mo ta task</Label>
                            <RichTextEditor
                                minHeightClass="min-h-20"
                                placeholder="Nhap mo ta cho task nay"
                                value={selectedTask.taskDescription}
                                onChange={(value) => onChangeTaskDescription(selectedTask.id, value)}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold">Danh muc cau hoi</p>
                            <Button type="button" variant="outline" size="sm" onClick={() => onAddQuestion(selectedTask.id)}>
                                <Plus className="w-4 h-4 mr-1" /> Them cau hoi
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-3 max-h-[38vh] overflow-auto pr-1">
                            {selectedTask.questions.map((question, index) => (
                                <button
                                    key={question.id}
                                    type="button"
                                    className={`h-11 w-11 rounded-md border text-sm font-medium flex items-center justify-center ${selectedQuestion.id === question.id
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border bg-background'
                                        }`}
                                    onClick={() => onSelectQuestion(question.id)}
                                >
                                    {index + 1}
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
                <CardContent className="space-y-3 pt-5">
                    {usesSharedPassage && (
                        <div className="grid gap-2">
                            <Label>Doan van dung chung cho task</Label>
                            <RichTextEditor
                                minHeightClass="min-h-32"
                                placeholder="Nhap doan van dung chung"
                                value={getSharedPassageContent(selectedTask)}
                                onChange={(value) => onChangeSharedPassage(selectedTask.id, value)}
                            />
                        </div>
                    )}

                    {showQuestionComposer && (
                        <div className="grid gap-2">
                            <Label>Soan cau hoi</Label>
                            <RichTextEditor
                                minHeightClass="min-h-24"
                                placeholder="Nhap noi dung cau hoi"
                                value={selectedQuestion.questionContent}
                                onChange={onChangeQuestionContent}
                            />
                        </div>
                    )}

                    {!showQuestionComposer && (
                        <p className="text-sm text-muted-foreground">
                            Loai task nay khong can nhap noi dung cau hoi. Chi can tao danh sach cau hoi va dap an.
                        </p>
                    )}

                    {isReadingComprehension && (
                        <p className="text-sm text-muted-foreground">
                            Reading comprehension: moi cau hoi van can noi dung cau hoi va dap an, va tat ca dung chung doan van tren.
                        </p>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Cau tra loi</Label>
                            <Button type="button" variant="outline" size="sm" onClick={onAddChoice}>
                                <Plus className="w-4 h-4 mr-1" /> Them dap an
                            </Button>
                        </div>

                        {selectedQuestion.choices.map((choice, index) => (
                            <div key={choice.id} className="space-y-2 rounded-md border p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        className="flex items-center text-sm font-medium"
                                        onClick={() => onToggleCorrectChoice(choice.id)}
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
                                        onClick={() => onDeleteChoice(choice.id)}
                                    >
                                        Xoa dap an
                                    </Button>
                                </div>

                                <RichTextEditor
                                    minHeightClass="min-h-20"
                                    placeholder="Nhap noi dung dap an"
                                    value={choice.choiceContent}
                                    onChange={(value) => onChangeChoiceContent(choice.id, value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <Button type="button" variant="secondary">Luu cau hoi</Button>
                        <Button type="button" variant="outline">Luu nhap</Button>
                        <Button type="button">Luu nhap va tiep tuc tao moi</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
