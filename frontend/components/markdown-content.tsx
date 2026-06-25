import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

type MarkdownContentProps = {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn('prose prose-sm max-w-none break-words', className)}>
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mt-1 mb-0.5">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1 pl-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1 pl-2">{children}</ol>,
        li: ({ children }) => <li className="leading-snug">{children}</li>,
        code: ({ children, className: codeClass }) => {
          const isBlock = codeClass?.includes('language-')
          return isBlock ? (
            <code className="block bg-black/10 rounded px-2 py-1 text-xs font-mono my-1 whitespace-pre-wrap">{children}</code>
          ) : (
            <code className="bg-black/10 rounded px-1 text-xs font-mono">{children}</code>
          )
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-current opacity-70 pl-2 my-1">{children}</blockquote>
        ),
        hr: () => <hr className="my-2 border-current opacity-20" />,
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}
