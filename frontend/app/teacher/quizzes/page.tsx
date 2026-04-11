'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Sparkles, Edit, Trash2, Eye } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface Quiz {
    id: string
    title: string
    category: string
    questionCount: number
    createdDate: string
    status: 'draft' | 'published'
}

export default function TeacherQuizzesPage() {
    const [quizzes] = useState<Quiz[]>([
        {
            id: '1',
            title: 'Bai tap ngu phap Unit 1',
            category: 'Grammar',
            questionCount: 20,
            createdDate: '2024-03-10',
            status: 'published',
        },
        {
            id: '2',
            title: 'Bai tap reading Unit 2',
            category: 'Reading',
            questionCount: 15,
            createdDate: '2024-03-12',
            status: 'published',
        },
        {
            id: '3',
            title: 'Kiem tra giua ki',
            category: 'General',
            questionCount: 50,
            createdDate: '2024-03-15',
            status: 'draft',
        },
    ])

    const allQuizzes = quizzes
    const publishedQuizzes = quizzes.filter((q) => q.status === 'published')

    return (
        <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-background via-background to-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-text">
                        Quan li cau hoi va bai tap
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Quan ly cac de thi va cau hoi cua ban
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        Tao bang AI
                    </Button>
                    <Button asChild className="gap-2">
                        <Link href="/teacher/quizzes/create">
                            <Plus className="w-4 h-4" />
                            Tao bai tap
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">Tat ca ({allQuizzes.length})</TabsTrigger>
                    <TabsTrigger value="published">
                        Da cong khai ({publishedQuizzes.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <Card className="border-0 bg-gradient-to-br from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-800/50 backdrop-blur-sm shadow-glow">
                        <CardHeader>
                            <CardTitle className="bg-gradient-text">Bai tap va cau hoi</CardTitle>
                            <CardDescription>Danh sach tat ca cac bai tap cua ban</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tieu de</TableHead>
                                            <TableHead>Chu de</TableHead>
                                            <TableHead>Cau hoi</TableHead>
                                            <TableHead>Ngay tao</TableHead>
                                            <TableHead>Trang thai</TableHead>
                                            <TableHead className="text-right">Thao tac</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allQuizzes.map((quiz) => (
                                            <TableRow key={quiz.id}>
                                                <TableCell className="font-medium">{quiz.title}</TableCell>
                                                <TableCell>{quiz.category}</TableCell>
                                                <TableCell>{quiz.questionCount}</TableCell>
                                                <TableCell>{quiz.createdDate}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${quiz.status === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                    >
                                                        {quiz.status === 'published' ? 'Da cong khai' : 'Nhap'}
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

                <TabsContent value="published">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bai tap da cong khai</CardTitle>
                            <CardDescription>Danh sach cac bai tap da cong khai</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tieu de</TableHead>
                                            <TableHead>Chu de</TableHead>
                                            <TableHead>Cau hoi</TableHead>
                                            <TableHead>Ngay tao</TableHead>
                                            <TableHead className="text-right">Thao tac</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {publishedQuizzes.map((quiz) => (
                                            <TableRow key={quiz.id}>
                                                <TableCell className="font-medium">{quiz.title}</TableCell>
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
        </div>
    )
}
