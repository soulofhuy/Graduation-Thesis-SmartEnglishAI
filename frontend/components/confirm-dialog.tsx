'use client'

import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ConfirmDialogProps = {
    open: boolean
    onOpenChange?: (open: boolean) => void
    title?: React.ReactNode
    description?: React.ReactNode
    onConfirm: () => void
    confirmLabel?: React.ReactNode
    cancelLabel?: React.ReactNode
}

export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmLabel = 'Yes',
    cancelLabel = 'No',
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
