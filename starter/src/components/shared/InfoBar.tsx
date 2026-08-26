import classNames from '@/utils/classNames'

type Level = 'low' | 'medium' | 'high'

interface InfoBarProps {
    level: Level
    className?: string
    height?: number
}

const levelMap = {
    low: 1,
    medium: 2,
    high: 3,
}

const barLevelColors: Record<number, string> = {
    1: 'bg-error',
    2: 'bg-warning',
    3: 'bg-success',
}

const InfoBar = ({ level, className, height = 15 }: InfoBarProps) => {
    const currentLevel = levelMap[level]

    return (
        <div
            className={classNames('flex items-end gap-0.5', className)}
            style={{ height }}
        >
            {[1, 2, 3].map((bar) => (
                <div
                    key={bar}
                    className={classNames(
                        'w-1 rounded transition-all duration-200',
                        bar === 1
                            ? 'h-[35%]'
                            : bar === 2
                              ? 'h-[65%]'
                              : 'h-[100%]',
                        currentLevel >= bar
                            ? barLevelColors[currentLevel]
                            : 'bg-gray-300 dark:bg-gray-600',
                    )}
                />
            ))}
        </div>
    )
}

export default InfoBar
