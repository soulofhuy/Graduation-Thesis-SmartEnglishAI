'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Send, Sparkles } from 'lucide-react'

const chatThreads = [
    {
        id: 'thread-1',
        title: 'Lớp 8CB1 - Bài tập 1',
        subtitle: 'Tổng hợp điểm số',
    },
    {
        id: 'thread-2',
        title: 'Lớp 9CB1 - Bài tập 2',
        subtitle: 'Phân tích kỹ năng',
    },
    {
        id: 'thread-3',
        title: 'Học sinh chưa nộp bài',
        subtitle: 'Gợi ý nhắc nhở',
    },
]

const chatMessages = [
    {
        id: 'msg-1',
        role: 'ai',
        name: 'SmartEnglish AI',
        message:
            'Bạn muốn tổng hợp kết quả hay cần gợi ý nhận xét theo từng học sinh?',
        time: '10:15',
    },
    {
        id: 'msg-2',
        role: 'teacher',
        name: 'Bạn',
        message:
            'Tổng hợp nhanh kết quả bài tập này và đề xuất 2 học sinh cần hỗ trợ thêm.',
        time: '10:16',
    },
    {
        id: 'msg-3',
        role: 'ai',
        name: 'SmartEnglish AI',
        message:
            'Đã rõ. Tôi sẽ tạo báo cáo ngắn gọn, kèm gợi ý hỗ trợ và thông điệp nhắc nhở mẫu.',
        time: '10:17',
    },
]

type ResultsChatPanelProps = {
    className?: string
}

export function ResultsChatPanel({ className }: ResultsChatPanelProps) {
    return (
        <Card className={cn('shadow-sm', className)}>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 mb-3">
                    <Avatar className="size-10">
                        <AvatarImage src="/logo/logo.png" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">Chat với AI</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <div className="grid gap-4 lg:grid-cols-[220px_1fr] flex-grow">
                    <div className="space-y-3">
                        <div className="text-xs text-center font-semibold tracking-wide text-muted-foreground">
                            Cuộc trò chuyện gần đây
                        </div>
                        <div className="space-y-2">
                            {chatThreads.map((thread) => (
                                <button
                                    key={thread.id}
                                    className="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                                >
                                    <div className="font-semibold text-foreground">{thread.title}</div>
                                    <div className="text-xs text-muted-foreground">{thread.subtitle}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex h-full flex-col rounded-lg border bg-background">
                        <ScrollArea className="flex-grow">
                            <div className="space-y-4 px-4 py-3">
                                {chatMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            'flex gap-3',
                                            message.role === 'teacher' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        {message.role === 'ai' && (
                                            <Avatar className="size-8">
                                                <AvatarImage src="/logo/logo.png" alt="AI" />
                                                <AvatarFallback>AI</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div
                                            className={cn(
                                                'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                                                message.role === 'teacher'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-foreground'
                                            )}
                                        >
                                            <div className="text-xs font-semibold opacity-80">
                                                {message.name}
                                            </div>
                                            <div className="mt-1 leading-relaxed">{message.message}</div>
                                            <div className="mt-2 text-[11px] opacity-70">{message.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="border-t p-3">
                            <div className="flex items-center gap-2">
                                <Input placeholder="Nhập tin nhắn cho AI..." />
                                <Button size="icon" aria-label="Gửi tin nhắn">
                                    <Send className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
