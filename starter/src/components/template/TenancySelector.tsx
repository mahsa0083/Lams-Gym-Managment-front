import { useState, useMemo } from 'react'
import useSWR from 'swr'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import Skeleton from '@/components/ui/Skeleton'
import classNames from '@/utils/classNames'
import { apiGetTenantList } from '@/services/client/CommonService'
import { LiBuilding, LiTick, LiChevronUpDown, LiAdd } from '@/icons'
import { useRouter } from 'next/navigation'
import type { Placement } from '@floating-ui/react'
import type { ComponentProps } from 'react'

type Tenant = {
    id: string
    name: string
    slug: string
    logo: string
    role: string
    memberCount: number
    isDefault: boolean
}

type TenancySelectorProps = ComponentProps<'div'> & {
    collapsed?: boolean
    placement?: Placement
}

const TenancySelector = ({
    className,
    collapsed,
    placement = 'bottom',
}: TenancySelectorProps) => {
    const router = useRouter()

    const { data: tenants = [], isLoading } = useSWR(
        '/api/tenant/list',
        apiGetTenantList<Tenant[]>,
        {
            revalidateOnFocus: false,
        },
    )
    const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
        null,
    )

    const selectedTenant = useMemo(() => {
        if (!tenants) return null
        if (selectedTenantId) {
            return tenants.find((t) => t.id === selectedTenantId) || null
        }
        return tenants.find((t) => t.isDefault) || tenants[0] || null
    }, [tenants, selectedTenantId])

    const handleTenantSelect = (tenant: Tenant) => {
        setSelectedTenantId(tenant.id)
    }

    const handleAddWorkspace = () => {
        router.push('/apps/projects/settings/general')
    }

    const dropdownTrigger = (
        <div
            className={classNames(
                'min-w-auto rounded-lg h-10.5 shadow inset-ring-gray-200 dark:inset-ring-gray-900 dark:shadow-[inset_0px_-2px_1px_rgba(0,0,0,0.4),inset_0px_1px_1px_rgba(255,255,255,0.11)] border border-gray-200 dark:border-gray-800 flex items-center',
                collapsed
                    ? 'justify-center'
                    : 'px-2 justify-between sm:min-w-[150px]',
                !isLoading &&
                    'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                className,
            )}
        >
            <div className="flex items-center gap-2">
                {isLoading ? (
                    <Skeleton variant="circle" width={28} height={28} />
                ) : (
                    <Avatar
                        size={28}
                        src={selectedTenant?.logo}
                        icon={<LiBuilding />}
                    />
                )}
                {!collapsed &&
                    (isLoading ? (
                        <Skeleton width={120} height={12} />
                    ) : (
                        <span className="heading-text font-semibold text-base max-w-[120px] truncate hidden sm:inline-block">
                            {selectedTenant?.name || 'Select Tenant'}
                        </span>
                    ))}
            </div>
            {!collapsed && !isLoading && (
                <LiChevronUpDown className="hidden md:flex items-center heading-text " />
            )}
        </div>
    )

    return (
        <div className="sm:px-2">
            <Dropdown
                menuClass="w-[300px] mt-1"
                renderTitle={dropdownTrigger}
                placement={placement}
                disabled={isLoading}
            >
                <li className="flex flex-col">
                    {tenants?.map((tenant) => (
                        <button
                            key={tenant.id}
                            className="cursor-pointer h-12 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between rounded-lg ltr:text-left rtl:text-right outline-0"
                            onClick={() => handleTenantSelect(tenant)}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar
                                    size={28}
                                    src={tenant.logo}
                                    icon={<LiBuilding />}
                                />
                                <div className="flex flex-col">
                                    <span className="heading-text font-medium">
                                        {tenant.name}
                                    </span>
                                    <span className="text-xs">
                                        {tenant.memberCount} members
                                    </span>
                                </div>
                            </div>
                            {selectedTenant?.id === tenant.id && (
                                <LiTick className="text-primary text-lg shrink-0" />
                            )}
                        </button>
                    ))}
                </li>
                <Dropdown.Item variant="divider" />
                <Dropdown.Item
                    className="flex items-center"
                    onClick={handleAddWorkspace}
                >
                    <LiAdd />
                    <span>Add Workspace</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

export default TenancySelector
