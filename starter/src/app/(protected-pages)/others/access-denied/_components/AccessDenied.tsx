import Container from '@/components/shared/Container'
import EmptyState from '@/components/shared/EmptyState'
import Shield from '@/components/svg/Shield'

const AccessDenied = () => {
    return (
        <Container className="h-full">
            <div className="h-full flex flex-col items-center justify-center">
                <EmptyState
                    size={250}
                    variant="grid"
                    offset={20}
                    illustration={
                        <div className="bg-white dark:bg-gray-900 shadow-white-xl rounded-full p-2">
                            <Shield height={120} width={120} />
                        </div>
                    }
                >
                    <div className="text-center">
                        <h3>Access Denied!</h3>
                        <p className="text-base">
                            You have no permission to visit this page
                        </p>
                    </div>
                </EmptyState>
            </div>
        </Container>
    )
}

export default AccessDenied
