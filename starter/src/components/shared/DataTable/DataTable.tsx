import {
    useMemo,
    useEffect,
    useState,
    useImperativeHandle,
    Fragment,
} from 'react'
import classNames from 'classnames'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import EmptyState from '../EmptyState'
import IndeterminateCheckbox from './IndeterminateCheckbox'
import TableRowSkeleton from '../loaders/TableRowSkeleton'
import Loading from '../Loading'
import DataNotFound from '@/components/svg/DataNotFound'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table'
import type {
    ColumnSort,
    ColumnDef,
    Row,
    CellContext,
    ColumnPinningState,
    Table as TanstackTable,
} from '@tanstack/react-table'
import uniqueId from 'lodash/uniqueId'
import type { TableProps } from '@/components/ui/Table'
import type { SkeletonProps } from '@/components/ui/Skeleton'
import type { Ref, ReactNode } from 'react'

export type OnSortParam = {
    sortOrder: 'asc' | 'desc' | ''
    sortKey: string | number
}

type DataTableProps<T> = {
    columns: ColumnDef<T>[]
    customNoDataIcon?: ReactNode
    data?: T[]
    loading?: boolean
    noData?: boolean
    onRowSelect?: (checked: boolean, row: T) => void
    onAllRowSelect?: (checked: boolean, rows: Row<T>[]) => void
    onPaginationChange?: (page: number) => void
    onPageSizeChange?: (num: number) => void
    onSort?: (sort: OnSortParam) => void
    columnPinning?: ColumnPinningState
    children?: (props: { table: TanstackTable<T> }) => ReactNode
    pageSizes?: number[]
    selectable?: boolean
    skeletonAvatarColumns?: number[]
    skeletonAvatarProps?: SkeletonProps
    pagingData?: {
        total: number
        pageIndex: number
        pageSize: number
    }
    checkboxChecked?: (row: T) => boolean
    indeterminateCheckboxChecked?: (row: Row<T>[]) => boolean
    ref?: Ref<DataTableResetHandle | HTMLTableElement>
} & TableProps

const { Tr, Th, Td, THead, TBody, Sorter } = Table

export type DataTableResetHandle = {
    resetSorting: () => void
    resetSelected: () => void
}

function DataTable<T>(props: DataTableProps<T>) {
    const {
        skeletonAvatarColumns,
        columns: columnsProp = [],
        data = [],
        customNoDataIcon,
        columnPinning,
        children,
        loading,
        noData,
        onRowSelect,
        onAllRowSelect,
        onPaginationChange,
        onPageSizeChange,
        onSort,
        pageSizes = [10, 25, 50, 100],
        selectable = false,
        skeletonAvatarProps,
        pagingData = {
            total: 0,
            pageIndex: 1,
            pageSize: 10,
        },
        checkboxChecked,
        indeterminateCheckboxChecked,
        ref,
        ...rest
    } = props

    const { pageSize, pageIndex, total } = pagingData

    const [sorting, setSorting] = useState<ColumnSort[] | null>(null)

    const pageSizeOption = useMemo(
        () =>
            pageSizes.map((number) => ({
                value: number,
                label: `${number} / page`,
            })),
        [pageSizes],
    )

    useEffect(() => {
        if (Array.isArray(sorting)) {
            const sortOrder =
                sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : ''
            const id = sorting.length > 0 ? sorting[0].id : ''
            onSort?.({ sortOrder, sortKey: id })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sorting])

    const handleIndeterminateCheckBoxChange = (
        checked: boolean,
        rows: Row<T>[],
    ) => {
        if (!loading) {
            onAllRowSelect?.(checked, rows)
        }
    }

    const handleCheckBoxChange = (checked: boolean, row: T) => {
        if (!loading) {
            onRowSelect?.(checked, row)
        }
    }

    const finalColumns: ColumnDef<T>[] = useMemo(() => {
        const columns = columnsProp

        if (selectable) {
            return [
                {
                    id: uniqueId('data-table-indeterminate-checkbox'),
                    maxSize: 30,
                    header: ({ table }) => (
                        <div className="flex justify-center">
                            <IndeterminateCheckbox
                                checked={
                                    indeterminateCheckboxChecked
                                        ? indeterminateCheckboxChecked(
                                              table.getRowModel().rows,
                                          )
                                        : table.getIsAllRowsSelected()
                                }
                                indeterminate={table.getIsSomeRowsSelected()}
                                onChange={table.getToggleAllRowsSelectedHandler()}
                                onAllRowSelect={(e) => {
                                    handleIndeterminateCheckBoxChange(
                                        e.target.checked,
                                        table.getRowModel().rows,
                                    )
                                }}
                            />
                        </div>
                    ),
                    cell: ({ row }) => (
                        <div className="flex justify-center">
                            <IndeterminateCheckbox
                                checked={
                                    checkboxChecked
                                        ? checkboxChecked(row.original)
                                        : row.getIsSelected()
                                }
                                disabled={!row.getCanSelect()}
                                indeterminate={row.getIsSomeSelected()}
                                onChange={row.getToggleSelectedHandler()}
                                onRowSelect={(e) =>
                                    handleCheckBoxChange(
                                        e.target.checked,
                                        row.original,
                                    )
                                }
                            />
                        </div>
                    ),
                },
                ...columns,
            ]
        }
        return columns
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnsProp, selectable, loading, checkboxChecked])

    const table = useReactTable<T>({
        data,
        columns: finalColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        onSortingChange: (sorter) => {
            setSorting(sorter as ColumnSort[])
        },
        state: {
            sorting: sorting as ColumnSort[],
            pagination: {
                pageIndex,
                pageSize,
            },
            ...(columnPinning && { columnPinning }),
        },
    })

    const resetSorting = () => {
        table.resetSorting()
    }

    const resetSelected = () => {
        table.resetRowSelection(true)
    }

    useEffect(() => {
        table.resetRowSelection(true)
    }, [data, table])

    useImperativeHandle(ref, () => ({
        resetSorting,
        resetSelected,
    }))

    const handlePaginationChange = (page: number) => {
        if (!loading) {
            resetSelected()
            onPaginationChange?.(page)
        }
    }

    const handleSelectChange = (value?: number) => {
        if (!loading) {
            onPageSizeChange?.(Number(value))
        }
    }

    const renderTable = () => (
        <Table {...rest}>
            <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <Fragment key={headerGroup.id}>
                        <Tr>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className={classNames(
                                            header.column.getCanSort() &&
                                                'cursor-pointer select-none point',
                                            loading && 'pointer-events-none',
                                        )}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={classNames(
                                                    header.column.getCanSort() &&
                                                        'flex items-center gap-1',
                                                )}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getCanSort() && (
                                                    <Sorter
                                                        sort={header.column.getIsSorted()}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </Th>
                                )
                            })}
                        </Tr>
                    </Fragment>
                ))}
            </THead>
            {loading && data.length === 0 ? (
                <TableRowSkeleton
                    columns={(finalColumns as Array<T>).length}
                    rows={pagingData.pageSize}
                    avatarInColumns={skeletonAvatarColumns}
                    avatarProps={skeletonAvatarProps}
                />
            ) : (
                <TBody>
                    {noData ? (
                        <Tr>
                            <Td
                                className="hover:bg-transparent"
                                colSpan={finalColumns.length}
                            >
                                <div className="flex flex-col items-center gap-4">
                                    {customNoDataIcon ? (
                                        customNoDataIcon
                                    ) : (
                                        <EmptyState
                                            variant="grid"
                                            size={240}
                                            illustration={
                                                <div className="size-48 rounded-full bg-radial from-white dark:from-gray-900 via-transparent via-90% flex items-center justify-center">
                                                    <DataNotFound
                                                        height={100}
                                                        width={100}
                                                    />
                                                </div>
                                            }
                                            offset={-40}
                                        >
                                            <span className="text-lg heading-text">
                                                No data found!
                                            </span>
                                        </EmptyState>
                                    )}
                                </div>
                            </Td>
                        </Tr>
                    ) : (
                        table
                            .getRowModel()
                            .rows.slice(0, pageSize)
                            .map((row) => {
                                return (
                                    <Tr key={row.id}>
                                        {row.getVisibleCells().map((cell) => {
                                            return (
                                                <Td
                                                    key={cell.id}
                                                    style={{
                                                        width: cell.column.getSize(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext(),
                                                    )}
                                                </Td>
                                            )
                                        })}
                                    </Tr>
                                )
                            })
                    )}
                </TBody>
            )}
        </Table>
    )

    return (
        <Loading loading={Boolean(loading && data.length !== 0)} type="cover">
            {children ? children({ table }) : renderTable()}
            <div className="flex items-center justify-between mt-4 px-2">
                <Pagination
                    pageSize={pageSize}
                    currentPage={pageIndex}
                    total={total}
                    onChange={handlePaginationChange}
                />
                <div>
                    <Select
                        size="sm"
                        className="w-[120px]"
                        placement="top"
                        isSearchable={false}
                        value={pageSizeOption.find(
                            (option) => option.value === pageSize,
                        )}
                        options={pageSizeOption}
                        onChange={(option) => handleSelectChange(option?.value)}
                    />
                </div>
            </div>
        </Loading>
    )
}

export type { ColumnDef, Row, CellContext }
export default DataTable
