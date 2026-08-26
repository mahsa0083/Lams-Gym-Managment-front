import type { Rule, RuleGroup, FieldConfig, FilterTree } from './types'

export const OPERATORS = {
    text: [
        { value: 'is', label: 'is' },
        { value: 'is_not', label: 'is not' },
        { value: 'contains', label: 'contains' },
        { value: 'not_contains', label: 'not contain' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' },
    ],
    number: [
        { value: 'is', label: 'is' },
        { value: 'is_not', label: 'is not' },
        { value: 'greater_than', label: 'greater' },
        { value: 'less_than', label: 'less' },
        { value: 'greater_equal', label: 'greater or equal' },
        { value: 'less_equal', label: 'less or equal' },
    ],
    select: [
        { value: 'is', label: 'is' },
        { value: 'is_not', label: 'is not' },
    ],
    date: [
        { value: 'is', label: 'is' },
        { value: 'is_not', label: 'is not' },
        { value: 'greater_than', label: 'after' },
        { value: 'less_than', label: 'before' },
        { value: 'greater_equal', label: 'on or after' },
        { value: 'less_equal', label: 'on or before' },
    ],
    boolean: [{ value: 'is', label: 'is' }],
}

export const DEFAULT_FIELDS: FieldConfig[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'pending', label: 'Pending' },
            { value: 'archived', label: 'Archived' },
        ],
    },
    { key: 'price', label: 'Price', type: 'number' },
    {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: [
            { value: 'books', label: 'Books' },
            { value: 'electronics', label: 'Electronics' },
            { value: 'clothing', label: 'Clothing' },
            { value: 'home', label: 'Home & Garden' },
        ],
    },
    { key: 'created_at', label: 'Created Date', type: 'date' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'is_featured', label: 'Featured', type: 'boolean' },
    { key: 'rating', label: 'Rating', type: 'number' },
]

const generateId = () =>
    Math.random().toString(36).substring(2) + Date.now().toString(36)

export const createEmptyRule = (isFirst = false): Rule => {
    return {
        id: generateId(),
        type: 'rule',
        field: DEFAULT_FIELDS[0].key,
        operator: OPERATORS[DEFAULT_FIELDS[0].type][0].value,
        value: '',
        logicalOperator: isFirst ? undefined : 'AND',
    }
}

export const createEmptyGroup = (isFirst = false): RuleGroup => ({
    id: generateId(),
    type: 'group',
    condition: 'AND',
    children: [createEmptyRule(true)],
    logicalOperator: isFirst ? undefined : 'AND',
})

export const toQueryString = (tree: FilterTree): string => {
    const formatNode = (node: Rule | RuleGroup, isFirst = false): string => {
        if (node.type === 'rule') {
            const field = node.field
            const operator = node.operator
            const value = node.value

            let ruleString
            switch (operator) {
                case 'is':
                    ruleString = `${field}=${value}`
                    break
                case 'is_not':
                    ruleString = `${field}!=${value}`
                    break
                case 'contains':
                    ruleString = `${field}~=${value}`
                    break
                case 'not_contains':
                    ruleString = `${field}!~=${value}`
                    break
                case 'starts_with':
                    ruleString = `${field}^=${value}`
                    break
                case 'ends_with':
                    ruleString = `${field}$=${value}`
                    break
                case 'greater_than':
                    ruleString = `${field}>${value}`
                    break
                case 'less_than':
                    ruleString = `${field}<${value}`
                    break
                case 'greater_equal':
                    ruleString = `${field}>=${value}`
                    break
                case 'less_equal':
                    ruleString = `${field}<=${value}`
                    break
                default:
                    ruleString = `${field}=${value}`
            }

            // Add NOT prefix if needed
            if (!isFirst && node.logicalOperator === 'NOT') {
                ruleString = `NOT ${ruleString}`
            }

            return ruleString
        } else {
            // For groups, we need to handle individual logical operators
            const childStrings = node.children.map((child, index) => {
                const childString = formatNode(child, index === 0)

                // For the first child, don't add logical operator prefix
                if (index === 0) {
                    return childString
                }

                // Use the child's logical operator, fallback to group's condition
                const logicalOp = child.logicalOperator || node.condition
                return `${logicalOp} ${childString}`
            })

            const joined = childStrings.join(' ')

            // Add parentheses for groups (except root group) or when there are multiple children
            const needsParentheses = !isFirst || node.children.length > 1
            let result = needsParentheses ? `(${joined})` : joined

            // Add NOT prefix if needed for the group
            if (!isFirst && node.logicalOperator === 'NOT') {
                result = `NOT ${result}`
            }

            return result
        }
    }

    return formatNode(tree, true)
}

export const parseQueryString = (query: string): FilterTree => {
    if (!query || query.trim() === '') {
        return createEmptyGroup(true)
    }

    const tokenize = (str: string): string[] => {
        const tokens: string[] = []
        let current = ''
        let inQuotes = false
        let quoteChar = ''

        for (let i = 0; i < str.length; i++) {
            const char = str[i]

            if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true
                quoteChar = char
                current += char
            } else if (inQuotes && char === quoteChar) {
                inQuotes = false
                current += char
            } else if (!inQuotes && /\s/.test(char)) {
                if (current.trim()) {
                    tokens.push(current.trim())
                    current = ''
                }
            } else if (!inQuotes && (char === '(' || char === ')')) {
                if (current.trim()) {
                    tokens.push(current.trim())
                    current = ''
                }
                tokens.push(char)
            } else {
                current += char
            }
        }

        if (current.trim()) {
            tokens.push(current.trim())
        }

        return tokens
    }

    const parseRule = (
        ruleStr: string,
        logicalOp?: 'AND' | 'OR' | 'NOT',
    ): Rule => {
        let actualRuleStr = ruleStr
        if (ruleStr.startsWith('NOT ')) {
            actualRuleStr = ruleStr.substring(4)
            logicalOp = 'NOT'
        }

        const operatorMap: Record<string, string> = {
            '!~=': 'not_contains',
            '~=': 'contains',
            '!=': 'is_not',
            '>=': 'greater_equal',
            '<=': 'less_equal',
            '^=': 'starts_with',
            '$=': 'ends_with',
            '>': 'greater_than',
            '<': 'less_than',
            '=': 'is',
        }

        let foundOperator = ''
        let operatorKey = ''

        // Check operators in order of length (longest first to avoid conflicts)
        const sortedOperators = Object.keys(operatorMap).sort(
            (a, b) => b.length - a.length,
        )

        for (const op of sortedOperators) {
            if (actualRuleStr.includes(op)) {
                foundOperator = op
                operatorKey = operatorMap[op]
                break
            }
        }

        if (!foundOperator) {
            foundOperator = '='
            operatorKey = 'is'
        }

        const [field, ...valueParts] = actualRuleStr.split(foundOperator)
        let value: string | number | boolean = valueParts.join(foundOperator)

        const fieldConfig = DEFAULT_FIELDS.find((f) => f.key === field.trim())
        if (fieldConfig) {
            const cleanValue = value.replace(/^["']|["']$/g, '') // Remove quotes

            switch (fieldConfig.type) {
                case 'number':
                    value = parseFloat(cleanValue) || 0
                    break
                case 'boolean':
                    value = cleanValue.toLowerCase() === 'true'
                    break
                case 'date':
                    value = cleanValue
                    break
                default:
                    value = cleanValue
            }
        }

        return {
            id: generateId(),
            type: 'rule',
            field: field.trim() || DEFAULT_FIELDS[0].key,
            operator: operatorKey,
            value: value,
            logicalOperator: logicalOp,
        }
    }

    const parseTokens = (
        tokens: string[],
        startIndex = 0,
    ): { node: Rule | RuleGroup; nextIndex: number } => {
        const children: (Rule | RuleGroup)[] = []
        let i = startIndex
        let groupCondition: 'AND' | 'OR' = 'AND'
        let groupLogicalOp: 'AND' | 'OR' | 'NOT' | undefined

        while (i < tokens.length) {
            const token = tokens[i]

            if (token === ')') {
                break
            } else if (token === '(') {
                i++
                const { node: nestedGroup, nextIndex } = parseTokens(tokens, i)

                if (children.length > 0 && i > 1) {
                    const prevToken = tokens[i - 2]
                    if (
                        prevToken === 'AND' ||
                        prevToken === 'OR' ||
                        prevToken === 'NOT'
                    ) {
                        ;(nestedGroup as RuleGroup).logicalOperator =
                            prevToken as 'AND' | 'OR' | 'NOT'
                    }
                }

                children.push(nestedGroup)
                i = nextIndex + 1
            } else if (token === 'AND' || token === 'OR' || token === 'NOT') {
                if (token !== 'NOT') {
                    groupCondition = token as 'AND' | 'OR'
                }
                i++
            } else {
                let logicalOp: 'AND' | 'OR' | 'NOT' | undefined

                if (i > 0 && children.length > 0) {
                    const prevToken = tokens[i - 1]
                    if (
                        prevToken === 'AND' ||
                        prevToken === 'OR' ||
                        prevToken === 'NOT'
                    ) {
                        logicalOp = prevToken as 'AND' | 'OR' | 'NOT'
                    }
                }

                const rule = parseRule(token, logicalOp)
                children.push(rule)
                i++
            }
        }

        // If we only have one child and it's a rule, return it directly
        if (
            children.length === 1 &&
            children[0].type === 'rule' &&
            startIndex === 0
        ) {
            return { node: children[0], nextIndex: i }
        }

        // Create group
        const group: RuleGroup = {
            id: generateId(),
            type: 'group',
            condition: groupCondition,
            children: children.length > 0 ? children : [createEmptyRule(true)],
            logicalOperator: groupLogicalOp,
        }

        return { node: group, nextIndex: i }
    }

    try {
        // Decode percent-encoded query if present (e.g., %28 => '(')
        const trimmed = query.trim()
        const decoded = /%[0-9A-Fa-f]{2}/.test(trimmed)
            ? decodeURIComponent(trimmed)
            : trimmed
        const tokens = tokenize(decoded)
        const { node } = parseTokens(tokens)

        // Ensure we return a FilterTree (RuleGroup)
        if (node.type === 'rule') {
            const group: FilterTree = createEmptyGroup(true)
            group.children = [node]
            return group
        }

        // Unwrap redundant top-level group that only wraps a single group, e.g. ( ... )
        if (
            node.type === 'group' &&
            node.children.length === 1 &&
            node.children[0].type === 'group'
        ) {
            return node.children[0] as FilterTree
        }

        return node as FilterTree
    } catch (error) {
        console.error('Failed to parse query string:', error)
        return createEmptyGroup(true)
    }
}

export const logicalOperatorOptions = [
    { label: 'AND', value: 'AND' },
    { label: 'OR', value: 'OR' },
]

export const booleanOptions = [
    { label: 'True', value: 'true' },
    { label: 'False', value: 'false' },
]
