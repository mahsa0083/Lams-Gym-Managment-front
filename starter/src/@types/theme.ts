export type Direction = 'ltr' | 'rtl'
export type Mode = 'light' | 'dark' | 'system'
export type ControlSize = 'lg' | 'md' | 'sm'
export type LayoutType =
    | 'blank'
    | 'insetShell'
    | 'stackedSide'
    | 'topBarClassic'
    | 'seamLessSide'
    | 'duoTierHeader'

export type Theme = {
    themeSchema: string
    direction: Direction
    mode: Mode
    panelExpand: boolean
    controlSize: ControlSize
    layout: {
        type: LayoutType
        sideNavCollapse: boolean
        previousType?: LayoutType | ''
    }
}
