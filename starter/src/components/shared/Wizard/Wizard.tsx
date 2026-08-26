import React, {
    createContext,
    useContext,
    ReactNode,
    Children,
    isValidElement,
    useState,
    useEffect,
} from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { LuCheck } from 'react-icons/lu'
import classNames from '@/utils/classNames'

interface WizardContextValue {
    current: number
    vertical: boolean
    onChange?: (index: number) => void
    totalSteps: number
    animationsEnabled: boolean
}

export interface WizardProps {
    current: number
    vertical?: boolean
    onChange?: (index: number) => void
    children: ReactNode
    className?: string
}

export interface WizardStepProps {
    title: string | ReactNode
    children: ReactNode
    customIcon?: ReactNode | string
    className?: string
    disabled?: boolean
}

const WizardContext = createContext<WizardContextValue | null>(null)

const useWizardContext = () => {
    const context = useContext(WizardContext)
    if (!context) {
        throw new Error('Wizard components must be used within a Wizard')
    }
    return context
}

const StepIndicator: React.FC<{
    index: number
    title: string | ReactNode
    customIcon?: ReactNode | string
    isActive: boolean
    isCompleted: boolean
    isDisabled: boolean
    onClick: () => void
}> = ({
    index,
    title,
    customIcon,
    isActive,
    isCompleted,
    isDisabled,
    onClick,
}) => {
    const renderIcon = () => {
        if (isCompleted) {
            return <LuCheck className="text-lg text-white" />
        }

        if (customIcon) {
            if (typeof customIcon === 'string') {
                return <span className="font-medium">{customIcon}</span>
            }
            return customIcon
        }

        return <span className="font-medium">{index + 1}</span>
    }

    const indicatorClasses = classNames(
        'flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 flex-shrink-0',
        {
            'bg-primary border-primary text-white shadow-lg':
                isActive || isCompleted,
            'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600':
                !isActive && !isCompleted && !isDisabled,
            'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed':
                isDisabled,
            'cursor-pointer transform hover:scale-105': !isDisabled,
        },
    )

    const titleClasses = classNames('transition-all duration-300', {
        'heading-text': isCompleted && !isDisabled,
        '': !isActive && !isCompleted && !isDisabled,
        'opacity-50': isDisabled,
    })

    const handleClick = () => {
        if (!isDisabled) {
            onClick()
        }
    }

    return (
        <div
            className={classNames('flex items-center gap-3 min-w-0', {
                'cursor-pointer': !isDisabled,
                'cursor-not-allowed': isDisabled,
            })}
            onClick={handleClick}
        >
            <div className={indicatorClasses}>{renderIcon()}</div>
            {typeof title === 'string' ? (
                <h6 className={titleClasses}>{title}</h6>
            ) : (
                title
            )}
        </div>
    )
}

const VerticalStepItem: React.FC<{
    index: number
    title: string | ReactNode
    customIcon?: ReactNode | string
    isActive: boolean
    isCompleted: boolean
    isLast: boolean
    isDisabled: boolean
    onClick: () => void
    children?: ReactNode
}> = ({
    index,
    title,
    customIcon,
    isActive,
    isCompleted,
    isLast,
    isDisabled,
    onClick,
    children,
}) => {
    const { animationsEnabled } = useWizardContext()
    const renderIcon = () => {
        if (isCompleted) {
            return <LuCheck className="text-lg text-white" />
        }

        if (customIcon) {
            if (typeof customIcon === 'string') {
                return <span className="font-medium">{customIcon}</span>
            }
            return customIcon
        }

        return <span className="font-medium">{index + 1}</span>
    }

    const indicatorClasses = classNames(
        'flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 flex-shrink-0 relative bg-white dark:bg-gray-800',
        {
            'border-primary bg-primary text-white shadow-lg':
                (isActive || isCompleted) && !isDisabled,
            'border-gray-300 dark:border-gray-600':
                !isActive && !isCompleted && !isDisabled,
            'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed':
                isDisabled,
            'cursor-pointer': !isDisabled,
        },
    )

    const titleClasses = classNames('transition-colors duration-300', {
        'heading-text': isCompleted && !isDisabled,
        '': !isActive && !isCompleted && !isDisabled,
        'opacity-50': isDisabled,
        'cursor-pointer': !isDisabled,
        'cursor-not-allowed': isDisabled,
    })

    const contentVariants = {
        hidden: {
            height: 0,
            opacity: 0,
            y: -10,
        },
        visible: {
            height: 'auto',
            opacity: 1,
            y: 0,
        },
        exit: {
            height: 0,
            opacity: 0,
            y: -10,
        },
    }

    return (
        <div className="relative pb-4">
            {!isLast && (
                <div
                    className={classNames(
                        'absolute ltr:left-2.75 rtl:right-2.75 top-7 bottom-1 w-0.5 z-0 transition-colors duration-500 ease-out',
                        {
                            'bg-primary': isCompleted,
                            'bg-gray-200 dark:bg-gray-700': !isCompleted,
                        },
                    )}
                />
            )}

            {/* Step Header */}
            <div className="flex items-start gap-3 relative">
                <div
                    className={indicatorClasses}
                    onClick={!isDisabled ? onClick : undefined}
                >
                    {renderIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    {typeof title === 'string' ? (
                        <h6
                            className={titleClasses}
                            onClick={!isDisabled ? onClick : undefined}
                        >
                            {title}
                        </h6>
                    ) : (
                        <span
                            onClick={!isDisabled ? onClick : undefined}
                            role="button"
                        >
                            {title}
                        </span>
                    )}

                    {/* Step Content */}
                    <AnimatePresence>
                        {isActive && children && (
                            <motion.div
                                key={`content-${index}`}
                                variants={contentVariants}
                                initial={
                                    !animationsEnabled ? 'visible' : 'hidden'
                                }
                                animate="visible"
                                exit="exit"
                                transition={
                                    !animationsEnabled
                                        ? { duration: 0 }
                                        : {
                                              duration: 0.4,
                                              ease: [0.4, 0, 0.2, 1],
                                          }
                                }
                                className="mt-4"
                            >
                                <motion.div
                                    initial={
                                        !animationsEnabled
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: 10 }
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={
                                        !animationsEnabled
                                            ? { duration: 0 }
                                            : { duration: 0.3, delay: 0.1 }
                                    }
                                >
                                    {children}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

const StepConnector: React.FC<{ isCompleted: boolean }> = ({ isCompleted }) => {
    return (
        <div
            className={classNames(
                'flex-1 h-0.5 transition-colors duration-500 ease-out',
                {
                    'bg-primary': isCompleted,
                    'bg-gray-300 dark:bg-gray-600': !isCompleted,
                },
            )}
        />
    )
}

const WizardStep: React.FC<WizardStepProps> = () => {
    return null
}

const Wizard: React.FC<WizardProps> & { Step: typeof WizardStep } = ({
    current,
    vertical = false,
    onChange,
    children,
    className,
}) => {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true)
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    // Extract step information from children
    const steps = Children.toArray(children).filter(
        (child) => isValidElement(child) && child.type === WizardStep,
    )

    const totalSteps = steps.length

    const contextValue: WizardContextValue = {
        current,
        vertical,
        onChange,
        totalSteps,
        animationsEnabled: isMounted,
    }

    const handleStepClick = (index: number) => {
        if (index >= 0 && index < totalSteps) {
            const step = steps[index]
            if (isValidElement(step)) {
                const stepProps = step.props as WizardStepProps
                if (!stepProps.disabled) {
                    onChange?.(index)
                }
            }
        }
    }

    const renderHorizontalStepIndicators = () => {
        return steps.map((step, index) => {
            if (!isValidElement(step)) return null

            const stepProps = step.props as WizardStepProps
            const isActive = index === current
            const isCompleted = index < current
            const isDisabled = stepProps.disabled || false

            return (
                <React.Fragment key={index}>
                    <StepIndicator
                        index={index}
                        title={stepProps.title}
                        customIcon={stepProps.customIcon}
                        isActive={isActive}
                        isCompleted={isCompleted}
                        isDisabled={isDisabled}
                        onClick={() => handleStepClick(index)}
                    />
                    {index < steps.length - 1 && (
                        <StepConnector isCompleted={isCompleted} />
                    )}
                </React.Fragment>
            )
        })
    }

    const renderVerticalSteps = () => {
        return steps.map((step, index) => {
            if (!isValidElement(step)) return null

            const stepProps = step.props as WizardStepProps
            const isActive = index === current
            const isCompleted = index < current
            const isLast = index === steps.length - 1
            const isDisabled = stepProps.disabled || false

            return (
                <VerticalStepItem
                    key={index}
                    index={index}
                    title={stepProps.title}
                    customIcon={stepProps.customIcon}
                    isActive={isActive}
                    isCompleted={isCompleted}
                    isLast={isLast}
                    isDisabled={isDisabled}
                    onClick={() => handleStepClick(index)}
                >
                    {stepProps.children}
                </VerticalStepItem>
            )
        })
    }

    const renderHorizontalStepContent = () => {
        return (
            <div className="relative overflow-hidden mt-6">
                <motion.div
                    className="flex"
                    initial={{ x: `-${current * 100}%` }}
                    animate={{ x: `-${current * 100}%` }}
                    transition={
                        !isMounted
                            ? { duration: 0 }
                            : {
                                  duration: 0.5,
                                  ease: [0.4, 0, 0.2, 1], // Custom easing for smooth slider motion
                              }
                    }
                >
                    {steps.map((step, index) => {
                        if (!isValidElement(step)) return null

                        const stepProps = step.props as WizardStepProps
                        return (
                            <motion.div
                                key={index}
                                className="w-full flex-shrink-0"
                                initial={
                                    !isMounted
                                        ? {
                                              opacity:
                                                  index === current ? 1 : 0.3,
                                          }
                                        : { opacity: 0 }
                                }
                                animate={{
                                    opacity: index === current ? 1 : 0.3,
                                }}
                                transition={
                                    !isMounted
                                        ? { duration: 0 }
                                        : { duration: 0.3 }
                                }
                            >
                                <div className="px-4">{stepProps.children}</div>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        )
    }

    const wizardClasses = classNames('wizard-container', className)

    const indicatorsClasses = classNames('wizard-indicators', {
        'flex flex-col gap-4': vertical,
        'flex items-center justify-center gap-1 sm:gap-2 flex-wrap': !vertical,
    })

    if (vertical) {
        return (
            <WizardContext.Provider value={contextValue}>
                <div className={wizardClasses}>
                    <div className="space-y-0">{renderVerticalSteps()}</div>
                </div>
            </WizardContext.Provider>
        )
    }

    return (
        <WizardContext.Provider value={contextValue}>
            <div className={wizardClasses}>
                <div className={indicatorsClasses}>
                    {renderHorizontalStepIndicators()}
                </div>
                <div className="wizard-content">
                    {renderHorizontalStepContent()}
                </div>
            </div>
        </WizardContext.Provider>
    )
}

Wizard.Step = WizardStep

export default Wizard
