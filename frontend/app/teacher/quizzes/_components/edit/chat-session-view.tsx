'use client'

import { useEffect, useRef, useState } from 'react'
import { getOlderChatMessagesForSession } from '@/services/teacher/assignments'

type ChatSessionViewProps = {
    session: any
    accessToken: string
    assignmentId: string
}

export function ChatSessionView({ session, accessToken, assignmentId }: ChatSessionViewProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const INITIAL_VISIBLE = 3
    const LOAD_MORE = 10
    const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE)
    const prevScrollHeightRef = useRef<number>(0)

    // flatten prompts into individual messages
    const [allMessages, setAllMessages] = useState<any[]>(() => {
        const arr: Array<any> = []
            ; (session.prompts ?? []).forEach((prompt: any) => {
                arr.push({
                    id: `${prompt.id}-user`,
                    role: 'user',
                    text: prompt.prompt,
                    createdAt: prompt.createdAt,
                    version: prompt.version
                })

                if (prompt.response?.response) {
                    arr.push({
                        id: `${prompt.id}-assistant`,
                        role: 'assistant',
                        text: prompt.response.response,
                        createdAt: prompt.response.createdAt ?? prompt.createdAt
                    })
                }
            })

        return arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })

    const messages = allMessages
    const [hasMoreOlder, setHasMoreOlder] = useState<boolean>(true)
    const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false)

    // reset visible when session changes
    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE)
    }, [session.id])

    // scroll handling: when user scrolls to top, load older messages
    const onScroll = () => {
        const el = containerRef.current
        if (!el) return
        if (el.scrollTop <= 8) {
            if (visibleCount < messages.length) {
                // load more from already-fetched messages
                prevScrollHeightRef.current = el.scrollHeight
                setVisibleCount((v) => Math.min(messages.length, v + LOAD_MORE))
                return
            }

            // need to fetch older from backend if available
            if (!hasMoreOlder || isLoadingOlder) return

            void (async () => {
                setIsLoadingOlder(true)
                try {
                    const earliest = messages[0]?.createdAt
                    const params = new URLSearchParams()
                    params.set('limit', String(LOAD_MORE))
                    if (earliest) params.set('before', new Date(earliest).toISOString())

                    const older: any[] | null = await getOlderChatMessagesForSession(
                        accessToken,
                        assignmentId,
                        session.id,
                        params.get('before') ?? undefined,
                        Number(params.get('limit') ?? LOAD_MORE)
                    )
                    if (!Array.isArray(older) || older.length === 0) {
                        setHasMoreOlder(false)
                        return
                    }

                    // transform prompts into messages
                    const transformed: any[] = []
                    older.forEach((prompt: any) => {
                        transformed.push({ id: `${prompt.id}-user`, role: 'user', text: prompt.prompt, createdAt: prompt.createdAt, version: prompt.version })
                        if (prompt.response?.response) transformed.push({ id: `${prompt.id}-assistant`, role: 'assistant', text: prompt.response.response, createdAt: prompt.response.createdAt ?? prompt.createdAt })
                    })

                    // prepend and sort
                    setAllMessages((prev) => {
                        const next = [...transformed, ...prev]
                        return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    })
                    // increase visible count by number of items fetched
                    prevScrollHeightRef.current = el.scrollHeight
                    setVisibleCount((v) => v + transformed.length)
                } catch (err) {
                    // swallow - optional: show toast
                } finally {
                    setIsLoadingOlder(false)
                }
            })()
        }
    }

    // after visibleCount change (loading older), adjust scroll to keep position
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        // on initial mount or when increasing visibleCount, maintain view at bottom for first render
        requestAnimationFrame(() => {
            if (prevScrollHeightRef.current > 0) {
                const newScroll = el.scrollHeight - prevScrollHeightRef.current
                el.scrollTop = newScroll
                prevScrollHeightRef.current = 0
            } else {
                // initial load: scroll to bottom
                el.scrollTop = el.scrollHeight
            }
        })
    }, [visibleCount, messages.length])

    const shown = messages.slice(Math.max(0, messages.length - visibleCount))

    return (
        <div className="p-4">
            <div className="relative z-10 flex h-[610px] flex-col gap-4 rounded-xl border border-border/60 bg-card/70 p-4 shadow-sm">
                <div className="hidden lg:block absolute inset-0 rounded-xl bg-gradient-to-br from-background via-background to-background" />
                <div className="absolute -right-24 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f3f4f6_0%,#e6e7e9_40%,#d9dade_100%)] blur-[70px] opacity-50 dark:opacity-30 pointer-events-none" />

                <div className="relative z-10 flex flex-1 flex-col overflow-hidden rounded-xl border border-muted/40 bg-background/70">
                    <div
                        ref={containerRef}
                        onScroll={onScroll}
                        className="flex-1 overflow-y-auto px-4 py-4"
                    >
                        <div className="space-y-4">
                            {shown.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">Chua co tin nhan nao trong session nay.</div>
                            ) : (
                                shown.map((msg: any) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[60%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-br-sm bg-orange-100 text-orange-950 dark:bg-orange-500/20 dark:text-orange-100' : 'rounded-bl-sm border bg-muted/40 text-foreground'}`}>
                                            <div className="whitespace-pre-wrap">{msg.text}</div>
                                            <div className="text-xs opacity-70 mt-2">{msg.version && msg.role === 'user' ? `Version ${msg.version} · ` : ''}{new Date(msg.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
