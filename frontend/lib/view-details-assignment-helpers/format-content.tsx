'use client'

import { normalizeHtmlToText } from '@/lib/view-details-assignment-helpers/normalize-html-to-text'
import { cn } from '@/lib/utils'

type FormattedContentProps = {
    html?: string | null
    text?: string | null
    className?: string
}

export const hasRenderableContent = (value?: string | null) =>
    normalizeHtmlToText(value).length > 0

export function FormattedContent({ html, text, className }: FormattedContentProps) {
    if (hasRenderableContent(html)) {
        return (
            <div
                className={cn(
                    '[&_p]:my-0 [&_strong]:font-semibold [&_b]:font-semibold [&_u]:underline [&_s]:line-through [&_em]:italic [&_i]:italic',
                    className,
                )}
                dangerouslySetInnerHTML={{ __html: html as string }}
            />
        )
    }

    if (!text?.trim()) {
        return null
    }

    return <p className={cn('whitespace-pre-line', className)}>{text}</p>
}
