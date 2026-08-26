'use client';

import React, { useState, useEffect, Fragment } from 'react';
import Menu from '@/components/ui/Menu';
import VerticalSingleMenuItem from './VerticalSingleMenuItem';
import VerticalCollapsedMenuItem from './VerticalCollapsedMenuItem';
import { themeConfig } from '@/configs/theme.config';
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant';
import useMenuActive from '@/utils/hooks/useMenuActive';
import useTranslation from '@/utils/hooks/useTranslation';
import { Direction } from '@/@types/theme';
import type { NavigationTree } from '@/@types/navigation';
import type { TranslationFn } from '@/@types/common';

export interface VerticalMenuContentProps {
    collapsed?: boolean;
    routeKey: string;
    navigationTree?: NavigationTree[];
    onMenuItemClick?: () => void;
    direction?: Direction;
    translationSetup?: boolean;
    userAuthority: string[];
    menuVariant?: 'default' | 'subtle';
}

const { MenuGroup } = Menu;
const MAX_CASCADE_LEVEL = 2;

const filterNavigationByAuthority = (
    navTree: NavigationTree[],
    userAuthority: string[] = [],
): NavigationTree[] => {
    return navTree
        .filter((nav) => {
            if (!nav.authority || nav.authority.length === 0) {
                return true;
            }
            return nav.authority.some((role) => userAuthority.includes(role));
        })
        .map((nav) => {
            if (nav.subMenu && nav.subMenu.length > 0) {
                return {
                    ...nav,
                    subMenu: filterNavigationByAuthority(nav.subMenu, userAuthority),
                };
            }
            return nav;
        });
};

const VerticalMenuContent = (props: VerticalMenuContentProps) => {
    const {
        collapsed,
        routeKey,
        navigationTree = [],
        onMenuItemClick,
        direction = themeConfig.direction,
        translationSetup,
        userAuthority,
        menuVariant,
    } = props;

    const translationPlaceholder = (key: string, fallback?: string) => {
        return fallback || key;
    };

    const t = (
        translationSetup ? useTranslation() : translationPlaceholder
    ) as TranslationFn;

    const [defaulExpandKey, setDefaulExpandKey] = useState<string[]>([]);

    const filteredNavTree = filterNavigationByAuthority(
        navigationTree,
        userAuthority,
    );

    const { activedRoute } = useMenuActive(filteredNavTree, routeKey);

    useEffect(() => {
        if (activedRoute?.parentKey) {
            setDefaulExpandKey([activedRoute?.parentKey]);
        }
    }, [activedRoute?.parentKey]);

    const handleLinkClick = () => {
        onMenuItemClick?.();
    };

    const renderNavigation = (
        navTree: NavigationTree[],
        cascade: number = 0,
        parentType?: 'item' | 'collapse' | 'title',
    ) => {
        const nextCascade = cascade + 1;

        return (
            <>
                {navTree.map((nav) => (
                    <Fragment key={nav.key}>
                        {nav.type === NAV_ITEM_TYPE_ITEM && (
                            <VerticalSingleMenuItem
                                key={nav.key}
                                currentKey={activedRoute?.key}
                                parentKeys={defaulExpandKey}
                                nav={nav}
                                sideCollapsed={collapsed}
                                direction={direction}
                                hierarchyIndicator={parentType === 'collapse'}
                                renderAsIcon={cascade <= 0}
                                showIcon={cascade <= 0}
                                userAuthority={userAuthority}
                                showTitle={
                                    collapsed
                                        ? cascade >= 1
                                        : cascade <= MAX_CASCADE_LEVEL
                                }
                                t={t as TranslationFn}
                                onLinkClick={handleLinkClick}
                            />
                        )}
                        {nav.type === NAV_ITEM_TYPE_COLLAPSE && (
                            <VerticalCollapsedMenuItem
                                key={nav.key}
                                currentKey={activedRoute?.key}
                                parentKeys={defaulExpandKey}
                                nav={nav}
                                sideCollapsed={collapsed}
                                direction={direction}
                                indent={false}
                                hierarchyIndicator={
                                    nextCascade >= MAX_CASCADE_LEVEL
                                }
                                renderAsIcon={nextCascade <= 1}
                                t={t as TranslationFn}
                                onLinkClick={onMenuItemClick}
                            >
                                {nav.subMenu &&
                                    nav.subMenu.length > 0 &&
                                    renderNavigation(
                                        nav.subMenu,
                                        nextCascade,
                                        'collapse',
                                    )}
                            </VerticalCollapsedMenuItem>
                        )}
                        {nav.type === NAV_ITEM_TYPE_TITLE && (
                            <MenuGroup
                                key={nav.key}
                                label={t(nav.translateKey, nav.title)}
                            >
                                {nav.subMenu &&
                                    nav.subMenu.length > 0 &&
                                    renderNavigation(
                                        nav.subMenu,
                                        cascade,
                                        'title',
                                    )}
                            </MenuGroup>
                        )}
                    </Fragment>
                ))}
            </>
        );
    };

    return (
        <Menu
            className="px-2 pb-2"
            sideCollapsed={collapsed}
            defaultActiveKeys={activedRoute?.key ? [activedRoute.key] : []}
            defaultExpandedKeys={defaulExpandKey}
            defaultCollapseActiveKeys={
                activedRoute?.parentKey ? [activedRoute.parentKey] : []
            }
            variant={menuVariant}
        >
            {renderNavigation(filteredNavTree, 0)}
        </Menu>
    );
};

export default VerticalMenuContent;