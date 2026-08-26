import RingWave from '@/components/svg/RingWave'
import Dots from '@/components/svg/Dots'
import LinearGrid from '@/components/svg/LinearGrid'
import classNames from '@/utils/classNames'
import type { ComponentProps } from 'react'

type BackgroundProps = {
    variant?: 'wave' | 'grid' | 'dots'
    size?: number
} & ComponentProps<'div'>

type EmptyStateProps = BackgroundProps & {
    illustration?: React.ReactNode
    offset?: number
}

const Background = ({
    variant = 'wave',
    size = 300,
    style = {},
    className,
    children,
}: BackgroundProps) => {
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

const EmptyState = ({
    children,
    illustration,
    size,
    offset = 0,
    variant,
}: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center">
            <Background variant={variant} size={size}>
                <div className="z-1">{illustration}</div>
            </Background>
            <div className="z-1" style={{ marginTop: offset }}>
                {children}
            </div>
        </div>
    )
}

export default EmptyState
