import authRoute from './authRoute'
import othersRoute from './othersRoute'

import type { Routes } from '@/@types/routes'

const homeRoute: Routes = {
    '/home': {
        key: 'home',
        authority: [],
    },
}

/** Example purpose only, please remove */
const demoRoutes: Routes = {
    '/single-menu-view': {
        key: 'singleMenuItem',
        authority: [],
    },
    '/collapse-menu-item-view-1': {
        key: 'collapseMenu.item1',
        authority: [],
    },
    '/collapse-menu-item-view-2': {
        key: 'collapseMenu.item2',
        authority: [],
    },
    '/group-single-menu-item-view': {
        key: 'groupMenu.single',
        authority: [],
    },
    '/group-collapse-menu-item-view-1': {
        key: 'groupMenu.collapse.item1',
        authority: [],
    },
    '/group-collapse-menu-item-view-2': {
        key: 'groupMenu.collapse.item2',
        authority: [],
    },
}

export const protectedRoutes: Routes = {
    ...homeRoute,
    ...demoRoutes,
    ...othersRoute,
}

export const publicRoutes: Routes = {}

export const authRoutes = authRoute
