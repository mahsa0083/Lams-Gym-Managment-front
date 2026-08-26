export default function wildCardSearch<
    T extends Record<string, string | number | boolean>,
>(list: T[], input: string, specifyKey?: keyof T | string): T[] {
    const searchText = (item: T) => {
        for (const key in item) {
            const k = (specifyKey ? (specifyKey as string) : key) as keyof T
            const value = item[k]
            if (value == null) {
                continue
            }
            if (
                value
                    .toString()
                    .toUpperCase()
                    .indexOf(input.toString().toUpperCase()) !== -1
            ) {
                return true
            }
        }
        return false
    }
    const result = list.filter((value) => searchText(value))
    return result
}
