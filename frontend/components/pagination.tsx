import { Button } from '@/components/ui/button'
import { PageSizeSelect } from '@/components/page-size-select'

type PaginationProps = {
    totalItems: number
    hasPrevPage: boolean
    hasNextPage: boolean
    isPaging: boolean
    pageSize: number
    onPrevPage: () => void
    onNextPage: () => void
    onPageSizeChange: (nextValue: number) => void
    totalLabel: string
    previousLabel: string
    nextLabel: string
}

export function TablePagination({
    totalItems,
    hasPrevPage,
    hasNextPage,
    isPaging,
    pageSize,
    onPrevPage,
    onNextPage,
    onPageSizeChange,
    totalLabel,
    previousLabel,
    nextLabel
}: PaginationProps) {
    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">
                {totalLabel} {totalItems}
            </p>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevPage || isPaging}
                    onClick={onPrevPage}
                >
                    {previousLabel}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNextPage || isPaging}
                    onClick={onNextPage}
                >
                    {nextLabel}
                </Button>
            </div>

            <PageSizeSelect
                value={pageSize}
                onChange={onPageSizeChange}
                options={[10, 20, 25, 50]}
                disabled={isPaging}
            />
        </div>
    )
}

