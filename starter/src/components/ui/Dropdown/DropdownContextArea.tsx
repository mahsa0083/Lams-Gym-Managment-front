import { useState, useRef, useEffect, useImperativeHandle } from 'react'
import MenuContext from './context/menuContext'
import classNames from '../utils/classNames'
import { useConfig } from '../ConfigProvider'
import {
    autoUpdate,
    flip,
    FloatingFocusManager,
    FloatingList,
    FloatingNode,
    FloatingPortal,
    shift,
    useClick,
    useHover,
    useDismiss,
    useFloating,
    useFloatingNodeId,
    useFloatingParentNodeId,
    useFloatingTree,
    useInteractions,
    useListNavigation,
    useRole,
    useTypeahead,
    useTransitionStyles,
    safePolygon,
} from '@floating-ui/react'
import transition from '../utils/transitions'
import type { CommonProps } from '../@types/common'
import type { DropdownToggleSharedProps } from './DropdownToggle'
import type { DropdownSubItemSharedProps } from './DropdownSubItem'
import type { Placement } from '@floating-ui/react'
import type { ReactNode, HTMLProps, Ref } from 'react'
import useMergeRef from '../hooks/useMergeRef'

export interface DropdownContextAreaProps
    extends
        CommonProps,
        Omit<DropdownToggleSharedProps, 'toggleClassName'>,
        DropdownSubItemSharedProps {
    activeKey?: string
    menuClass?: string
    placement?: Placement
    onOpen?: (bool: boolean) => void
    ref?: Ref<HTMLElement | DropdownContextAreaRef>
    areaContent: ReactNode
    areaClass?: string
    areaRef?: Ref<HTMLDivElement>
}

export type DropdownContextAreaRef = {
    handleDropdownOpen: () => void
    handleDropdownClose: () => void
}

const DropdownContextArea = (
    props: DropdownContextAreaProps & HTMLProps<HTMLElement>,
) => {
    const {
        children,
        disabled,
        menuClass,
        placement,
        onOpen,
        areaContent,
        areaClass,
        ref,
        areaRef = null,
    } = props

    const [isOpen, setIsOpen] = useState(false)
    const setHasFocusInside = useState(false)[1]
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const setCoords = useState({ x: 0, y: 0 })[1]

    const areaInnerRef = useRef<HTMLDivElement | null>(null)

    const elementsRef = useRef<Array<HTMLElement | null>>([])
    const labelsRef = useRef<Array<string | null>>([])

    const { direction } = useConfig()

    const tree = useFloatingTree()
    const nodeId = useFloatingNodeId()
    const parentId = useFloatingParentNodeId()

    const isNested = parentId != null

    const contentAreaRef = useMergeRef(areaInnerRef, areaRef)

    const handleOpen = (open: boolean) => {
        if (disabled) {
            return
        }
        setIsOpen(open)
        onOpen?.(open)
    }

    const getDefaultPlacement = () => {
        return direction === 'ltr' ? 'bottom-start' : 'bottom-end'
    }

    const getNestedDefaultPlacement = () => {
        return direction === 'ltr' ? 'right-start' : 'left-start'
    }

    const { floatingStyles, refs, context } = useFloating<HTMLElement>({
        nodeId,
        open: isOpen,
        onOpenChange: (open) => {
            handleOpen(open)
        },
        placement:
            placement ||
            (isNested ? getNestedDefaultPlacement() : getDefaultPlacement()),
        middleware: [flip(), shift()],
        whileElementsMounted: autoUpdate,
    })

    const { isMounted, styles } = useTransitionStyles(context, {
        duration: 200,
        ...transition(context.placement),
    })

    const hover = useHover(context, {
        enabled: isNested,
        delay: { open: 75 },
        handleClose: safePolygon({ blockPointerEvents: true }),
    })

    const click = useClick(context, {
        event: 'mousedown',
        toggle: !isNested,
        ignoreMouse: isNested,
    })

    const role = useRole(context, { role: 'menu' })

    const dismiss = useDismiss(context, { bubbles: true })

    const listNavigation = useListNavigation(context, {
        listRef: elementsRef,
        activeIndex,
        nested: isNested,
        onNavigate: setActiveIndex,
    })
    const typeahead = useTypeahead(context, {
        listRef: labelsRef,
        onMatch: isOpen ? setActiveIndex : undefined,
        activeIndex,
    })

    const { getFloatingProps, getItemProps } = useInteractions([
        hover,
        role,
        dismiss,
        listNavigation,
        typeahead,
        ...[click],
    ])

    useEffect(() => {
        if (!tree) return

        function handleTreeClick() {
            setIsOpen(false)
            onOpen?.(false)
        }

        function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
            if (event.nodeId !== nodeId && event.parentId === parentId) {
                setIsOpen(false)
                onOpen?.(false)
            }
        }

        tree.events.on('click', handleTreeClick)
        tree.events.on('menuopen', onSubMenuOpen)

        return () => {
            tree.events.off('click', handleTreeClick)
            tree.events.off('menuopen', onSubMenuOpen)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tree, nodeId, parentId])

    useEffect(() => {
        if (isOpen && tree) {
            tree.events.emit('menuopen', { parentId, nodeId })
        }
    }, [tree, isOpen, nodeId, parentId])

    const handleContextMenu = (e: React.MouseEvent) => {
        if (
            areaInnerRef.current &&
            areaInnerRef.current.contains(e.target as Node)
        ) {
            e.preventDefault()
            setCoords({ x: e.clientX, y: e.clientY })
            refs.setReference({
                getBoundingClientRect: () =>
                    ({
                        x: e.clientX,
                        y: e.clientY,
                        width: 0,
                        height: 0,
                        top: e.clientY,
                        left: e.clientX,
                        bottom: e.clientY,
                        right: e.clientX,
                    }) as DOMRect,
            })
            setIsOpen(true)
        }
    }

    useImperativeHandle(ref, () => {
        return {
            handleDropdownOpen: () => {
                setIsOpen(true)
                onOpen?.(true)
            },
            handleDropdownClose: () => {
                setIsOpen(false)
                onOpen?.(false)
            },
        }
    }, [onOpen])

    return (
        <FloatingNode id={nodeId}>
            <MenuContext.Provider
                value={{
                    activeIndex,
                    setActiveIndex,
                    getItemProps,
                    setHasFocusInside,
                    isOpen,
                }}
            >
                <div
                    ref={contentAreaRef}
                    onContextMenu={handleContextMenu}
                    className={areaClass}
                >
                    {areaContent}
                </div>
                <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                    {isMounted && (
                        <FloatingPortal>
                            <FloatingFocusManager
                                context={context}
                                modal={false}
                                initialFocus={isNested ? -1 : 0}
                                returnFocus={!isNested}
                            >
                                <div
                                    ref={refs.setFloating}
                                    style={floatingStyles}
                                    {...getFloatingProps()}
                                    className="dropdown-menu-wrapper"
                                >
                                    <ul
                                        className={classNames(
                                            'dropdown-menu',
                                            menuClass,
                                        )}
                                        style={styles}
                                    >
                                        {children}
                                    </ul>
                                </div>
                            </FloatingFocusManager>
                        </FloatingPortal>
                    )}
                </FloatingList>
            </MenuContext.Provider>
        </FloatingNode>
    )
}

export default DropdownContextArea
