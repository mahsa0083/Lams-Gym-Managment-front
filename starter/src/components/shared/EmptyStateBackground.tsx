import RingWave from '@/components/svg/RingWave'
import Dots from '@/components/svg/Dots'
import LinearGrid from '@/components/svg/LinearGrid'
import classNames from '@/utils/classNames'
import type { ComponentProps } from 'react'

type EmptyStateBackgroundProps = {
    variant?: 'wave' | 'grid' | 'dots'
    size?: number
} & ComponentProps<'div'>

const EmptyStateBackground = ({
    variant = 'wave',
    size = 300,
    style = {},
    className,
    children,
}: EmptyStateBackgroundProps) => {
    return (
        <div
            style={{ height: size, width: size, ...style }}
            className={classNames(
                'flex flex-col items-center justify-center relative',
                className,
            )}
        >
            <span className="absolute top-0 left-0">
                {variant === 'wave' && <RingWave width={size} height={size} />}
                {variant === 'dots' && <Dots width={size} height={size} />}
                {variant === 'grid' && (
                    <LinearGrid width={size} height={size} />
                )}
            </span>
            {children}
        </div>
    )
}

export default EmptyStateBackground
