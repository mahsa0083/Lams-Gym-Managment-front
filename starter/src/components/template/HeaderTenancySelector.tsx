import TenancySelector from './TenancySelector'
import useTheme from '@/utils/hooks/useTheme'

const HeaderTenancySelector = ({ className }: { className?: string }) => {
    const direction = useTheme((state) => state.direction)

    const placement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

    return <TenancySelector placement={placement} className={className} />
}

export default HeaderTenancySelector
