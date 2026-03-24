import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-border/30">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-text">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="sm:flex-shrink-0">{action}</div>}
    </div>
  )
}
