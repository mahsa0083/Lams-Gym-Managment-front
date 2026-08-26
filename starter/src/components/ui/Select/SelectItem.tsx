import { Check } from '../Icons'
import ListElement from './ListElement'
import classNames from '@/utils/classNames'
import type { BaseSelectItemProps, SingleOption, CustomOption } from './types'

type SelectItemProps<T> = {
    id?: string
    customOption?: CustomOption<T>
} & BaseSelectItemProps<T>

const SelectItem = <T,>(props: SelectItemProps<T>) => {
    const {
        hovered = false,
        selected = false,
        option,
        customOption,
        onClick,
        onMouseDown,
        onMouseMove,
        ...rest
    } = props

    const disabled = 'disabled' in option && option?.disabled

    const actionEvents = disabled
        ? {}
        : {
              onClick,
              onMouseDown,
              onMouseMove,
          }

    return (
        <ListElement
            className={classNames(
                hovered && 'select-item-hovered',
                selected && 'select-item-selected',
                disabled && 'select-item-disabled',
            )}
            {...actionEvents}
            {...rest}
        >
            {customOption ? (
                customOption({
                    option: option as SingleOption<T>,
                    hovered,
                    selected,
                    CheckIcon: <Check height="1.25em" width="1.25em" />,
                })
            ) : (
                <>
                    {option.label}
                    {selected && <Check />}
                </>
            )}
        </ListElement>
    )
}

export default SelectItem
