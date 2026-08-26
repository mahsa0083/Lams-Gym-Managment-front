export type FieldType = 'text' | 'number' | 'select' | 'date' | 'boolean'

export type FieldConfig = {
    key: string
    label: string
    type: FieldType
    options?: Array<{ value: string; label: string }>
}

export type Rule = {
    id: string
    type: 'rule'
    field: string
    operator: string
    value: string | number | boolean
    logicalOperator?: 'AND' | 'OR' | 'NOT'
}

export type RuleGroup = {
    id: string
    type: 'group'
    condition: 'AND' | 'OR'
    children: Array<Rule | RuleGroup>
    logicalOperator?: 'AND' | 'OR' | 'NOT'
}

export type FilterTree = RuleGroup
