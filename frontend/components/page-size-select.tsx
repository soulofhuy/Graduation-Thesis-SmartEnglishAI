import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useLanguage } from './language-provider'

type PageSizeSelectProps = {
    value: number
    onChange: (nextValue: number) => void
    options?: number[]
    disabled?: boolean
}

const DEFAULT_OPTIONS = [10, 20, 25]

export function PageSizeSelect({
    value,
    onChange,
    options = DEFAULT_OPTIONS,
    disabled = false,
}: PageSizeSelectProps) {
    const { t } = useLanguage();
    return (
        <div className="flex items-center gap-3">
            <div className='text-sm text-gray-500'>
                {t.common.pagination.label}
            </div>
            <Select
                value={String(value)}
                onValueChange={(nextValue) => {
                    const parsedValue = Number.parseInt(nextValue, 10)
                    if (Number.isFinite(parsedValue) && parsedValue > 0) {
                        onChange(parsedValue)
                    }
                }}
                disabled={disabled}
            >
                <SelectTrigger className="h-10">
                    <SelectValue placeholder={t.common.pageSizeSelect} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                            {size}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
