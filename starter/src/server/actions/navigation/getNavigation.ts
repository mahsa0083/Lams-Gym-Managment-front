import navigationConfig from '@/configs/navigation.config'

export async function getNavigation() {
    // If the navigation data is stored in a database or API in your application, you can fetch navigation data here
    return navigationConfig
}
