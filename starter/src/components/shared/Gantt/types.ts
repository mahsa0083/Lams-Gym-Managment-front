import type { ReactNode } from 'react'

export type ViewMode =
    | 'Year'
    | 'QuarterYear'
    | 'Month'
    | 'Week'
    | 'Day'
    | 'HalfDay'
    | 'QuarterDay'
    | 'Hour'
    | 'Half Day'
export type TaskType = 'task' | 'milestone' | 'project'

export interface BaseTask {
    id: string
    type: TaskType
    name: string
    start: Date
    end: Date
    progress: number
    styles?: {
        progressClass?: string
        wrapperClass?: string
    }
    isDisabled?: boolean
    project?: string
    dependencies?: string[]
    hideChildren?: boolean
    displayOrder?: number
}

export type Task<T = object> = BaseTask & T

export interface HandlerEventOption<T> {
    timeStep?: number

    onSelect?: (task: Task<T>, isSelected: boolean) => void

    onDoubleClick?: (task: Task<T>) => void

    onClick?: (task: Task<T>) => void

    onDateChange?: (
        task: Task<T>,
        children: Task<T>[],
    ) => void | boolean | Promise<void> | Promise<boolean>

    onProgressChange?: (
        task: Task<T>,
        children: Array<Task<T>>,
    ) => void | boolean | Promise<void> | Promise<boolean>

    onDelete?: (
        task: Task<T>,
    ) => void | boolean | Promise<void> | Promise<boolean>

    onExpanderClick?: (task: Task<T>) => void
}

export type CustomBarContent<T = object> = (barTask: BarTask<T>) => ReactNode

export interface DisplayOption {
    viewMode?: ViewMode
    viewDate?: Date
    preStepsCount?: number
    locale?: string
    rtl?: boolean
}

export interface StylingOption {
    headerHeight?: number
    gridColumnsWidth?: number
    rowHeight?: number
    ganttHeight?: number
    barCornerRadius?: number
    handleWidth?: number
    barFill?: number
    barProgressClass?: string
    barWrapperClass?: string
    projectProgressClass?: string
    projectWrapperClass?: string
    milestoneClass?: string
    arrowClass?: string
    arrowIndent?: number
    todayColor?: string
    TooltipContent?: React.FC<{
        task: Task
    }>
    TaskListHeader?: React.FC<{
        headerHeight: number
        rowWidth: string
    }>
    TaskListTable?: React.FC<{
        rowHeight: number
        rowWidth: string
        locale: string
        tasks: Task[]
        selectedTaskId: string
        setSelectedTask: (taskId: string) => void
        onExpanderClick: (task: Task) => void
    }>
}

export type Columns<T> = {
    header: string | ReactNode
    cell: (task: Task<T> & { expander: ReactNode }) => string | ReactNode
    width?: string | number
}

export interface GanttProps<T = object>
    extends HandlerEventOption<T>, DisplayOption, StylingOption {
    tasks: Task<T>[]
    columns?: Columns<T>[] | null
    customBarContent?: CustomBarContent<T>
}

export type BarTask<T = object> = Task<T> & {
    index: number
    typeInternal: TaskTypeInternal
    x1: number
    x2: number
    y: number
    height: number
    progressX: number
    progressWidth: number
    barCornerRadius: number
    handleWidth: number
    barChildren: BarTask<T>[]
    styles: {
        wrapperClass: string
        progressClass: string
        indicatorColor?: string
    }
}

export type TaskTypeInternal = TaskType

export interface DateSetup {
    dates: Date[]
    viewMode: ViewMode
}

export type BarMoveAction = 'progress' | 'end' | 'start' | 'move'

export type GanttContentMoveAction =
    | 'mouseenter'
    | 'mouseleave'
    | 'delete'
    | 'dblclick'
    | 'click'
    | 'select'
    | ''
    | BarMoveAction

export type GanttEvent<T> = {
    changedTask?: BarTask<T>
    originalSelectedTask?: BarTask<T>
    action: GanttContentMoveAction
}
