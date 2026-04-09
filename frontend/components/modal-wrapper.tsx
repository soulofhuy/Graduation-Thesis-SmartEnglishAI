import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModalWrapperProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  contentClassName?: string
}

export function ModalWrapper({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
}: ModalWrapperProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'w-[90vw] max-w-5xl border-0 bg-gradient-to-br from-white/95 to-white/90 dark:from-slate-800/95 dark:to-slate-800/90 backdrop-blur-xl shadow-2xl',
          contentClassName
        )}
      >
        <DialogHeader>
          <DialogTitle className="bg-gradient-text text-2xl">{title}</DialogTitle>
          {description && <DialogDescription className="text-muted-foreground">{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
