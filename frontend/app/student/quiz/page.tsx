'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Clock, FileText, Search } from 'lucide-react'

interface QuizItem {
  id: string
  title: string
  questionsCount: number
  duration: number
  category: string
  dueDate?: string
  isAssigned: boolean
}

export default function StudentQuizPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const quizzes: QuizItem[] = [
    {
      id: '1',
      title: 'Bài tập ngữ pháp Unit 1',
      questionsCount: 20,
      duration: 30,
      category: 'Grammar',
      dueDate: '2024-03-25',
      isAssigned: true,
    },
    {
      id: '2',
      title: 'Bài tập reading Unit 2',
      questionsCount: 15,
      duration: 25,
      category: 'Reading',
      dueDate: '2024-03-26',
      isAssigned: true,
    },
    {
      id: '3',
      title: 'Kiểm tra giữa kì',
      questionsCount: 50,
      duration: 90,
      category: 'General',
      dueDate: '2024-03-27',
      isAssigned: true,
    },
    {
      id: '4',
      title: 'Bài tập listening Unit 3',
      questionsCount: 12,
      duration: 20,
      category: 'Listening',
      isAssigned: false,
    },
    {
      id: '5',
      title: 'Bài tập writing Unit 4',
      questionsCount: 8,
      duration: 40,
      category: 'Writing',
      isAssigned: false,
    },
  ]

  const assignedQuizzes = quizzes.filter((q) => q.isAssigned)
  const publicQuizzes = quizzes.filter((q) => !q.isAssigned)

  const filteredAssigned = assignedQuizzes.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPublic = publicQuizzes.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const QuizCard = ({ quiz }: { quiz: QuizItem }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">
              {quiz.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {quiz.category}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quiz Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span>{quiz.questionsCount} câu hỏi</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{quiz.duration} phút</span>
          </div>
        </div>

        {/* Due Date */}
        {quiz.dueDate && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              Hạn nộp: <strong>{quiz.dueDate}</strong>
            </p>
          </div>
        )}

        {/* Action Button */}
        <Link href={`/student/quiz/${quiz.id}/take`} className="block">
          <Button className="w-full gap-2">
            <BookOpen className="w-4 h-4" />
            Bắt đầu làm bài
          </Button>
        </Link>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Làm bài tập
        </h1>
        <p className="text-muted-foreground mt-1">
          Làm bài tập được giao và luyện tập các chủ đề
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm bài tập..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assigned" className="w-full">
        <TabsList>
          <TabsTrigger value="assigned">
            Bài tập được giao ({assignedQuizzes.length})
          </TabsTrigger>
          <TabsTrigger value="public">
            Bài tập công khai ({publicQuizzes.length})
          </TabsTrigger>
        </TabsList>

        {/* Assigned Quizzes */}
        <TabsContent value="assigned">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredAssigned.length > 0 ? (
              filteredAssigned.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Không tìm thấy bài tập nào
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Public Quizzes */}
        <TabsContent value="public">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredPublic.length > 0 ? (
              filteredPublic.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Không tìm thấy bài tập công khai nào
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
