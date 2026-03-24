'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Sparkles, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ModalWrapper } from '@/components/modal-wrapper'

interface Quiz {
  id: string
  title: string
  category: string
  questionCount: number
  createdDate: string
  status: 'draft' | 'published'
}

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Bài tập ngữ pháp Unit 1',
      category: 'Grammar',
      questionCount: 20,
      createdDate: '2024-03-10',
      status: 'published',
    },
    {
      id: '2',
      title: 'Bài tập reading Unit 2',
      category: 'Reading',
      questionCount: 15,
      createdDate: '2024-03-12',
      status: 'published',
    },
    {
      id: '3',
      title: 'Kiểm tra giữa kì',
      category: 'General',
      questionCount: 50,
      createdDate: '2024-03-15',
      status: 'draft',
    },
  ])

  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [selectedQuestionCount, setSelectedQuestionCount] = useState('10')
  const [selectedTopic, setSelectedTopic] = useState('grammar')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Vui lòng nhập mô tả cho đề thi')
      return
    }

    setIsGenerating(true)
    try {
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      const newQuiz: Quiz = {
        id: String(quizzes.length + 1),
        title: aiPrompt.substring(0, 50),
        category: selectedTopic,
        questionCount: parseInt(selectedQuestionCount),
        createdDate: new Date().toISOString().split('T')[0],
        status: 'draft',
      }

      setQuizzes([...quizzes, newQuiz])
      toast.success('Tạo đề thi bằng AI thành công!')
      setIsAIModalOpen(false)
      setAiPrompt('')
    } catch (error) {
      toast.error('Lỗi khi tạo đề thi')
    } finally {
      setIsGenerating(false)
    }
  }

  const allQuizzes = quizzes
  const publishedQuizzes = quizzes.filter((q) => q.status === 'published')

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-text">
            Quản lí câu hỏi & bài tập
          </h1>
          <p className="text-lg text-muted-foreground">
            Quản lý các đề thi và câu hỏi của bạn
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsAIModalOpen(true)}
          >
            <Sparkles className="w-4 h-4" />
            Tạo bằng AI
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo bài tập
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            Tất cả ({allQuizzes.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Đã công khai ({publishedQuizzes.length})
          </TabsTrigger>
        </TabsList>

        {/* All Quizzes Tab */}
        <TabsContent value="all">
          <Card className="border-0 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-800/50 backdrop-blur-sm shadow-glow">
            <CardHeader>
              <CardTitle className="bg-gradient-text">Bài tập và câu hỏi</CardTitle>
              <CardDescription>
                Danh sách tất cả các bài tập của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Chủ đề</TableHead>
                      <TableHead>Câu hỏi</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allQuizzes.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="font-medium">
                          {quiz.title}
                        </TableCell>
                        <TableCell>{quiz.category}</TableCell>
                        <TableCell>{quiz.questionCount}</TableCell>
                        <TableCell>{quiz.createdDate}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              quiz.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {quiz.status === 'published'
                              ? 'Đã công khai'
                              : 'Nháp'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Published Quizzes Tab */}
        <TabsContent value="published">
          <Card>
            <CardHeader>
              <CardTitle>Bài tập đã công khai</CardTitle>
              <CardDescription>
                Danh sách các bài tập đã công khai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Chủ đề</TableHead>
                      <TableHead>Câu hỏi</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publishedQuizzes.map((quiz) => (
                      <TableRow key={quiz.id}>
                        <TableCell className="font-medium">
                          {quiz.title}
                        </TableCell>
                        <TableCell>{quiz.category}</TableCell>
                        <TableCell>{quiz.questionCount}</TableCell>
                        <TableCell>{quiz.createdDate}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Generation Modal */}
      <ModalWrapper
        isOpen={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        title="Tạo bài tập bằng AI"
        description="Nhập yêu cầu của bạn để AI tạo bài tập"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsAIModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
            >
              {isGenerating ? 'Đang tạo...' : 'Tạo bài tập'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Mô tả yêu cầu
            </label>
            <Textarea
              placeholder="Ví dụ: Tạo 20 câu hỏi trắc nghiệm về Unit 1 - Present Tense"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Số câu hỏi
              </label>
              <Select value={selectedQuestionCount} onValueChange={setSelectedQuestionCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 câu</SelectItem>
                  <SelectItem value="10">10 câu</SelectItem>
                  <SelectItem value="15">15 câu</SelectItem>
                  <SelectItem value="20">20 câu</SelectItem>
                  <SelectItem value="30">30 câu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Chủ đề
              </label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grammar">Grammar</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </ModalWrapper>
    </div>
  )
}
