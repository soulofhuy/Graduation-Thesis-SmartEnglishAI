import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-primary/60 text-6xl animate-float">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold bg-gradient-text mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="transition-smooth hover:scale-105">{action}</div>}
    </div>
  )
}
