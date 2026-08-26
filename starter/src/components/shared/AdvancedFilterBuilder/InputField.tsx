import Select from '@/components/ui/Select'
import NumericInput from '@/components/shared/NumericInput'
import Input from '@/components/ui/Input'
import DatePicker from '@/components/ui/DatePicker'
import { booleanOptions } from './utils'
import dayjs from 'dayjs'
import type { Rule, RuleGroup, FieldConfig } from './types'

type InputFieldProps = {
    rule: Rule
    fieldMap: Record<string, FieldConfig>
    onUpdate: (nodeId: string, updates: Partial<Rule | RuleGroup>) => void
}

const InputField = ({ rule, fieldMap, onUpdate }: InputFieldProps) => {
    const field = fieldMap[rule.field]
    if (!field) return null

    const baseClassName = 'w-[150px]'

    switch (field.type) {
        case 'select':
            return (
                <Select
                    options={field.options || []}
                    value={field.options?.find((op) => op.value === rule.value)}
                    placeholder="Select..."
                    className={baseClassName}
                    onChange={(option) => {
                        onUpdate(rule.id, {
                            value: option.value,
                        })
                    }}
                />
            )

        case 'number':
            return (
                <NumericInput
                    value={(rule.value as number) || ''}
                    onValueChange={(value) =>
                        onUpdate(rule.id, {
                            value: value.formattedValue || 0,
                        })
                    }
                    className={baseClassName}
                    placeholder="Enter number"
                />
            )

        case 'date':
            return (
                <DatePicker
                    value={
                        rule.value ? dayjs(rule.value as string).toDate() : null
                    }
                    onChange={(date) =>
                        onUpdate(rule.id, { value: dayjs(date).toISOString() })
                    }
                    className={baseClassName}
                />
            )

        case 'boolean':
            return (
                <Select
                    options={booleanOptions}
                    value={field.options?.find((op) => op.value === rule.value)}
                    placeholder="Select..."
                    className={baseClassName}
                    onChange={(option) => {
                        onUpdate(rule.id, {
                            value: option.value,
                        })
                    }}
                />
            )

        default:
            return (
                <Input
                    type="text"
                    value={(rule.value as string) || ''}
                    onChange={(e) =>
                        onUpdate(rule.id, { value: e.target.value })
                    }
                    className={baseClassName}
                    placeholder="Enter value"
                />
            )
    }
}

export default InputField
