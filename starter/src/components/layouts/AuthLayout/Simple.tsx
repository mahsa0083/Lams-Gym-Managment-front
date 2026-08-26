import Container from '@/components/shared/Container'
import type { CommonProps } from '@/@types/common'

const Simple = ({ children }: CommonProps) => {
    return (
        <div className="h-full bg-white dark:bg-gray-900 flex-1">
            <Container className="flex flex-col flex-auto items-center justify-center min-w-0  min-h-screen">
                <div className="min-w-[320px] md:min-w-[400px] max-w-[400px]">
                    <div>{children}</div>
                </div>
            </Container>
        </div>
    )
}

export default Simple
