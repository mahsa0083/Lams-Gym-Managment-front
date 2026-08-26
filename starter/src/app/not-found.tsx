'use client'

import Container from '@/components/shared/Container'
import PageNotFound from '@/components/svg/PageNotFound'

const NotFound = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <Container className="h-full">
                <div className="h-full flex flex-col items-center justify-center">
                    <div className="text-center">
                        <PageNotFound height={320} width={312} />
                        <h3>Not Found!</h3>
                        <p className="text-base mt-2">
                            The page you are looking for does not exist!
                        </p>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default NotFound
