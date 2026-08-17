import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/shared/lib/seo'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin',
                    '/*/admin',
                    '/dashboard',
                    '/*/dashboard',
                    '/login',
                    '/*/login',
                    '/signup',
                    '/*/signup',
                    '/forgot-password',
                    '/*/forgot-password',
                    '/update-password',
                    '/*/update-password',
                    '/check-email',
                    '/*/check-email',
                    '/api/',
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
