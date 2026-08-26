import { useMemo } from 'react'
import classNames from '../utils/classNames'
import { SegmentContextProvider } from './context'
import useControllableState from '../hooks/useControllableState'
import type { CommonProps, TypeAttributes } from '../@types/common'
import type { SegmentValue } from './context'
import type { Ref } from 'react'

export interface SegmentProps<
    T extends 'single' | 'multiple' = 'single',
> extends CommonProps {
    defaultValue?: SegmentValue<T>
    onChange?: (segmentValue: SegmentValue<T>) => void
    ref?: Ref<HTMLDivElement>
    selectionType?: 'single' | 'multiple'
    size?: TypeAttributes.ControlSize
    value?: SegmentValue<T>
}

const Segment = <T extends 'single' | 'multiple' = 'single'>(
    props: SegmentProps<T>,
) => {
    const {
        children,
        className,
        defaultValue,
        onChange = () => {
            // empty callback
        },
        ref,
        selectionType = 'single',
        size,
        value: valueProp,
        ...rest
    } = props

    const [value, setValue] = useControllableState<SegmentValue<T>>({
        prop: valueProp,
        defaultProp: defaultValue,
        onChange: onChange,
    })

    const onActive = (itemValue: SegmentValue<T>) => {
        setValue(itemValue)
    }

    const onDeactivate = (itemValue: SegmentValue<T>) => {
        if (selectionType === 'single') {
            setValue('' as SegmentValue<T>)
        }

        if (selectionType === 'multiple') {
            setValue((prevValue) => {
                return (prevValue as string[]).filter(
                    (value) => value !== itemValue,
                ) as SegmentValue<T>
            })
        }
    }

    const segmentValue = useMemo(() => {
        if (selectionType === 'single') {
            return value
        }

        if (selectionType === 'multiple') {
            return value ? value : []
        }
    }, [selectionType, value])

    return (
        <SegmentContextProvider
            value={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value: segmentValue as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onActive: onActive as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onDeactivate: onDeactivate as any,
                selectionType,
                size,
            }}
        >
            <div
                ref={ref}
                className={classNames(
                    'segment',
                    'gap-2 bg-gray-100 dark:bg-gray-700',
                    className,
                )}
                {...rest}
            >
                {children}
                {selectionType === 'single' && (
                    <div className="segment-item-indicator" />
                )}
            </div>
        </SegmentContextProvider>
    )
}

export default Segment
