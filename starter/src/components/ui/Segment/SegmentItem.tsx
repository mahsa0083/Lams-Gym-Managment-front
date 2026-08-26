import { useCallback } from 'react'
import classNames from '../utils/classNames'
import { useSegment } from './context'
import { SEGMENT_SIZES, SIZES } from '../utils/constants'
import type { CommonProps, TypeAttributes } from '../@types/common'
import type { ReactNode, ComponentPropsWithRef } from 'react'

type ChildrenParams = {
    active: boolean
    disabled: boolean
    value: string
    onSegmentItemClick: () => void
}

export interface SegmentItemProps
    extends
        Omit<CommonProps, 'children'>,
        Omit<ComponentPropsWithRef<'button'>, 'children'> {
    children: ((params: ChildrenParams) => ReactNode) | ReactNode
    disabled?: boolean
    size?: TypeAttributes.ControlSize
    value?: string
}

const unwrapArray = (arg: (params: ChildrenParams) => ReactNode) =>
    Array.isArray(arg) ? arg[0] : arg

const SegmentItem = (props: SegmentItemProps) => {
    const {
        children,
        className,
        disabled = false,
        ref,
        value: valueProp,
        size,
        ...rest
    } = props

    const {
        value: valueContext,
        onActive,
        onDeactivate,
        selectionType,
        size: segmentSize,
    } = useSegment()

    const active =
        selectionType === 'single'
            ? valueContext === valueProp
            : (valueContext as unknown as string[]).includes(
                  valueProp as string,
              )

    const buttonSize = size || segmentSize

    const getSegmentSize = useCallback(() => {
        let sizeClass = ''
        switch (buttonSize) {
            case SIZES.LG:
                sizeClass = classNames(SEGMENT_SIZES.lg.h, 'md:px-6')
                break
            case SIZES.SM:
                sizeClass = classNames(SEGMENT_SIZES.sm.h, 'text-sm')
                break
            default:
                sizeClass = classNames(SEGMENT_SIZES.md.h, '')
                break
        }
        return sizeClass
    }, [buttonSize])

    const onSegmentItemClick = () => {
        if (!disabled) {
            if (!active) {
                if (selectionType === 'single') {
                    onActive?.(valueProp as string)
                }
                if (selectionType === 'multiple') {
                    const nextValue = [
                        ...(valueContext as unknown as string[]),
                        ...[valueProp],
                    ] as string[]
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onActive?.(nextValue as any)
                }
            } else if (selectionType === 'multiple') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onDeactivate?.(valueProp as any)
            }
        }
    }

    return typeof children === 'function' ? (
        unwrapArray(children)({
            active,
            onSegmentItemClick,
            disabled,
            value: valueProp,
            ...rest,
        })
    ) : (
        <button
            ref={ref}
            className={classNames(
                'segment-item',
                getSegmentSize(),
                active && 'segment-item-active',
                selectionType === 'multiple' &&
                    'segment-item-multiple-selectable',
                disabled && 'segment-item-disabled',
                className,
            )}
            data-state={active ? 'on' : 'off'}
            onClick={onSegmentItemClick}
            disabled={disabled}
            {...rest}
        >
            {children}
        </button>
    )
}

export default SegmentItem
