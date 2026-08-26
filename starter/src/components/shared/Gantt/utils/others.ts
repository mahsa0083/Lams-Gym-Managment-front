import { BarTask, Task } from '../types'
import type { MouseEvent, KeyboardEvent, FocusEvent } from 'react'

export function isKeyboardEvent(
    event: MouseEvent | KeyboardEvent | FocusEvent,
): event is KeyboardEvent {
    return (event as KeyboardEvent).key !== undefined
}

export function isMouseEvent(
    event: MouseEvent | KeyboardEvent | FocusEvent,
): event is MouseEvent {
    return (event as MouseEvent).clientX !== undefined
}

export function isBarTask(task: Task | BarTask): task is BarTask {
    return (task as BarTask).x1 !== undefined
}

export function removeHiddenTasks<T = object>(tasks: Task<T>[]): Task<T>[] {
    const groupedTasks = tasks.filter(
        (t) => t.hideChildren && t.type === 'project',
    )
    if (groupedTasks.length > 0) {
        for (let i = 0; groupedTasks.length > i; i++) {
            const groupedTask = groupedTasks[i]
            const children = getChildren(tasks, groupedTask)
            tasks = tasks.filter((t) => children.indexOf(t) === -1)
        }
    }
    return tasks
}

function getChildren<T = object>(
    taskList: Task<T>[],
    task: Task<T>,
): Task<T>[] {
    let tasks: Task<T>[] = []
    if (task.type !== 'project') {
        tasks = taskList.filter(
            (t) => t.dependencies && t.dependencies.indexOf(task.id) !== -1,
        )
    } else {
        tasks = taskList.filter((t) => t.project && t.project === task.id)
    }
    const taskChildren: Task<T>[] = []
    tasks.forEach((t) => {
        taskChildren.push(...getChildren(taskList, t))
    })
    tasks = tasks.concat(tasks, taskChildren)
    return tasks
}

export const sortTasks = <T = object>(taskA: Task<T>, taskB: Task<T>) => {
    const orderA = taskA.displayOrder || Number.MAX_VALUE
    const orderB = taskB.displayOrder || Number.MAX_VALUE
    if (orderA > orderB) {
        return 1
    } else if (orderA < orderB) {
        return -1
    } else {
        return 0
    }
}
