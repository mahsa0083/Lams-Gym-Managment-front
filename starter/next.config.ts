import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                // protocol: 'https',
                // hostname: 'images.unsplash.com',
                // port: '',
                // pathname: '/**',
                protocol: 'https',
        hostname: 'images.unsplash.com',
            },
        ],
    },
    /* سایر تنظیمات پروژه در صورت نیاز */
};



const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);