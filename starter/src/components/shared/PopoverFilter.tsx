import { useState, useMemo, useEffect } from 'react'
import Popover from '@/components/ui/Popover'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import Button from '@/components/ui/Button'
import { LuSearch } from 'react-icons/lu'
import type { ReactNode } from 'react'

type Data = Array<{ label: string; value: string }>

type PopoverFilterProps = {
    data: Data
    onChange?: (data: Data) => void
    title?: string | ReactNode
    placement?: 'bottom-start' | 'bottom-end'
    inputPlaceholder?: string
    showReset?: boolean
    value?: string[]
    renderTrigger?: ReactNode
    width?: number
}
const PopoverFilter = (props: PopoverFilterProps) => {
    const {
        data = [],
        onChange,
        placement = 'bottom-start',
        title = 'Filter',
        inputPlaceholder = 'Search...',
        value,
        showReset = true,
        renderTrigger,
        width = 220,
    } = props

    const [selected, setSelected] = useState<string[]>([])
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        if (value) {
            setSelected(value)
        }
    }, [value])

    const handleChange = (value: string[]) => {
        setSelected(value)
        onChange?.(data.filter((item) => value.includes(item.value)))
    }

    const checkboxList = useMemo(
        () =>
            data.filter(
                (item) =>
                    !inputValue ||
                    item.label.toLowerCase().includes(inputValue.toLowerCase()),
            ),
        [data, inputValue],
    )

    return (
        <Popover
            title={title}
            placement={placement}
            width={width}
            className="p-0"
            renderTrigger={renderTrigger}
        >
            <div className="flex flex-col gap-2 p-1">
                <div className="w-full px-1">
                    <Input
                        placeholder={inputPlaceholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        prefix={<LuSearch className="text-lg" />}
                        className="w-full"
                    />
                </div>
                <Checkbox.Group
                    vertical
                    className="gap-0"
                    value={selected}
                    onChange={handleChange}
                >
                    {checkboxList.length > 0 ? (
                        checkboxList.map((item) => (
                            <Checkbox
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </Checkbox>
                        ))
                    ) : (
                        <div className="text-center">No results found</div>
                    )}
                </Checkbox.Group>
            </div>
            {selected.length > 0 && showReset && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-1">
                    <Button
                        block
                        variant="ghost"
                        onClick={() => handleChange([])}
                    >
                        Clear filters
                    </Button>
                </div>
            )}
        </Popover>
    )
}

export default PopoverFilter
