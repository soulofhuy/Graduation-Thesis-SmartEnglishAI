import { ChevronDown, Code, FileJson } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { QuizPreviewContent } from './quiz-preview-content'

export function ChatMessageContent({ content }: { content: string }) {
    let parsedJson = null
    let isAssignmentPayload = false

    try {
        const trimmed = content.trim()
        let jsonString = trimmed

        if (trimmed.startsWith('```json') && trimmed.endsWith('```')) {
            jsonString = trimmed.replace(/^```json/, '').replace(/```$/, '').trim()
        } else if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
            jsonString = trimmed.replace(/^```/, '').replace(/```$/, '').trim()
        }

        if (
            (jsonString.startsWith('{') && jsonString.endsWith('}')) ||
            (jsonString.startsWith('[') && jsonString.endsWith(']'))
        ) {
            parsedJson = JSON.parse(jsonString)
            if (parsedJson && typeof parsedJson === 'object' && 'title' in parsedJson && 'tasks' in parsedJson) {
                isAssignmentPayload = true
            }
        }
    } catch (e) {
        // Ignore JSON parse errors
    }

    if (parsedJson) {
        if (isAssignmentPayload) {
            return (
                <div className="w-full mt-2 overflow-hidden rounded-lg bg-background p-4 shadow-sm border">
                    <QuizPreviewContent payload={parsedJson as any} />
                </div>
            )
        }

        // Generic JSON
        return (
            <Collapsible className="border rounded-md bg-background/50 min-w-[200px]">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full flex justify-between p-2 h-auto text-xs hover:bg-transparent">
                        <span className="flex items-center gap-1.5"><Code className="h-3 w-3" /> JSON Payload</span>
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-2 border-t overflow-x-auto text-xs font-mono max-h-[250px] overflow-y-auto">
                        <pre>{JSON.stringify(parsedJson, null, 2)}</pre>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        )
    }

    return <div className="whitespace-pre-wrap">{content}</div>
}