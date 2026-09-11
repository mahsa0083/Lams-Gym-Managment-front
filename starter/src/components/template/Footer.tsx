import Container from '@/components/shared/Container'
import classNames from '@/utils/classNames'
import { APP_NAME } from '@/constants/app.constant'
import { PAGE_CONTAINER_GUTTER_X } from '@/constants/theme.constant'
import Link from 'next/link'

export type FooterPageContainerType = 'gutterless' | 'contained'

// تعریف دقیق این تایپ در همین فایل باعث رفع مشکل می‌شود
type FooterProps = {
    pageContainerType?: FooterPageContainerType
    className?: string
}

const FooterContent = () => {
    return (
        <div className="flex items-center justify-between flex-auto w-full">
            {/* بخش سمت چپ: لینک لوگو و نام گروه */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img 
                    src="/img/lamisene-logo.png" 
                    alt="Lamisene Logo" 
                    className="h-8 w-auto object-contain" 
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    گروه فناوری Lamisene
                </span>
            </Link>

            {/* بخش سمت راست: لینک‌های کمکی */}
            <div className="text-sm">
                <Link
                    className="text-gray-500 hover:text-gray-700"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    شرایط و ضوابط
                </Link>
                <span className="mx-2 text-muted"> | </span>
                <Link
                    className="text-gray-500 hover:text-gray-700"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    حریم خصوصی
                </Link>
            </div>
        </div>
    )
}

export default function Footer({
    pageContainerType = 'contained',
    className,
}: FooterProps) {
    return (
        <footer
            className={classNames(
                `footer flex flex-auto items-center h-16 ${PAGE_CONTAINER_GUTTER_X}`,
                className,
            )}
        >
            {pageContainerType === 'contained' ? (
                <Container>
                    <FooterContent />
                </Container>
            ) : (
                <FooterContent />
            )}
        </footer>
    )
}
