import { Task, BarTask, TaskTypeInternal, BarMoveAction } from '../types'

export type BarLayoutConfig = {
    dates: Date[]
    columnWidth: number
    rowHeight: number
    taskHeight: number
    barCornerRadius: number
    handleWidth: number
    rtl: boolean
}

export type BarStyleConfig = {
    barProgressClass: string
    barWrapperClass: string
    projectProgressClass: string
    projectWrapperClass: string
    milestoneClass: string
}

export const createDefaultStyleConfig = (): BarStyleConfig => ({
    barProgressClass: 'fill-[#a3a3ff]',
    barWrapperClass: 'fill-[#b7b7b7]',
    projectProgressClass: 'fill-[#7db59a]',
    projectWrapperClass: 'fill-[#fac465]',
    milestoneClass: 'fill-[#f1c232]',
})

export const convertToBarTasks = <T>(
    tasks: Task<T>[],
    layoutConfig: BarLayoutConfig,
    styleConfig: BarStyleConfig,
) => {
    let barTasks = tasks.map((t, i) => {
        return convertToBarTask(t, i, layoutConfig, styleConfig)
    })

    // set dependencies
    barTasks = barTasks.map((task) => {
        const dependencies = task.dependencies || []
        for (let j = 0; j < dependencies.length; j++) {
            const dependence = barTasks.findIndex(
                (value) => value.id === dependencies[j],
            )
            if (dependence !== -1) barTasks[dependence].barChildren.push(task)
        }
        return task
    })

    return barTasks
}

const convertToBarTask = <T>(
    task: Task<T>,
    index: number,
    layoutConfig: BarLayoutConfig,
    styleConfig: BarStyleConfig,
): BarTask<T> => {
    let barTask: BarTask<T>
    switch (task.type) {
        case 'milestone':
            barTask = convertToMilestone(
                task,
                index,
                layoutConfig,
                styleConfig.milestoneClass,
            )
            break
        case 'project':
            barTask = convertToBar(
                task,
                index,
                layoutConfig,
                styleConfig.projectProgressClass,
                styleConfig.projectWrapperClass,
            )
            break
        default:
            barTask = convertToBar(
                task,
                index,
                layoutConfig,
                styleConfig.barProgressClass,
                styleConfig.barWrapperClass,
            )
            break
    }
    return barTask
}

const convertToBar = <T>(
    task: Task,
    index: number,
    layoutConfig: BarLayoutConfig,
    progressColor: string,
    backgroundColor: string,
): BarTask<T> => {
    const {
        dates,
        columnWidth,
        rowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
    } = layoutConfig

    let x1: number
    let x2: number
    if (rtl) {
        x2 = taskXCoordinateRTL(task.start, dates, columnWidth)
        x1 = taskXCoordinateRTL(task.end, dates, columnWidth)
    } else {
        x1 = taskXCoordinate(task.start, dates, columnWidth)
        x2 = taskXCoordinate(task.end, dates, columnWidth)
    }
    const typeInternal: TaskTypeInternal = task.type
    if (typeInternal === 'task' && x2 - x1 < handleWidth * 2) {
        x2 = x1 + handleWidth * 2
    }

    const [progressWidth, progressX] = progressWithByParams(
        x1,
        x2,
        task.progress,
        rtl,
    )
    const y = taskYCoordinate(index, rowHeight, taskHeight)
    const hideChildren = task.type === 'project' ? task.hideChildren : undefined

    const styles = {
        wrapperClass: backgroundColor,
        progressClass: progressColor,
        ...task.styles,
    }
    return {
        ...task,
        typeInternal,
        x1,
        x2,
        y,
        index,
        progressX,
        progressWidth,
        barCornerRadius,
        handleWidth,
        hideChildren,
        height: taskHeight,
        barChildren: [],
        styles,
    } as BarTask<T>
}

const convertToMilestone = <T>(
    task: Task,
    index: number,
    layoutConfig: BarLayoutConfig,
    backgroundColor: string,
): BarTask<T> => {
    const {
        dates,
        columnWidth,
        rowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
    } = layoutConfig

    const x = taskXCoordinate(task.start, dates, columnWidth)
    const y = taskYCoordinate(index, rowHeight, taskHeight)

    const x1 = x - taskHeight * 0.5
    const x2 = x + taskHeight * 0.5

    const rotatedHeight = taskHeight / 1.414
    const styles = {
        wrapperClass: backgroundColor,
        progressClass: '',
        ...task.styles,
    }
    return {
        ...task,
        end: task.start,
        x1,
        x2,
        y,
        index,
        progressX: 0,
        progressWidth: 0,
        barCornerRadius,
        handleWidth,
        typeInternal: task.type,
        progress: 0,
        height: rotatedHeight,
        hideChildren: undefined,
        barChildren: [],
        styles,
    } as BarTask<T>
}

const taskXCoordinate = (xDate: Date, dates: Date[], columnWidth: number) => {
    const index = dates.findIndex((d) => d.getTime() >= xDate.getTime()) - 1

    if (index < 0) {
        return 0
    }
    if (index >= dates.length - 1) {
        return (dates.length - 1) * columnWidth
    }

    const remainderMillis = xDate.getTime() - dates[index].getTime()
    const percentOfInterval =
        remainderMillis / (dates[index + 1].getTime() - dates[index].getTime())
    const x = index * columnWidth + percentOfInterval * columnWidth
    return x
}

const taskXCoordinateRTL = (
    xDate: Date,
    dates: Date[],
    columnWidth: number,
) => {
    const index = dates.findIndex((d) => d.getTime() <= xDate.getTime()) - 1

    if (index < 0) {
        return 0
    }
    if (index >= dates.length - 1) {
        return (dates.length - 1) * columnWidth
    }

    const remainderMillis = xDate.getTime() - dates[index].getTime()
    const percentOfInterval =
        remainderMillis / (dates[index + 1].getTime() - dates[index].getTime())
    const x = index * columnWidth + percentOfInterval * columnWidth
    return x
}
const taskYCoordinate = (
    index: number,
    rowHeight: number,
    taskHeight: number,
) => {
    const y = index * rowHeight + (rowHeight - taskHeight) / 2
    return y
}

export const progressWithByParams = (
    taskX1: number,
    taskX2: number,
    progress: number,
    rtl: boolean,
) => {
    const progressWidth = (taskX2 - taskX1) * progress * 0.01
    let progressX: number
    if (rtl) {
        progressX = taskX2 - progressWidth
    } else {
        progressX = taskX1
    }
    return [progressWidth, progressX]
}

export const progressByProgressWidth = <T>(
    progressWidth: number,
    barTask: BarTask<T>,
) => {
    const barWidth = barTask.x2 - barTask.x1
    const progressPercent = Math.round((progressWidth * 100) / barWidth)
    if (progressPercent >= 100) return 100
    else if (progressPercent <= 0) return 0
    else return progressPercent
}

const progressByX = <T>(x: number, task: BarTask<T>) => {
    if (x >= task.x2) return 100
    else if (x <= task.x1) return 0
    else {
        const barWidth = task.x2 - task.x1
        const progressPercent = Math.round(((x - task.x1) * 100) / barWidth)
        return progressPercent
    }
}
const progressByXRTL = <T>(x: number, task: BarTask<T>) => {
    if (x >= task.x2) return 0
    else if (x <= task.x1) return 100
    else {
        const barWidth = task.x2 - task.x1
        const progressPercent = Math.round(((task.x2 - x) * 100) / barWidth)
        return progressPercent
    }
}

export const getProgressPoint = (
    progressX: number,
    taskY: number,
    taskHeight: number,
) => {
    const point = [
        progressX - 5,
        taskY + taskHeight,
        progressX + 5,
        taskY + taskHeight,
        progressX,
        taskY + taskHeight - 8.66,
    ]
    return point.join(',')
}

const startByX = <T>(x: number, xStep: number, task: BarTask<T>) => {
    if (x >= task.x2 - task.handleWidth * 2) {
        x = task.x2 - task.handleWidth * 2
    }
    const steps = Math.round((x - task.x1) / xStep)
    const additionalXValue = steps * xStep
    const newX = task.x1 + additionalXValue
    return newX
}

const endByX = <T>(x: number, xStep: number, task: BarTask<T>) => {
    if (x <= task.x1 + task.handleWidth * 2) {
        x = task.x1 + task.handleWidth * 2
    }
    const steps = Math.round((x - task.x2) / xStep)
    const additionalXValue = steps * xStep
    const newX = task.x2 + additionalXValue
    return newX
}

const moveByX = <T>(x: number, xStep: number, task: BarTask<T>) => {
    const steps = Math.round((x - task.x1) / xStep)
    const additionalXValue = steps * xStep
    const newX1 = task.x1 + additionalXValue
    const newX2 = newX1 + task.x2 - task.x1
    return [newX1, newX2]
}

const dateByX = (
    x: number,
    taskX: number,
    taskDate: Date,
    xStep: number,
    timeStep: number,
) => {
    let newDate = new Date(
        ((x - taskX) / xStep) * timeStep + taskDate.getTime(),
    )
    newDate = new Date(
        newDate.getTime() +
            (newDate.getTimezoneOffset() - taskDate.getTimezoneOffset()) *
                60000,
    )
    return newDate
}

/**
 * Method handles event in real time(mousemove) and on finish(mouseup)
 */
export const handleTaskBySVGMouseEvent = <T>(
    svgX: number,
    action: BarMoveAction,
    selectedTask: BarTask<T>,
    xStep: number,
    timeStep: number,
    initEventX1Delta: number,
    rtl: boolean,
): { isChanged: boolean; changedTask: BarTask<T> } => {
    let result: { isChanged: boolean; changedTask: BarTask<T> }
    switch (selectedTask.type) {
        case 'milestone':
            result = handleTaskBySVGMouseEventForMilestone(
                svgX,
                action,
                selectedTask,
                xStep,
                timeStep,
                initEventX1Delta,
            )
            break
        default:
            result = handleTaskBySVGMouseEventForBar(
                svgX,
                action,
                selectedTask,
                xStep,
                timeStep,
                initEventX1Delta,
                rtl,
            )
            break
    }
    return result
}

const handleTaskBySVGMouseEventForBar = <T>(
    svgX: number,
    action: BarMoveAction,
    selectedTask: BarTask<T>,
    xStep: number,
    timeStep: number,
    initEventX1Delta: number,
    rtl: boolean,
): { isChanged: boolean; changedTask: BarTask<T> } => {
    const changedTask: BarTask<T> = { ...selectedTask }
    let isChanged = false
    switch (action) {
        case 'progress':
            if (rtl) {
                changedTask.progress = progressByXRTL(svgX, selectedTask)
            } else {
                changedTask.progress = progressByX(svgX, selectedTask)
            }
            isChanged = changedTask.progress !== selectedTask.progress
            if (isChanged) {
                const [progressWidth, progressX] = progressWithByParams(
                    changedTask.x1,
                    changedTask.x2,
                    changedTask.progress,
                    rtl,
                )
                changedTask.progressWidth = progressWidth
                changedTask.progressX = progressX
            }
            break
        case 'start': {
            const newX1 = startByX(svgX, xStep, selectedTask)
            changedTask.x1 = newX1
            isChanged = changedTask.x1 !== selectedTask.x1
            if (isChanged) {
                if (rtl) {
                    changedTask.end = dateByX(
                        newX1,
                        selectedTask.x1,
                        selectedTask.end,
                        xStep,
                        timeStep,
                    )
                } else {
                    changedTask.start = dateByX(
                        newX1,
                        selectedTask.x1,
                        selectedTask.start,
                        xStep,
                        timeStep,
                    )
                }
                const [progressWidth, progressX] = progressWithByParams(
                    changedTask.x1,
                    changedTask.x2,
                    changedTask.progress,
                    rtl,
                )
                changedTask.progressWidth = progressWidth
                changedTask.progressX = progressX
            }
            break
        }
        case 'end': {
            const newX2 = endByX(svgX, xStep, selectedTask)
            changedTask.x2 = newX2
            isChanged = changedTask.x2 !== selectedTask.x2
            if (isChanged) {
                if (rtl) {
                    changedTask.start = dateByX(
                        newX2,
                        selectedTask.x2,
                        selectedTask.start,
                        xStep,
                        timeStep,
                    )
                } else {
                    changedTask.end = dateByX(
                        newX2,
                        selectedTask.x2,
                        selectedTask.end,
                        xStep,
                        timeStep,
                    )
                }
                const [progressWidth, progressX] = progressWithByParams(
                    changedTask.x1,
                    changedTask.x2,
                    changedTask.progress,
                    rtl,
                )
                changedTask.progressWidth = progressWidth
                changedTask.progressX = progressX
            }
            break
        }
        case 'move': {
            const [newMoveX1, newMoveX2] = moveByX(
                svgX - initEventX1Delta,
                xStep,
                selectedTask,
            )
            isChanged = newMoveX1 !== selectedTask.x1
            if (isChanged) {
                changedTask.start = dateByX(
                    newMoveX1,
                    selectedTask.x1,
                    selectedTask.start,
                    xStep,
                    timeStep,
                )
                changedTask.end = dateByX(
                    newMoveX2,
                    selectedTask.x2,
                    selectedTask.end,
                    xStep,
                    timeStep,
                )
                changedTask.x1 = newMoveX1
                changedTask.x2 = newMoveX2
                const [progressWidth, progressX] = progressWithByParams(
                    changedTask.x1,
                    changedTask.x2,
                    changedTask.progress,
                    rtl,
                )
                changedTask.progressWidth = progressWidth
                changedTask.progressX = progressX
            }
            break
        }
    }
    return { isChanged, changedTask }
}

const handleTaskBySVGMouseEventForMilestone = <T>(
    svgX: number,
    action: BarMoveAction,
    selectedTask: BarTask<T>,
    xStep: number,
    timeStep: number,
    initEventX1Delta: number,
): { isChanged: boolean; changedTask: BarTask<T> } => {
    const changedTask: BarTask<T> = { ...selectedTask }
    let isChanged = false
    switch (action) {
        case 'move': {
            const [newMoveX1, newMoveX2] = moveByX(
                svgX - initEventX1Delta,
                xStep,
                selectedTask,
            )
            isChanged = newMoveX1 !== selectedTask.x1
            if (isChanged) {
                changedTask.start = dateByX(
                    newMoveX1,
                    selectedTask.x1,
                    selectedTask.start,
                    xStep,
                    timeStep,
                )
                changedTask.end = changedTask.start
                changedTask.x1 = newMoveX1
                changedTask.x2 = newMoveX2
            }
            break
        }
    }
    return { isChanged, changedTask }
}
