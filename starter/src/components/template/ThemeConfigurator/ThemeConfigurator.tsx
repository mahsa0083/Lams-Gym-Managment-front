import ModeSwitcher from './ModeSwitcher'
import LayoutSwitcher from './LayoutSwitcher'
import ColorSchemeSwitcher from './ColorSchemeSwitcher'
import DirectionSwitcher from './DirectionSwitcher'
import CopyButton from './CopyButton'

export type ThemeConfiguratorProps = {
    callBackClose?: () => void
}

const ThemeConfigurator = ({ callBackClose }: ThemeConfiguratorProps) => {
    return (
        <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col gap-y-10 mb-8">
                <div className="space-y-4">
                    <div>
                        <h6>Display Mode</h6>
                        <span>Select Light, Dark, or System default</span>
                    </div>
                    <ModeSwitcher wrapperClass="max-w-[300px] sm:max-w-[370px] gap-2" />
                </div>
                <div>
                    <h6 className="mb-2">Color Scheme</h6>
                    <ColorSchemeSwitcher />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h6>Direction</h6>
                        <span>Select a direction</span>
                    </div>
                    <DirectionSwitcher callBackClose={callBackClose} />
                </div>

                <div className="space-y-4">
                    <div>
                        <h6>Display Mode</h6>
                        <span>Switch between different layout structures</span>
                    </div>
                    <LayoutSwitcher wrapperClass="max-w-[300px] sm:max-w-[370px] gap-x-2 gap-y-4" />
                </div>
            </div>
            <div>
                <CopyButton />
            </div>
        </div>
    )
}

export default ThemeConfigurator
