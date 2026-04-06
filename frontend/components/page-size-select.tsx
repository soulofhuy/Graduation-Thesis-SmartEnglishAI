import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

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
    return (
        <div className="space-y-2">
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
                <SelectTrigger>
                    <SelectValue placeholder="Chon so luong" />
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
