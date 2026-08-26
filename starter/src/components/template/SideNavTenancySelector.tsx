import TenancySelector from './TenancySelector'
import useTheme from '@/utils/hooks/useTheme'

const SideNavTenancySelector = () => {
    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    return (
        <TenancySelector
            className="bg-white dark:bg-white/10"
            collapsed={sideNavCollapse}
            placement="bottom-start"
        />
    )
}

export default SideNavTenancySelector
