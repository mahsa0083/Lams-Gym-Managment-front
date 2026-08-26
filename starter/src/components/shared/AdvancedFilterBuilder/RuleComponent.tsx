import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import InputField from './InputField'
import { OPERATORS, logicalOperatorOptions } from './utils'
import { LuTrash2 } from 'react-icons/lu'
import type { Rule, RuleGroup, FieldConfig } from './types'
import classNames from '@/utils/classNames'

type RuleComponentProps = {
    rule: Rule
    isFirst: boolean
    canDelete?: boolean
    fieldMap: Record<string, FieldConfig>
    fields: FieldConfig[]
    parentId?: string
    onUpdate: (nodeId: string, updates: Partial<Rule | RuleGroup>) => void
    onRemove: (nodeId: string) => void
}

const RuleComponent = ({
    rule,
    fieldMap,
    fields,
    isFirst,
    canDelete,
    onUpdate,
    onRemove,
}: RuleComponentProps) => {
    const field = fieldMap[rule.field]
    const operators = field ? OPERATORS[field.type] || [] : []
    const fieldOptions = fields.map((field) => ({
        value: field.key,
        label: field.label,
    }))
    const prefixWidth = 'w-[90px]'

    return (
        <div key={rule.id} className="flex items-center gap-2">
            {isFirst ? (
                <span
                    className={classNames(
                        prefixWidth,
                        'flex justify-center items-center font-medium',
                    )}
                >
                    Where
                </span>
            ) : (
                <Select
                    options={logicalOperatorOptions}
                    value={
                        logicalOperatorOptions.find(
                            (op) => op.value === rule.logicalOperator,
                        ) || logicalOperatorOptions[0]
                    }
                    className={classNames(prefixWidth)}
                    onChange={(option) => {
                        onUpdate(rule.id, {
                            logicalOperator: option?.value as
                                | 'AND'
                                | 'OR'
                                | 'NOT',
                        })
                    }}
                />
            )}
            <Select
                options={fieldOptions}
                value={fieldOptions.find((field) => field.value === rule.field)}
                placeholder="Select field..."
                className="min-w-[150px]"
                onChange={(option) => {
                    const newField = fieldMap[option?.value as string]
                    const newOperator = newField
                        ? OPERATORS[newField.type][0].value
                        : ''
                    onUpdate(rule.id, {
                        field: option?.value as string,
                        operator: newOperator,
                        value: '',
                    })
                }}
            />

            <Select
                options={operators}
                value={operators.find((op) => op.value === rule.operator)}
                placeholder="Select operator..."
                className="w-[150px]"
                onChange={(option) => {
                    onUpdate(rule.id, {
                        operator: option.value,
                    })
                }}
            />

            <InputField rule={rule} fieldMap={fieldMap} onUpdate={onUpdate} />

            <Button
                onClick={() => onRemove(rule.id)}
                icon={<LuTrash2 className="text-sm" />}
                disabled={!canDelete}
                variant="ghost"
                title="Remove rule"
            />
        </div>
    )
}

export default RuleComponent
