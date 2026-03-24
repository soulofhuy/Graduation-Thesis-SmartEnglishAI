'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react'

interface Answer {
  id: string
  questionText: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation?: string
}

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const answered = parseInt(searchParams.get('answered') || '0')
  const total = parseInt(searchParams.get('total') || '20')

  const score = Math.round((answered / total) * 100)
  const points = Math.round((answered / total) * 10)

  // Mock answers data
  const answers: Answer[] = Array.from({ length: total }, (_, i) => {
    const isCorrect = Math.random() > 0.3
    return {
      id: `q${i + 1}`,
      questionText: `Câu hỏi ${i + 1}: ...`,
      userAnswer: String.fromCharCode(65 + Math.floor(Math.random() * 4)),
      correctAnswer: String.fromCharCode(65 + Math.floor(Math.random() * 4)),
      isCorrect,
      explanation: 'Giải thích chi tiết về câu hỏi này...',
    }
  })

  const correctAnswers = answers.filter((a) => a.isCorrect).length

  const getScoreFeedback = () => {
    if (score >= 8) return 'Tuyệt vời!'
    if (score >= 6) return 'Tốt!'
    if (score >= 4) return 'Chưa tốt'
    return 'Cần cố gắng hơn'
  }

  const getScoreColor = () => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-blue-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8 space-y-8">
        {/* Back Button */}
        <Link href="/student/quiz">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách bài tập
          </Button>
        </Link>

        {/* Score Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <p className="text-muted-foreground mb-2">Điểm của bạn</p>
                <h1 className={`text-6xl font-bold ${getScoreColor()}`}>
                  {points}/10
                </h1>
              </div>

              <div>
                <p className="text-4xl font-bold text-foreground mb-2">
                  {score}%
                </p>
                <p className="text-xl text-muted-foreground">
                  {getScoreFeedback()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Tổng câu</p>
                  <p className="text-2xl font-bold text-foreground">{total}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-1">Đúng</p>
                  <p className="text-2xl font-bold text-green-700">
                    {correctAnswers}
                  </p>
                </div>
                <div className="bg-red-100 rounded-lg p-4">
                  <p className="text-sm text-red-700 mb-1">Sai</p>
                  <p className="text-2xl font-bold text-red-700">
                    {total - correctAnswers}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tỉ lệ trả lời đúng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {Math.round((correctAnswers / total) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thời gian làm bài</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <p className="text-3xl font-bold text-primary">28 phút</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Trạng thái</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-bold ${getScoreColor()}`}>
                {score >= 5 ? 'Đạt' : 'Không đạt'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Answer Review */}
        <Card>
          <CardHeader>
            <CardTitle>Xem lại câu trả lời</CardTitle>
            <CardDescription>
              Kiểm tra lại các câu trả lời của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Tất cả ({total})</TabsTrigger>
                <TabsTrigger value="correct">
                  Đúng ({correctAnswers})
                </TabsTrigger>
                <TabsTrigger value="incorrect">
                  Sai ({total - correctAnswers})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {answer.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {answer.questionText}
                        </p>
                      </div>
                    </div>

                    {!answer.isCorrect && (
                      <div className="space-y-2 ml-8">
                        <div className="bg-red-50 rounded p-3">
                          <p className="text-sm text-red-700">
                            <strong>Câu trả lời của bạn:</strong> {answer.userAnswer}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded p-3">
                          <p className="text-sm text-green-700">
                            <strong>Đáp án đúng:</strong> {answer.correctAnswer}
                          </p>
                        </div>
                      </div>
                    )}

                    {answer.explanation && (
                      <div className="ml-8 mt-3 bg-muted/50 rounded p-3">
                        <p className="text-sm text-foreground">
                          <strong>Giải thích:</strong> {answer.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="correct" className="space-y-4 mt-6">
                {answers
                  .filter((a) => a.isCorrect)
                  .map((answer) => (
                    <div
                      key={answer.id}
                      className="border border-green-200 bg-green-50 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="font-medium text-foreground">
                          {answer.questionText}
                        </p>
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="incorrect" className="space-y-4 mt-6">
                {answers
                  .filter((a) => !a.isCorrect)
                  .map((answer) => (
                    <div
                      key={answer.id}
                      className="border border-red-200 bg-red-50 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="font-medium text-foreground">
                          {answer.questionText}
                        </p>
                      </div>
                      <div className="space-y-2 ml-8">
                        <div className="bg-white rounded p-3 border border-red-200">
                          <p className="text-sm text-red-700">
                            <strong>Câu trả lời của bạn:</strong> {answer.userAnswer}
                          </p>
                        </div>
                        <div className="bg-white rounded p-3 border border-green-200">
                          <p className="text-sm text-green-700">
                            <strong>Đáp án đúng:</strong> {answer.correctAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link href="/student/quiz">
            <Button variant="outline">Quay lại danh sách</Button>
          </Link>
          <Link href={`/student/quiz/${params.id}/take`}>
            <Button>Làm lại bài tập</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
