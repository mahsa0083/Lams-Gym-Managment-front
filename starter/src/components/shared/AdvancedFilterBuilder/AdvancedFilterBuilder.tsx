import { useEffect, useCallback, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import RuleComponent from './RuleComponent'
import {
    createEmptyGroup,
    createEmptyRule,
    DEFAULT_FIELDS,
    logicalOperatorOptions,
} from './utils'
import { FieldConfig, FilterTree, Rule, RuleGroup } from './types'
import { toQueryString } from './utils'
import { LuPlus } from 'react-icons/lu'
import classNames from '@/utils/classNames'

interface AdvancedFilterBuilderProps {
    fields?: FieldConfig[]
    value?: FilterTree
    onChange?: (tree: FilterTree, queryString: string) => void
    onApply?: (tree: FilterTree, queryString: string) => void
    onReset?: (tree: FilterTree, queryString: string) => void
}

const AdvancedFilterBuilder: React.FC<AdvancedFilterBuilderProps> = ({
    fields = DEFAULT_FIELDS,
    value,
    onChange,
    onApply,
    onReset,
}) => {
    const [filterTree, setFilterTree] = useState<FilterTree>(
        () => value || createEmptyGroup(true),
    )

    useEffect(() => {
        if (value) {
            setFilterTree(value)
        }
    }, [value])

    const fieldMap = useMemo(
        () =>
            fields.reduce(
                (acc, field) => ({ ...acc, [field.key]: field }),
                {} as Record<string, FieldConfig>,
            ),
        [fields],
    )

    const updateFilterTree = useCallback(
        (newTree: FilterTree) => {
            setFilterTree(newTree)
            if (onChange) {
                onChange(newTree, toQueryString(newTree))
            }
        },
        [onChange],
    )

    const handleApply = useCallback(() => {
        const queryString = toQueryString(filterTree)
        if (onApply) {
            onApply(filterTree, queryString)
        }
    }, [filterTree, onApply])

    const handleReset = () => {
        const resetTree = createEmptyGroup(true)
        setFilterTree(resetTree)
        const queryString = toQueryString(resetTree)
        if (onChange) {
            onChange(resetTree, queryString)
        }
        if (onReset) {
            onReset(resetTree, queryString)
        }
    }

    const updateNode = useCallback(
        (nodeId: string, updates: Partial<Rule | RuleGroup>) => {
            const updateNodeRecursive = (
                node: Rule | RuleGroup,
            ): Rule | RuleGroup => {
                if (node.id === nodeId) {
                    return { ...node, ...updates } as Rule | RuleGroup
                }
                if (node.type === 'group') {
                    return {
                        ...node,
                        children: node.children.map(updateNodeRecursive),
                    }
                }
                return node
            }

            updateFilterTree(updateNodeRecursive(filterTree) as FilterTree)
        },
        [filterTree, updateFilterTree],
    )

    const removeNode = useCallback(
        (nodeId: string) => {
            const removeNodeRecursive = (node: RuleGroup): RuleGroup => {
                return {
                    ...node,
                    children: node.children
                        .filter((child) => child.id !== nodeId)
                        .map((child) =>
                            child.type === 'group'
                                ? removeNodeRecursive(child)
                                : child,
                        ),
                }
            }

            updateFilterTree(removeNodeRecursive(filterTree))
        },
        [filterTree, updateFilterTree],
    )

    const addRule = useCallback(
        (parentId: string) => {
            const addRuleRecursive = (node: RuleGroup): RuleGroup => {
                if (node.id === parentId) {
                    return {
                        ...node,
                        children: [...node.children, createEmptyRule()],
                    }
                }
                return {
                    ...node,
                    children: node.children.map((child) =>
                        child.type === 'group'
                            ? addRuleRecursive(child)
                            : child,
                    ),
                }
            }

            updateFilterTree(addRuleRecursive(filterTree))
        },
        [filterTree, updateFilterTree],
    )

    const addGroup = useCallback(
        (parentId: string) => {
            const addGroupRecursive = (node: RuleGroup): RuleGroup => {
                if (node.id === parentId) {
                    return {
                        ...node,
                        children: [...node.children, createEmptyGroup()],
                    }
                }
                return {
                    ...node,
                    children: node.children.map((child) =>
                        child.type === 'group'
                            ? addGroupRecursive(child)
                            : child,
                    ),
                }
            }

            updateFilterTree(addGroupRecursive(filterTree))
        },
        [filterTree, updateFilterTree],
    )

    const renderGroup = (group: RuleGroup, isFirst: boolean = false) => {
        return (
            <div
                key={group.id}
                className={classNames(
                    'p-4',
                    !isFirst && 'border border-gray-200 rounded-lg',
                )}
            >
                <div className="space-y-2">
                    {group.children.map((child, index) => {
                        if (child.type === 'rule') {
                            const canDelete = group.children.length > 1
                            return (
                                <RuleComponent
                                    key={child.id}
                                    rule={child}
                                    isFirst={index === 0}
                                    canDelete={canDelete}
                                    fields={fields}
                                    fieldMap={fieldMap}
                                    onUpdate={updateNode}
                                    onRemove={removeNode}
                                    parentId={group.id}
                                />
                            )
                        } else {
                            return (
                                <div
                                    className="flex items-center gap-2"
                                    key={child.id}
                                >
                                    <span>
                                        <Select
                                            options={logicalOperatorOptions}
                                            className="w-[90px]"
                                            value={
                                                logicalOperatorOptions.find(
                                                    (op) =>
                                                        op.value ===
                                                        child.logicalOperator,
                                                ) || logicalOperatorOptions[0]
                                            }
                                            onChange={(option) =>
                                                updateNode(child.id, {
                                                    logicalOperator:
                                                        option?.value,
                                                })
                                            }
                                        />
                                    </span>
                                    {renderGroup(child, false)}
                                </div>
                            )
                        }
                    })}
                </div>

                <div className="flex justify-between gap-2 mt-4">
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => addRule(group.id)}
                            icon={<LuPlus />}
                        >
                            Add Rule
                        </Button>

                        <Button
                            onClick={() => addGroup(group.id)}
                            icon={<LuPlus />}
                            variant="ghost"
                        >
                            Add Group
                        </Button>
                    </div>
                    {!isFirst && (
                        <Button
                            onClick={() => removeNode(group.id)}
                            className="text-error"
                            variant="ghost"
                            title="Remove group"
                        >
                            Remove Group
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            {renderGroup(filterTree, true)}
            <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
                <Button onClick={handleReset} variant="subtle">
                    Reset
                </Button>
                <Button onClick={handleApply} variant="solid">
                    Apply Filter
                </Button>
            </div>
        </div>
    )
}

export default AdvancedFilterBuilder
